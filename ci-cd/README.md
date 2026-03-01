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

## Add .env files

Create `.env` in each deploy dir with your secrets:

- `/home/ubuntu/prod/qurieus-frontend/.env`
- `/home/ubuntu/prod/qurieus-backend/.env`
- `/home/ubuntu/prod/qurieus-bot-teams/.env`

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
