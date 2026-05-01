# Qurieus CI/CD – No Docker

Push to `prod` or `dev` → GitLab CI SSHs to server → git pull, yarn/pip install (if deps changed), build, PM2 restart.

## Server layout

- `/home/ubuntu/qurieus` – Git repo (source)

## One-time setup

```bash
# SSH to server, then:
curl -fsSL https://gitlab.com/frontslash/apps/qurieus/-/raw/prod/ci-cd/scripts/setup-ec2.sh | bash -s https://gitlab.com/frontslash/apps/qurieus.git
```

Or: `./ci-cd/scripts/setup-ec2.sh https://gitlab.com/frontslash/apps/qurieus.git`

## Env files (GitLab File variables)

Store each app env as a **GitLab CI/CD File variable**. During deploy, CI uploads each file directly to:

- `qurieus-frontend/.env`
- `qurieus-backend/.env`
- `qurieus-bot-teams/.env`

Required File variables:

- `STAGING_FRONTEND_ENV_FILE`
- `STAGING_BACKEND_ENV_FILE`
- `STAGING_BOT_ENV_FILE`
- `PROD_FRONTEND_ENV_FILE`
- `PROD_BACKEND_ENV_FILE`
- `PROD_BOT_ENV_FILE`

See `ci-cd/env.template` for variable shape (no secrets).

## Deployment

Deployment uses **GitLab CI**. Push to both remotes: `git push origin prod && git push github prod`. Secrets stay in GitLab CI/CD File variables and are uploaded only at deploy time.

## GitLab CI/CD variables

**Required (scalar/masked variables):**
- `STAGING_SSH_PRIVATE_KEY`, `STAGING_SSH_USER`, `STAGING_SERVER_IP`
- `PROD_SSH_PRIVATE_KEY`, `PROD_SSH_USER`, `PROD_SERVER_IP`

Use these as normal CI/CD variables (masked/protected), **not** File variables.
`*_SSH_PRIVATE_KEY` should be base64-encoded one-line private key content.

**Paddle:** keep Paddle keys directly inside the frontend env File variable content (`*_FRONTEND_ENV_FILE`).

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
