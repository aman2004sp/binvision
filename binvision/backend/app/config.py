"""Environment-driven configuration. Secrets are never logged or returned."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _load_dotenv() -> None:
    """Minimal .env loader (stdlib only). Real environment variables win."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.is_file():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default


def _float(name: str, default: float) -> float:
    try:
        return float(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default


@dataclass(frozen=True)
class Settings:
    ai_provider: str = "gemini"
    ai_api_key: str = field(default="", repr=False)
    ai_model: str = "gemini-2.0-flash"
    ai_timeout_seconds: float = 20.0
    ai_max_retries: int = 1
    max_upload_mb: int = 5
    allowed_origins: tuple[str, ...] = ("http://localhost:5173",)
    api_port: int = 8000

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def ai_configured(self) -> bool:
        return self.ai_provider not in ("", "none") and bool(self.ai_api_key)


def get_settings() -> Settings:
    _load_dotenv()
    origins = tuple(
        o.strip()
        for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    )
    return Settings(
        ai_provider=os.environ.get("AI_PROVIDER", "gemini").strip().lower(),
        ai_api_key=os.environ.get("AI_API_KEY", "").strip(),
        ai_model=os.environ.get("AI_MODEL", "gemini-2.0-flash").strip(),
        ai_timeout_seconds=max(1.0, _float("AI_TIMEOUT_SECONDS", 20.0)),
        ai_max_retries=min(2, max(0, _int("AI_MAX_RETRIES", 1))),
        max_upload_mb=max(1, _int("MAX_UPLOAD_MB", 5)),
        allowed_origins=origins or ("http://localhost:5173",),
        api_port=_int("API_PORT", 8000),
    )
