# BinVision — AI Recycling Coach

*See the waste. Know where it goes.*

Upload a photo of a waste item and get its likely category, material, preparation steps and safety notes. Correct the
result if it is wrong, then practise in a sorting challenge. Progress is stored locally in the browser.

## Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4, React Router, Lucide icons, `localStorage`
- **Backend:** Python 3, FastAPI, Pydantic, Uvicorn, Pillow (image validation), `google-genai` (Gemini)
- **Hosting:** AWS EC2 (Ubuntu) + Nginx + systemd. No database.

## Quick start
```bash
./setup.sh                 # checks tools, installs deps, runs tests, builds frontend, checks backend starts
# terminal 1
cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000
# terminal 2
cd frontend && npm run dev   # http://localhost:5173 (proxies /api to :8000)
```
`setup.sh` options: `--skip-tests`, `--skip-build`, `--skip-start-check`, `--install-system-deps` (apt, Ubuntu).

## Configuration (`backend/.env`, see `.env.example`)
| Variable | Purpose | Default |
|---|---|---|
| `AI_PROVIDER` | `gemini` or `none` | `gemini` |
| `AI_API_KEY` | Provider key (server-side only) | empty → demo mode |
| `AI_MODEL` | Vision-capable model name | `gemini-2.0-flash` |
| `AI_TIMEOUT_SECONDS` | Provider timeout | `20` |
| `AI_MAX_RETRIES` | Bounded retries (max 2) | `1` |
| `MAX_UPLOAD_MB` | Upload limit (frontend uses 5) | `5` |
| `ALLOWED_ORIGINS` | CORS origins | dev server |
| `API_PORT` | Port | `8000` |

The frontend has no secrets. It uses same-origin `/api` by default; set the public `VITE_API_BASE_URL` at build time to
point elsewhere.

## AI provider
Google Gemini through the official `google-genai` SDK, isolated in `backend/app/services/ai_classifier.py`. You need a
Google AI Studio API key (https://aistudio.google.com/apikey). Free-tier availability, quotas and whether billing must be
enabled depend on your Google account and region, and model names change over time: if the model is rejected, set
`AI_MODEL` to a current vision-capable Gemini model.

The model supplies only item name, material, category, reason, warning and uncertainty. Preparation steps and disposal
routes always come from the curated knowledge base (`disposal_knowledge.py`), so the AI cannot invent local facilities
or rules. `confidence` is always `null`: self-reported model certainty is not a calibrated probability.

### Testing a real AI request
```bash
# 1. put your key in backend/.env  (AI_API_KEY=...)
cd backend && . .venv/bin/activate && uvicorn app.main:app --port 8000 &
curl -s localhost:8000/api/health                      # expect "ai_available": true
curl -s -F "image=@/path/to/photo.jpg;type=image/jpeg" localhost:8000/api/classify | python -m json.tool
```
A genuine AI answer has `"source": "ai"`. Any provider failure (bad key, quota, timeout, outage, malformed output) returns
`"source": "demo_fallback"` with a `fallback_reason`; it is never reported as AI.

## API
- `GET /api/health` · `GET /api/categories` · `GET /api/knowledge`
- `GET /api/guidance/{category}` — manual/demo guidance (no AI)
- `POST /api/classify` — multipart field `image` (JPEG/PNG/WebP, ≤ `MAX_UPLOAD_MB`). Validates type, size and actual image
  content; images are processed in memory and not stored.
- Interactive docs: `/api/docs`

## Result labels
**AI classification** (model identified the photo) · **Rule-based guidance** (knowledge base only, e.g. after a user
correction) · **Manual / demo mode** (user picked a category, or AI unavailable; no image recognition).

## Deployment
See [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

## Verification status
Verified in the build environment:
- Backend: 18 pytest tests pass (validation, fallback behaviour, error mapping, bounded retries, parsing). The AI call is
  tested with a **mocked** provider.
- Frontend: TypeScript typecheck and production build succeed.
- `setup.sh` runs end to end and the backend answers `/api/health`.

**Not verified** (needs your configuration or hardware):
- A real Gemini request (requires your API key and network access to Google).
- The UI in a real browser/phone, including camera capture and drag-and-drop.
- The EC2 deployment (`deploy/` files are written but not run on AWS).

## Limitations
- Progress, scan history and the "leaderboard" are per browser/device; there is no global ranking.
- Guidance is general, not municipal regulation. AI can misidentify items.
- No environmental impact estimates (kg/CO₂) are shown, because there is no defensible way to measure them from a photo.
- Camera capture generally needs HTTPS on mobile.
