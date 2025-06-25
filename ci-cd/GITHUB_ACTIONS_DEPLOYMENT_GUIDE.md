# 🚀 Complete GitHub Actions Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions to deploy your Qurieus monorepo (Frontend, Backend, and MSTeamsBot) to AWS EC2 using GitHub Actions.

## 🏗️ Repository Structure

```
qurieus/ (Root Repository)
├── .github/workflows/ci-cd.yml           # GitHub Actions CI/CD configuration
├── qurieus-frontend/                     # Next.js frontend
├── qurieus-backend/                      # Python FastAPI backend
├── qurieus-bot-teams/                    # MSTeamsBot Node.js
├── scripts/
│   └── setup-ec2.sh                      # EC2 automation script
└── GITHUB_ACTIONS_DEPLOYMENT_GUIDE.md    # This guide
```

## 🔧 Prerequisites

- AWS Account with EC2 access
- GitHub repository with your code
- SSH key pair for EC2 access
- Docker installed locally (for testing)

## 📋 Step-by-Step Setup

### Step 1: AWS EC2 Setup

(Use the same instructions as in the GitLab guide for EC2 setup, Docker, Docker Compose, and directory creation.)

### Step 2: GitHub Actions Configuration

#### 2.1 Prepare SSH Keys

Encode your SSH private keys to base64:

```bash
cat ~/.ssh/id_rsa | base64 -w 0
# or
cat ~/.ssh/id_ed25519 | base64 -w 0
```

#### 2.2 Configure GitHub Actions Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions and add:

| Secret Name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `STAGING_SSH_PRIVATE_KEY` | Base64 encoded SSH key |
| `STAGING_SSH_USER` | `ubuntu` |
| `STAGING_SERVER_IP` | Your staging EC2 IP |
| `PROD_SSH_PRIVATE_KEY` | Base64 encoded SSH key |
| `PROD_SSH_USER` | `ubuntu` |
| `PROD_SERVER_IP` | Your production EC2 IP |

#### 2.3 Create Branches

```bash
git checkout -b dev
git push origin dev

git checkout -b prod
git push origin prod
```

### Step 3: Environment Configuration

Create `.env` files for each application on EC2 as described in the GitLab guide.

### Step 4: Test Deployment

- Run the workflow manually via the Actions tab (set force variables as needed), or
- Push to `dev` or `prod` branch to trigger automatic deployment.

### Step 5: Prisma Migrations

Prisma migrations are run automatically during frontend deployment (staging and production) using:

```
docker-compose run --rm frontend yarn prisma migrate deploy
```

### Step 6: Selective Build/Deploy

Use the following force variables in your workflow dispatch to force build and deploy for individual apps:
- `force_frontend`
- `force_backend`
- `force_bot`

## 🔍 Monitoring & Troubleshooting

(Use the same monitoring and troubleshooting commands as in the GitLab guide.)

## 📞 Support
If you encounter issues:
1. Check GitHub Actions workflow logs
2. Review EC2 instance logs
3. Verify environment variables and secrets
4. Ensure SSH keys are properly base64 encoded

---

**This guide provides a complete GitHub Actions CI/CD pipeline that automatically deploys your monorepo applications to AWS EC2 whenever you push to the `dev` or `prod` branches or run the workflow manually.** 