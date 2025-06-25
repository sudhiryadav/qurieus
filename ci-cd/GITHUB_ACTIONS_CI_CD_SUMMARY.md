# 🚀 GitHub Actions CI/CD Monorepo Setup Summary

## ✅ What's Been Configured

### **Complete Monorepo CI/CD Pipeline:**
- ✅ **GitHub Actions** for all three applications
- ✅ **Docker containers** for Frontend, Backend, and MSTeamsBot
- ✅ **AWS EC2 deployment** to staging and production
- ✅ **Environment separation** (dev → staging, prod → production)
- ✅ **Base64 encoded SSH keys** for secure deployment

## 📁 Repository Structure

```
qurieus/ (Root Repository)
├── .github/workflows/ci-cd.yml           # ✅ GitHub Actions CI/CD configuration
├── ci-cd/
│   ├── GITHUB_ACTIONS_CI_CD_SUMMARY.md   # ✅ This summary
│   ├── GITHUB_ACTIONS_DEPLOYMENT_GUIDE.md # ✅ Deployment guide
│   ├── DEPLOYMENT_GUIDE.md               # ✅ GitLab deployment guide
│   └── scripts/
│       └── setup-ec2.sh                  # ✅ EC2 automation script
├── qurieus-frontend/
│   ├── Dockerfile                        # ✅ Multi-stage Next.js build
│   ├── docker-compose.yml                # ✅ Frontend orchestration
│   └── ... (frontend files)
├── qurieus-backend/
│   ├── Dockerfile                        # ✅ Python FastAPI build
│   ├── docker-compose.yml                # ✅ Backend orchestration
│   └── ... (backend files)
└── qurieus-bot-teams/
    ├── Dockerfile                        # ✅ Node.js MSTeamsBot build
    ├── docker-compose.yml                # ✅ Bot orchestration
    └── ... (bot files)
```

## 🔄 Deployment Workflow

### **Branch Strategy:**
- **`dev` branch** → Deploys to **Staging EC2**
- **`prod` branch** → Deploys to **Production EC2**

### **CI/CD Pipeline Steps:**
1. **Push to `dev` or `prod` branch** or run workflow manually
2. **GitHub Actions triggers** (`.github/workflows/ci-cd.yml`)
3. **Build all three Docker images:**
   - Frontend (Next.js) → `docker.io/your-user/qurieus-frontend:branch`
   - Backend (FastAPI) → `docker.io/your-user/qurieus-backend:branch`
   - MSTeamsBot (Node.js) → `docker.io/your-user/qurieus-msteams-bot:branch`
4. **Push images to Docker Hub**
5. **Deploy to EC2 instances:**
   - SSH into staging/production EC2
   - Pull latest images
   - Run Prisma migrations for frontend
   - Restart containers with new images

## 🌐 Application Ports

| Application | Port | Technology | Purpose |
|-------------|------|------------|---------|
| **Frontend** | 8000 | Next.js | Web application UI |
| **Backend** | 8001 | FastAPI | API endpoints |
| **MSTeamsBot** | 3978 | Node.js | Microsoft Teams bot |

## 🔧 GitHub Actions Secrets Required

Go to your GitHub repository → Settings → Secrets and variables → Actions:

| Secret Name | Description |
|-------------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `STAGING_SSH_PRIVATE_KEY` | Staging EC2 private SSH key (base64 encoded) |
| `STAGING_SSH_USER` | SSH username |
| `STAGING_SERVER_IP` | Staging EC2 public IP |
| `PROD_SSH_PRIVATE_KEY` | Production EC2 private SSH key (base64 encoded) |
| `PROD_SSH_USER` | SSH username |
| `PROD_SERVER_IP` | Production EC2 public IP |

## 📋 Setup Checklist

- [ ] Ensure `.github/workflows/ci-cd.yml` is in repository root
- [ ] Configure GitHub Actions Secrets (see table above)
- [ ] Create `dev` and `prod` branches
- [ ] Create `.env` files for each application on EC2
- [ ] Configure database connections
- [ ] Set up MSTeamsBot credentials
- [ ] Configure CORS settings

## 🚀 Quick Start Commands

```bash
# 1. Set up EC2 instances
ssh -i your-key.pem ubuntu@your-ec2-ip
curl -fsSL https://raw.githubusercontent.com/your-repo/main/ci-cd/scripts/setup-ec2.sh | bash

# 2. Copy docker-compose files
scp -i your-key.pem qurieus-frontend/docker-compose.yml ubuntu@your-ec2-ip:/home/ubuntu/staging/qurieus-frontend/
scp -i your-key.pem qurieus-backend/docker-compose.yml ubuntu@your-ec2-ip:/home/ubuntu/staging/qurieus-backend/
scp -i your-key.pem qurieus-bot-teams/docker-compose.yml ubuntu@your-ec2-ip:/home/ubuntu/staging/qurieus-bot-teams/

# 3. Test deployment
# Run workflow manually or push to dev/prod
```

## 🛠️ Prisma Migrations
Prisma migrations are run automatically during frontend deployment (staging and production) using:

```
docker-compose run --rm frontend yarn prisma migrate deploy
```

## 🛠️ Selective Build/Deploy
Use the following force variables in your workflow dispatch to force build and deploy for individual apps:
- `force_frontend`
- `force_backend`
- `force_bot`

## 📞 Support
If you encounter issues:
1. Check GitHub Actions workflow logs
2. Check EC2 instance logs
3. Verify environment variables and secrets
4. Ensure SSH keys are properly base64 encoded

---

**This setup provides you with a robust GitHub Actions CI/CD pipeline that automatically builds, tests, and deploys all three applications in your monorepo to AWS EC2 instances whenever you push to the `dev` or `prod` branches or run the workflow manually.** 