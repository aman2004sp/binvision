# Deploying BinVision to AWS EC2 (Ubuntu + Nginx + systemd)

Only an EC2 instance is needed. No other AWS services, databases or containers.

## 1. Launch the instance
- Ubuntu 22.04 or 24.04 LTS, `t3.small` or similar (a `t3.micro` can run it, but the first frontend build is slow).
- Security group inbound: **22** (SSH, restrict to your IP) and **80** (HTTP). Add **443** if you add TLS.

## 2. Copy the project
From your machine:
```bash
rsync -av --exclude node_modules --exclude backend/.venv --exclude frontend/dist --exclude backend/.env \
  ./ ubuntu@<EC2_PUBLIC_IP>:~/binvision/
```
(or `git clone` your repository on the server)

## 3. Configure and deploy (on the server)
```bash
ssh ubuntu@<EC2_PUBLIC_IP>
cd ~/binvision
./setup.sh --skip-tests --skip-build --skip-start-check   # creates backend/.env
nano backend/.env        # set AI_API_KEY, and ALLOWED_ORIGINS=http://<EC2_PUBLIC_IP>
./deploy/ec2_deploy.sh
```
`ec2_deploy.sh` installs Nginx/Node, builds the frontend, publishes it to `/var/www/binvision`, installs the
`binvision` systemd service (uvicorn on 127.0.0.1:8000) and the Nginx site that proxies `/api/` to it.

Because Nginx serves the site and the API on the same origin, CORS does not apply to browser traffic in production.

## 4. Verify
```bash
curl http://127.0.0.1/api/health          # {"status":"ok","ai_available":true|false,...}
systemctl status binvision --no-pager
journalctl -u binvision -n 50 --no-pager
```
Then open `http://<EC2_PUBLIC_IP>/`.

## Updating
Copy the new code and rerun `./deploy/ec2_deploy.sh`. Changing only `backend/.env`: `sudo systemctl restart binvision`.

## Notes
- **Camera capture needs HTTPS** on most mobile browsers. Over plain HTTP, "Use camera" may not work; file upload still does. For a
  demo, add a domain and TLS (`sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`), or use a tunnel.
- `backend/.env` holds the API key. It is git-ignored; keep file permissions tight (`chmod 600 backend/.env`).
- Uploaded images are processed in memory and not written to disk.
