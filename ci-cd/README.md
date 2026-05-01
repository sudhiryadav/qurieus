# Qurieus CI/CD – No Docker

Push to `prod` or `dev` → GitLab CI SSHs to server → git pull, yarn/pip install (if deps changed), build, PM2 restart.

## Server layout

- `/home/ubuntu/qurieus` – Git repo (source)
- `/home/ubuntu/prod/` – `.env` files for prod (qurieus-frontend, qurieus-backend, qurieus-bot-teams)
- `/home/ubuntu/staging/` – same for staging

## One-time setup

```bash
# SSH to server, then:
curl -fsSL https://gitlab.com/frontslash/apps/qurieus/-/raw/prod/ci-cd/scripts/setup-ec2.sh | bash -s https://gitlab.com/frontslash/apps/qurieus.git
```

Or: `./ci-cd/scripts/setup-ec2.sh https://gitlab.com/frontslash/apps/qurieus.git`

## Env files (on server)

**App-specific env files** in `/home/ubuntu/` (or `ENV_DIR`):

| File | App |
|------|-----|
| `prod.qurieus.frontend.env` | qurieus-frontend (prod) |
| `prod.qurieus.backend.env` | qurieus-backend (prod) |
| `prod.qurieus.bot.env` | qurieus-bot-teams (prod) |
| `staging.qurieus.frontend.env` | qurieus-frontend (staging) |
| `staging.qurieus.backend.env` | qurieus-backend (staging) |
| `staging.qurieus.bot.env` | qurieus-bot-teams (staging) |

The deploy script copies each app's env file to its `.env` before build/run.

**Prod env (automated):**
- Set GitLab CI/CD **File** variables and CI uploads them on each prod deploy:
  - `FRONTEND_ENV_PROD_FILE` -> `qurieus-frontend/.env.prod`
  - `BACKEND_ENV_PROD_FILE` -> `qurieus-backend/.env.prod`
  - `BOT_ENV_PROD_FILE` -> `qurieus-bot-teams/.env.prod`

On prod deploy, the script syncs app `.env.prod` into server env files (`prod.qurieus.*.env`) and then copies to each app's `.env`.

**Setup on server:**
```bash
# SSH to server, create the files
nano /home/ubuntu/prod.qurieus.frontend.env
nano /home/ubuntu/prod.qurieus.backend.env
nano /home/ubuntu/prod.qurieus.bot.env
nano /home/ubuntu/staging.qurieus.frontend.env
nano /home/ubuntu/staging.qurieus.backend.env
nano /home/ubuntu/staging.qurieus.bot.env
```

See `ci-cd/env.template` for required vars (no secrets).

## Deployment

Deployment uses **GitLab CI**. Push to both remotes: `git push origin prod && git push github prod`. The repo contains `.env.prod` with secrets; allow them in GitHub push protection (one-time) to push to GitHub.

## GitLab CI/CD variables

**Required (scalar/masked variables):**
- `STAGING_SSH_PRIVATE_KEY`, `STAGING_SSH_USER`, `STAGING_SERVER_IP`
- `PROD_SSH_PRIVATE_KEY`, `PROD_SSH_USER`, `PROD_SERVER_IP`

Use these as normal CI/CD variables (masked/protected), **not** File variables.
`*_SSH_PRIVATE_KEY` should be base64-encoded one-line private key content.

**Paddle (prod frontend):** Injected into `prod.qurieus.frontend.env` on deploy.

**Option A – CI/CD variables** (masked/protected vars may not pass through SSH; if Paddle stays "not configured", use Option B):
- `PADDLE_API_KEY` – Paddle API key for server-side calls (Paddle Dashboard → Developer Tools → Authentication → API keys)
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` – Paddle client token for checkout (Developer Tools → Client-side tokens)
- `PADDLE_WEBHOOK_SIGNING_KEY` – Webhook signing secret (Developer Tools → Notifications → webhook → Signing secret)
- `BYPASS_WEBHOOK_VERIFICATION` – (optional) `false` by default; set `true` to skip webhook verification

**Option B – Server-side file** (recommended if CI/CD injection fails): Create `/home/ubuntu/prod.paddle.env` on the server:
```
PADDLE_API_KEY=pdl_live_apikey_...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_...
PADDLE_WEBHOOK_SIGNING_KEY=pdl_ntfset_...
BYPASS_WEBHOOK_VERIFICATION=false
```
Deploy script appends this file when CI/CD vars are not available (e.g. masked/protected)

**Required (File variables for prod deploy):**
- `FRONTEND_ENV_PROD_FILE` – file content for `qurieus-frontend/.env.prod`
- `BACKEND_ENV_PROD_FILE` – file content for `qurieus-backend/.env.prod`
- `BOT_ENV_PROD_FILE` – file content for `qurieus-bot-teams/.env.prod`

`deploy_production` fails fast if any of these File variables are missing.

**Optional (scalar/masked variables):**
- `PROD_REPO_DIR`, `STAGING_REPO_DIR` – if repo is not at `/home/ubuntu/qurieus`

The runner clones the repo with `CI_JOB_TOKEN` and rsyncs to the server – the server does not need GitLab access.

**Important:** `PROD_SERVER_IP` must point to the server with `/home/ubuntu/qurieus`. If staging and prod share the same server, use the same IP for both.

## Watchdog (auto-heal)

Server setup/deploy also installs a systemd timer that runs every minute and auto-heals PM2 apps:

- Script source: `ci-cd/scripts/qurieus-watchdog.sh`
- Installed script: `/usr/local/bin/qurieus-watchdog.sh`
- Service: `qurieus-watchdog.service`
- Timer: `qurieus-watchdog.timer`

What it checks:

- PM2 processes exist for `qurieus-frontend`, `qurieus-backend`, and `qurieus-bot-teams`
- Local health probes: `http://127.0.0.1:8000/` and `http://127.0.0.1:8001/`
- Public health probe: `https://qurieus.com/`

If a probe fails, it restarts the affected PM2 app and writes to syslog with tag `qurieus-watchdog`.

## Remove Docker (after migration)

```bash
./ci-cd/scripts/remove-docker.sh
```
