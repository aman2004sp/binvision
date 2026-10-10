#!/usr/bin/env bash
# BinVision setup: checks the environment, installs dependencies, runs tests, builds the
# frontend and verifies the backend starts. Safe to re-run; never overwrites backend/.env.
#
# Usage: ./setup.sh [--skip-tests] [--skip-build] [--skip-start-check] [--install-system-deps]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_TESTS=0; SKIP_BUILD=0; SKIP_START=0; SYSDEPS=0
for arg in "$@"; do
  case "$arg" in
    --skip-tests) SKIP_TESTS=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    --skip-start-check) SKIP_START=1 ;;
    --install-system-deps) SYSDEPS=1 ;;
    -h|--help) sed -n '2,6p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then G=$'\033[32m'; R=$'\033[31m'; Y=$'\033[33m'; N=$'\033[0m'; else G=""; R=""; Y=""; N=""; fi
step() { echo; echo "==> $*"; }
ok()   { echo "${G}[ok]${N} $*"; }
warn() { echo "${Y}[warn]${N} $*"; }
fail() { echo "${R}[fail]${N} $*" >&2; exit 1; }

version_ge() { [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]; }

SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi

apt_install() {
  if [ "$SYSDEPS" -eq 1 ] && command -v apt-get >/dev/null 2>&1; then
    echo "Installing system packages: $*"
    $SUDO apt-get update -y && $SUDO apt-get install -y "$@"
  else
    return 1
  fi
}

step "1/7 Checking system tools"
command -v python3 >/dev/null 2>&1 || { apt_install python3 python3-venv python3-pip || fail "python3 not found. Install Python 3.10+ (or rerun with --install-system-deps on Ubuntu)."; }
PYV="$(python3 -c 'import sys; print("%d.%d.%d" % sys.version_info[:3])')"
version_ge "$PYV" "3.10.0" || fail "Python $PYV found; 3.10+ is required."
ok "Python $PYV"

if ! python3 -c 'import venv, ensurepip' >/dev/null 2>&1; then
  apt_install python3-venv python3-pip || fail "python3-venv is missing. On Ubuntu: sudo apt install python3-venv python3-pip"
fi
ok "python venv module available"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  apt_install nodejs npm || fail "Node.js/npm not found. Install Node 18+ (https://nodejs.org or NodeSource) and rerun."
fi
NODEV="$(node --version | sed 's/^v//')"
version_ge "$NODEV" "18.0.0" || fail "Node $NODEV found; 18+ is required (20 or 22 recommended)."
ok "Node $NODEV, npm $(npm --version)"

step "2/7 Backend virtual environment and dependencies"
cd "$ROOT/backend"
[ -d .venv ] || python3 -m venv .venv
# shellcheck disable=SC1091
. .venv/bin/activate
python -m pip install --quiet --upgrade pip
python -m pip install --quiet -r requirements.txt
ok "Python dependencies installed in backend/.venv"

step "3/7 Backend configuration"
if [ -f .env ]; then
  ok "backend/.env already exists (left unchanged)"
else
  cp .env.example .env
  ok "Created backend/.env from .env.example"
fi
if grep -Eq '^AI_API_KEY=.+' .env; then
  ok "AI_API_KEY is set (a real request has not been tested yet; see README 'Testing a real AI request')"
else
  warn "AI_API_KEY is empty: the app will run in rule-based/demo fallback mode until you set it in backend/.env"
fi

step "4/7 Backend tests"
if [ "$SKIP_TESTS" -eq 1 ]; then warn "skipped (--skip-tests)"; else
  python -m pytest -q || fail "Backend tests failed."
  ok "Backend tests passed"
fi

step "5/7 Frontend dependencies"
cd "$ROOT/frontend"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund --silent || npm install --no-audit --no-fund --silent; else npm install --no-audit --no-fund --silent; fi
ok "Frontend dependencies installed"

step "6/7 Frontend typecheck and build"
if [ "$SKIP_BUILD" -eq 1 ]; then warn "skipped (--skip-build)"; else
  npm run build --silent || fail "Frontend build failed."
  [ -f dist/index.html ] || fail "frontend/dist/index.html missing after build."
  ok "Frontend built to frontend/dist"
fi

step "7/7 Backend start check"
if [ "$SKIP_START" -eq 1 ]; then warn "skipped (--skip-start-check)"; else
  cd "$ROOT/backend"
  PORT="${CHECK_PORT:-8765}"
  python -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT" >/tmp/binvision-setup.log 2>&1 &
  PID=$!
  trap 'kill $PID >/dev/null 2>&1 || true' EXIT
  HEALTH=""
  for _ in $(seq 1 30); do
    if HEALTH="$(python - "$PORT" <<'PY' 2>/dev/null
import sys, urllib.request
print(urllib.request.urlopen(f"http://127.0.0.1:{sys.argv[1]}/api/health", timeout=2).read().decode())
PY
)"; then break; fi
    HEALTH=""; sleep 0.5
  done
  [ -n "$HEALTH" ] || { cat /tmp/binvision-setup.log >&2; fail "Backend did not answer /api/health."; }
  ok "Backend answered /api/health: $HEALTH"
fi

echo
echo "${G}Setup complete.${N}"
cat <<EOF

Run locally (two terminals):
  1) cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000
  2) cd frontend && npm run dev          # open http://localhost:5173

Production (AWS EC2): see deploy/DEPLOY.md
EOF
