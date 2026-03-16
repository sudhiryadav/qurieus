# Qurieus CI/CD – No Docker

Push to `prod` or `dev` → GitHub Actions SSHs to server → git pull, yarn/pip install (if deps changed), build, PM2 restart.

## Server layout

- `/home/ubuntu/qurieus` – Git repo (source)
- `/home/ubuntu/prod/` – `.env` files for prod (qurieus-frontend, qurieus-backend, qurieus-bot-teams)
- `/home/ubuntu/staging/` – same for staging

## One-time setup

```bash
# SSH to server, then:
curl -fsSL https://raw.githubusercontent.com/ORG/qurieus/main/ci-cd/scripts/setup-ec2.sh | bash -s https://github.com/ORG/qurieus.git
```

Or: `./ci-cd/scripts/setup-ec2.sh https://github.com/ORG/qurieus.git`

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

**Prod env (automated):** `qurieus-frontend/.env.prod` and `qurieus-backend/.env.prod` are committed. On prod deploy, the script syncs them from the repo to the server's `prod.qurieus.frontend.env` and `prod.qurieus.backend.env`, then copies to each app's `.env`. No manual sync needed.

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

## GitLab CI/CD variables

**Required:**
- `STAGING_SSH_PRIVATE_KEY`, `STAGING_SSH_USER`, `STAGING_SERVER_IP`
- `PROD_SSH_PRIVATE_KEY`, `PROD_SSH_USER`, `PROD_SERVER_IP`

**Optional:**
- `PROD_REPO_DIR`, `STAGING_REPO_DIR` – if repo is not at `/home/ubuntu/qurieus`

The runner clones the repo with `CI_JOB_TOKEN` and rsyncs to the server – the server does not need GitLab access.

**Important:** `PROD_SERVER_IP` must point to the server with `/home/ubuntu/qurieus`. If staging and prod share the same server, use the same IP for both.

## Remove Docker (after migration)

```bash
./ci-cd/scripts/remove-docker.sh
```
