"""Vision provider integration (isolated). Currently implements Google Gemini via google-genai.

To swap providers, replace `_call_gemini` and keep the `classify_image` contract:
returns a validated ClassificationResult with source="ai", or raises AIError.
Never log the API key or image bytes.
"""
from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

from ..config import Settings
from ..models import Category, ClassificationResult
from .disposal_knowledge import LOCAL_NOTICE, get_guidance, normalize_category

logger = logging.getLogger("binvision.ai")

PROMPT = """You are a cautious waste-sorting assistant. Look at the photo and identify the single main item.
Only describe what is visible. Do not invent facts that cannot be inferred from the photograph.
Do not mention any specific local facility, collection schedule, or municipal rule.
If the image is blurry, obscured, shows several unrelated items, or you cannot identify the item reliably, set "uncertain" to true and use category "unknown".
Be conservative with batteries, electronics, broken glass, chemical containers, medical waste, sharp objects, pressurised containers, unknown liquids and contaminated packaging: mention a safety concern in "warning".

Respond with ONLY a JSON object with these keys:
- "item_name": short name of the visible item
- "category": one of paper_cardboard, plastic, metal, glass, organic, ewaste, batteries_hazardous, residual, textile, unknown
- "material": likely material composition, in a few words
- "reason": one or two sentences explaining why this category fits, based on what is visible
- "warning": a short safety warning string, or null if none
- "uncertain": true or false
"""


class AIError(Exception):
    """Provider failure. `kind` is one of: not_configured, auth, rate_limit, timeout,
    unavailable, bad_request, malformed."""

    def __init__(self, kind: str, message: str):
        super().__init__(message)
        self.kind = kind
        self.message = message


_RETRYABLE = {"rate_limit", "timeout", "unavailable"}


def _call_gemini(settings: Settings, image_bytes: bytes, mime_type: str) -> str:
    try:
        from google import genai
        from google.genai import errors, types
    except ImportError as exc:  # pragma: no cover - depends on environment
        raise AIError("not_configured", "google-genai SDK is not installed") from exc

    client = genai.Client(
        api_key=settings.ai_api_key,
        http_options=types.HttpOptions(timeout=int(settings.ai_timeout_seconds * 1000)),
    )
    try:
        response = client.models.generate_content(
            model=settings.ai_model,
            contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type), PROMPT],
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2),
        )
    except errors.APIError as exc:
        code = getattr(exc, "code", None)
        if code in (401, 403):
            raise AIError("auth", "The AI provider rejected the API key or access was denied.") from exc
        if code == 429:
            raise AIError("rate_limit", "The AI provider rate limit or quota was reached.") from exc
        if code == 400:
            raise AIError("bad_request", "The AI provider could not process this request or model.") from exc
        if code == 404:
            raise AIError("bad_request", "The configured AI model was not found.") from exc
        raise AIError("unavailable", "The AI provider is temporarily unavailable.") from exc
    except Exception as exc:  # network errors, timeouts
        name = type(exc).__name__.lower()
        if "timeout" in name or "timeout" in str(exc).lower():
            raise AIError("timeout", "The AI provider did not respond in time.") from exc
        raise AIError("unavailable", "Could not reach the AI provider.") from exc

    text = getattr(response, "text", None)
    if not text:
        raise AIError("malformed", "The AI provider returned an empty or blocked response.")
    return text


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise AIError("malformed", "The AI response was not valid JSON.")
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise AIError("malformed", "The AI response was not valid JSON.") from exc
    if not isinstance(data, dict):
        raise AIError("malformed", "The AI response had an unexpected shape.")
    return data


def _clip(value: Any, limit: int, default: str) -> str:
    if not isinstance(value, str) or not value.strip():
        return default
    return value.strip()[:limit]


def parse_ai_output(text: str) -> ClassificationResult:
    """Validate provider output and merge it with the curated knowledge base.

    Only item name, material, reason, warning and uncertainty come from the model. Preparation
    steps and the disposal route always come from the knowledge base so the model cannot invent
    facilities, schedules or regulations. Confidence is always None: the model's self-reported
    certainty is not a calibrated probability.
    """
    data = _extract_json(text)
    category = normalize_category(data.get("category"))
    guidance = get_guidance(category)

    uncertain = bool(data.get("uncertain", False)) or category == Category.UNKNOWN

    ai_warning = data.get("warning")
    ai_warning = ai_warning.strip()[:300] if isinstance(ai_warning, str) and ai_warning.strip() else None
    if ai_warning and ai_warning.lower() in {"none", "null", "n/a"}:
        ai_warning = None
    warnings = [w for w in (guidance.safety, ai_warning) if w]
    warning = " ".join(dict.fromkeys(warnings)) or None

    reason = _clip(data.get("reason"), 400, f"The item appears to match the {guidance.label} category.")
    if uncertain:
        reason += " The result is uncertain; try a clearer photo or choose the category manually."

    return ClassificationResult(
        item_name=_clip(data.get("item_name"), 80, "Unidentified item"),
        category=category,
        material=_clip(data.get("material"), 80, "Not determined"),
        confidence=None,
        preparation_steps=list(guidance.preparation_steps),
        disposal_instruction=guidance.disposal_route,
        reason=reason,
        warning=warning,
        uncertain=uncertain,
        source="ai",
        local_rules_notice=LOCAL_NOTICE,
    )


def classify_image(settings: Settings, image_bytes: bytes, mime_type: str) -> ClassificationResult:
    """Classify with the configured provider. Bounded retries; raises AIError on failure."""
    if not settings.ai_configured:
        raise AIError("not_configured", "No AI provider is configured.")
    if settings.ai_provider != "gemini":
        raise AIError("not_configured", f"Unsupported AI provider '{settings.ai_provider}'.")

    attempts = 1 + settings.ai_max_retries
    last: AIError | None = None
    for attempt in range(attempts):
        try:
            text = _call_gemini(settings, image_bytes, mime_type)
            return parse_ai_output(text)
        except AIError as exc:
            last = exc
            logger.warning("AI attempt %d/%d failed: %s", attempt + 1, attempts, exc.kind)
            if exc.kind not in _RETRYABLE or attempt == attempts - 1:
                break
            time.sleep(min(2.0, 0.5 * (attempt + 1)))
    assert last is not None
    raise last
