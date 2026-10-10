#!/usr/bin/env bash
# Run ON the Ubuntu EC2 instance from the repository root (after copying/cloning the project there):
#   ./deploy/ec2_deploy.sh
# Installs Nginx, runs setup.sh, publishes the frontend build, installs the systemd service
# and the Nginx site. Re-run it after every update. Requires sudo.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_USER="${SUDO_USER:-$(id -un)}"
WEB_ROOT=/var/www/binvision

echo "==> Installing system packages"
sudo apt-get update -y
sudo apt-get install -y nginx python3 python3-venv python3-pip curl ca-certificates
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  echo "Node 18+ not found; installing Node 20 from NodeSource"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Running project setup (deps, tests, build)"
cd "$APP_DIR"
./setup.sh --skip-start-check

echo "==> Publishing frontend to $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo rsync -a --delete "$APP_DIR/frontend/dist/" "$WEB_ROOT/" 2>/dev/null || {
  sudo rm -rf "${WEB_ROOT:?}"/*; sudo cp -r "$APP_DIR/frontend/dist/." "$WEB_ROOT/"; }

echo "==> Installing systemd service"
sed -e "s#__APP_DIR__#$APP_DIR#g" -e "s#__APP_USER__#$APP_USER#g" deploy/binvision.service | sudo tee /etc/systemd/system/binvision.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable binvision >/dev/null
sudo systemctl restart binvision

echo "==> Configuring Nginx"
sudo cp deploy/nginx.conf /etc/nginx/sites-available/binvision
sudo ln -sf /etc/nginx/sites-available/binvision /etc/nginx/sites-enabled/binvision
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Verifying"
sleep 2
curl -fsS http://127.0.0.1/api/health && echo
echo "Done. Open http://<your-ec2-public-ip>/ (security group must allow inbound HTTP 80)."
