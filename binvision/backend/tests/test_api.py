import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.models import Category
from app.services import ai_classifier
from app.services.ai_classifier import AIError, parse_ai_output
from app.services.disposal_knowledge import normalize_category

client = TestClient(app)


def make_image(fmt="PNG", size=(32, 32)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (30, 120, 60)).save(buf, format=fmt)
    return buf.getvalue()


@pytest.fixture(autouse=True)
def no_ai(monkeypatch):
    monkeypatch.setenv("AI_API_KEY", "")
    monkeypatch.setenv("AI_PROVIDER", "gemini")


def test_health_has_no_secrets():
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["ai_available"] is False
    assert "key" not in str(body).lower()


def test_categories_and_knowledge():
    cats = client.get("/api/categories").json()
    assert len(cats) >= 10
    assert {"paper_cardboard", "plastic", "metal", "glass", "organic", "ewaste",
            "batteries_hazardous", "residual", "textile", "unknown"} <= {c["id"] for c in cats}
    kb = client.get("/api/knowledge").json()
    assert kb["version"] and kb["disclaimer"]


def test_guidance_manual_is_demo_fallback():
    r = client.get("/api/guidance/glass")
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "demo_fallback"
    assert body["confidence"] is None
    assert body["category"] == "glass"
    assert client.get("/api/guidance/nonsense").status_code == 422


def test_classify_without_key_falls_back_honestly():
    r = client.post("/api/classify", files={"image": ("a.png", make_image(), "image/png")})
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "demo_fallback"
    assert body["uncertain"] is True
    assert body["confidence"] is None
    assert body["fallback_reason"]


def test_classify_rejects_bad_type():
    r = client.post("/api/classify", files={"image": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 415


def test_classify_rejects_fake_image():
    r = client.post("/api/classify", files={"image": ("a.png", b"not an image", "image/png")})
    assert r.status_code == 400


def test_classify_rejects_empty_and_oversize(monkeypatch):
    r = client.post("/api/classify", files={"image": ("a.png", b"", "image/png")})
    assert r.status_code == 400
    monkeypatch.setenv("MAX_UPLOAD_MB", "1")
    big = make_image(size=(2000, 2000))
    padded = big + b"\0" * (1024 * 1024 + 10)
    r = client.post("/api/classify", files={"image": ("a.png", padded, "image/png")})
    assert r.status_code == 413


def test_ai_success_path_is_labelled_ai(monkeypatch):
    monkeypatch.setenv("AI_API_KEY", "test-key")
    monkeypatch.setattr(
        ai_classifier, "_call_gemini",
        lambda *a, **k: '{"item_name":"Glass jar","category":"glass","material":"Glass",'
                        '"reason":"Clear glass jar.","warning":null,"uncertain":false}',
    )
    r = client.post("/api/classify", files={"image": ("a.png", make_image(), "image/png")})
    body = r.json()
    assert body["source"] == "ai"
    assert body["category"] == "glass"
    assert body["confidence"] is None
    assert body["preparation_steps"]


@pytest.mark.parametrize("kind", ["auth", "rate_limit", "timeout", "unavailable", "malformed"])
def test_provider_errors_never_become_ai_success(monkeypatch, kind):
    monkeypatch.setenv("AI_API_KEY", "test-key")
    monkeypatch.setenv("AI_MAX_RETRIES", "0")

    def boom(*a, **k):
        raise AIError(kind, "x")

    monkeypatch.setattr(ai_classifier, "_call_gemini", boom)
    r = client.post("/api/classify", files={"image": ("a.png", make_image(), "image/png")})
    body = r.json()
    assert r.status_code == 200
    assert body["source"] == "demo_fallback"
    assert body["uncertain"] is True


def test_retries_are_bounded(monkeypatch):
    monkeypatch.setenv("AI_API_KEY", "test-key")
    monkeypatch.setenv("AI_MAX_RETRIES", "2")
    monkeypatch.setattr(ai_classifier.time, "sleep", lambda *_: None)
    calls = {"n": 0}

    def boom(*a, **k):
        calls["n"] += 1
        raise AIError("unavailable", "x")

    monkeypatch.setattr(ai_classifier, "_call_gemini", boom)
    client.post("/api/classify", files={"image": ("a.png", make_image(), "image/png")})
    assert calls["n"] == 3


def test_parse_handles_fences_and_bad_category():
    r = parse_ai_output('```json\n{"item_name":"Thing","category":"zzz","material":"?","reason":"r","uncertain":false}\n```')
    assert r.category == Category.UNKNOWN
    assert r.uncertain is True


def test_parse_rejects_non_json():
    with pytest.raises(AIError):
        parse_ai_output("I think it is plastic")


def test_parse_ignores_model_confidence_and_adds_safety():
    r = parse_ai_output('{"item_name":"AA battery","category":"battery","material":"Alkaline","confidence":0.99,'
                        '"reason":"r","warning":"May leak","uncertain":false}')
    assert r.confidence is None
    assert r.category == Category.HAZARDOUS
    assert "May leak" in r.warning and "puncture" in r.warning.lower()


def test_normalize_category():
    assert normalize_category("Cardboard") == Category.PAPER
    assert normalize_category("e-waste") == Category.EWASTE
    assert normalize_category(None) == Category.UNKNOWN
