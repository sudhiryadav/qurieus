# Git-Based Deployment Setup (CI/CD Fast)

The **CI/CD Fast** workflow deploys by SSH-ing to the server and running `deploy-from-source.sh`, which pulls code and builds with Docker on the server. No image registry needed.

## Prerequisites

1. **EC2 setup** – Run `setup-ec2.sh` first (Docker, deploy dirs).
2. **Repo cloned** at `/home/ubuntu/qurieus` on the server.

## One-Time Setup on Production Server

If deployment fails with `cd: /home/ubuntu/qurieus: No such file or directory`, the repo is not cloned. Run:

```bash
# SSH into your production server
ssh -i your-key.pem ubuntu@PROD_SERVER_IP

# Run setup (replace with your repo URL - GitHub or GitLab)
cd /home/ubuntu
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/qurieus/main/ci-cd/scripts/setup-git-deploy.sh -o setup-git-deploy.sh
chmod +x setup-git-deploy.sh
./setup-git-deploy.sh https://github.com/YOUR_ORG/qurieus.git

# Or if you have the repo locally, scp the script:
scp -i your-key.pem ci-cd/scripts/setup-git-deploy.sh ubuntu@PROD_SERVER_IP:/home/ubuntu/
ssh -i your-key.pem ubuntu@PROD_SERVER_IP "./setup-git-deploy.sh https://github.com/YOUR_ORG/qurieus.git"
```

**For private repos**, ensure the server has SSH key access to the Git host (add deploy key to GitHub/GitLab, or use `git clone` with a token).

## What setup-git-deploy.sh Does

1. Clones the repo to `/home/ubuntu/qurieus` (if missing)
2. Copies `docker-compose.deploy.yml` into each deploy dir
3. Makes `deploy-from-source.sh` executable

## After Setup

1. Create `.env` files in each deploy dir if needed:
   - `/home/ubuntu/prod/qurieus-frontend/.env`
   - `/home/ubuntu/prod/qurieus-backend/.env`
   - `/home/ubuntu/prod/qurieus-bot-teams/.env`

2. Re-run deployment from GitHub Actions (workflow_dispatch with force_frontend/force_backend) or manually:

   ```bash
   cd /home/ubuntu/qurieus && ./ci-cd/scripts/deploy-from-source.sh prod prod true true false
   ```
