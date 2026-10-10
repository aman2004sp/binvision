"""HTTP routes for BinVision."""
from __future__ import annotations

import io
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from ..config import get_settings
from ..models import (
    Category,
    CategoryGuidance,
    ClassificationResult,
    HealthResponse,
    KnowledgeBase,
)
from ..services import ai_classifier, disposal_knowledge, fallback_classifier
from ..services.ai_classifier import AIError

logger = logging.getLogger("binvision.api")
router = APIRouter(prefix="/api")

ALLOWED_FORMATS = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
MAX_PIXELS = 50_000_000

_FALLBACK_MESSAGES = {
    "not_configured": "AI classification is not configured on this server.",
    "auth": "The AI provider rejected the server's credentials.",
    "rate_limit": "The AI provider's rate limit or quota was reached. Try again later.",
    "timeout": "The AI provider took too long to respond.",
    "unavailable": "The AI provider is currently unreachable.",
    "bad_request": "The AI provider could not process this request.",
    "malformed": "The AI provider returned a response BinVision could not use.",
}


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(ai_available=settings.ai_configured, version=disposal_knowledge.KB_VERSION)


@router.get("/categories", response_model=list[CategoryGuidance])
def categories() -> list[CategoryGuidance]:
    return disposal_knowledge.get_knowledge_base().categories


@router.get("/knowledge", response_model=KnowledgeBase)
def knowledge() -> KnowledgeBase:
    return disposal_knowledge.get_knowledge_base()


@router.get("/guidance/{category}", response_model=ClassificationResult)
def guidance(category: Category) -> ClassificationResult:
    """Manual/demo mode: knowledge-base guidance for a user-selected category. No AI involved."""
    return fallback_classifier.demo_result_for_category(category)


def _validate_image(data: bytes) -> str:
    """Return the mime type detected from the actual image content."""
    try:
        with Image.open(io.BytesIO(data)) as probe:
            fmt = (probe.format or "").upper()
            width, height = probe.size
            probe.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise HTTPException(status_code=400, detail="The file is not a valid image.")
    if fmt not in ALLOWED_FORMATS:
        raise HTTPException(status_code=415, detail="Unsupported image type. Use JPEG, PNG or WebP.")
    if width * height > MAX_PIXELS:
        raise HTTPException(status_code=413, detail="The image dimensions are too large.")
    return ALLOWED_FORMATS[fmt]


@router.post("/classify", response_model=ClassificationResult)
def classify(image: UploadFile = File(...)) -> ClassificationResult:
    settings = get_settings()

    if image.content_type not in set(ALLOWED_FORMATS.values()):
        raise HTTPException(status_code=415, detail="Unsupported file type. Use JPEG, PNG or WebP.")

    data = image.file.read(settings.max_upload_bytes + 1)
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413, detail=f"The image is larger than {settings.max_upload_mb} MB."
        )

    mime_type = _validate_image(data)

    try:
        return ai_classifier.classify_image(settings, data, mime_type)
    except AIError as exc:
        logger.warning("Classification fell back: %s", exc.kind)
        message = _FALLBACK_MESSAGES.get(exc.kind, "AI classification is unavailable.")
        return fallback_classifier.unavailable_result(message)
    except Exception:  # never leak internals or secrets
        logger.exception("Unexpected classification error")
        return fallback_classifier.unavailable_result("An unexpected error occurred during classification.")
