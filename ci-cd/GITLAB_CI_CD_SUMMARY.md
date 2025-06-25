# 🚀 GitLab CI/CD Monorepo Setup Summary

## ✅ What's Been Configured

### **Complete Monorepo CI/CD Pipeline:**
- ✅ **GitLab CI/CD** for all three applications
- ✅ **Docker containers** for Frontend, Backend, and MSTeamsBot
- ✅ **AWS EC2 deployment** to staging and production
- ✅ **Environment separation** (dev → staging, prod → production)
- ✅ **Base64 encoded SSH keys** for secure deployment

## 📁 Repository Structure

```
qurieus/ (Root Repository)
├── .gitlab-ci.yml                       # ✅ GitLab CI/CD configuration
├── ci-cd/
│   ├── GITLAB_CI_CD_SUMMARY.md          # ✅ This summary
│   ├── DEPLOYMENT_GUIDE.md              # ✅ Deployment guide
│   ├── GITHUB_ACTIONS_CI_CD_SUMMARY.md  # ✅ GitHub Actions guide
│   └── scripts/
│       └── setup-ec2.sh                 # ✅ EC2 automation script
├── qurieus-frontend/
│   ├── Dockerfile                       # ✅ Multi-stage Next.js build
│   ├── docker-compose.yml               # ✅ Frontend orchestration
│   ├── .dockerignore                    # ✅ Optimized excludes
│   └── ... (frontend files)
├── qurieus-backend/
│   ├── Dockerfile                       # ✅ Python FastAPI build
│   ├── docker-compose.yml               # ✅ Backend orchestration
│   └── ... (backend files)
└── qurieus-bot-teams/
    ├── Dockerfile                       # ✅ Node.js MSTeamsBot build
    ├── docker-compose.yml               # ✅ Bot orchestration
    ├── .dockerignore                    # ✅ Bot excludes
    └── ... (bot files)
```

## 🔄 Deployment Workflow

### **Branch Strategy:**
- **`dev` branch** → Deploys to **Staging EC2**
- **`prod` branch** → Deploys to **Production EC2**

### **CI/CD Pipeline Steps:**
1. **Push to `dev` or `prod` branch**
2. **GitLab CI/CD triggers** (`.gitlab-ci.yml`)
3. **Build all three Docker images:**
   - Frontend (Next.js) → `registry.gitlab.com/your-repo/frontend:branch`
   - Backend (FastAPI) → `registry.gitlab.com/your-repo/backend:branch`
   - MSTeamsBot (Node.js) → `registry.gitlab.com/your-repo/msteams-bot:branch`
4. **Push images to GitLab Container Registry**
5. **Deploy to EC2 instances:**
   - SSH into staging/production EC2
   - Pull latest images
   - Restart containers with new images

## 🌐 Application Ports

| Application | Port | Technology | Purpose |
|-------------|------|------------|---------|
| **Frontend** | 8000 | Next.js | Web application UI |
| **Backend** | 8001 | FastAPI | API endpoints |
| **MSTeamsBot** | 3978 | Node.js | Microsoft Teams bot |

## 🔧 GitLab CI/CD Variables Required

Go to your GitLab project → Settings → CI/CD → Variables:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `STAGING_SSH_PRIVATE_KEY` | Staging EC2 private SSH key (base64 encoded) | `LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0...` |
| `STAGING_SSH_USER` | SSH username | `ubuntu` |
| `STAGING_SERVER_IP` | Staging EC2 public IP | `3.123.45.67` |
| `PROD_SSH_PRIVATE_KEY` | Production EC2 private SSH key (base64 encoded) | `LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0...` |
| `PROD_SSH_USER` | SSH username | `ubuntu` |
| `PROD_SERVER_IP` | Production EC2 public IP | `3.123.45.68` |

**Note:** 
- `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` are auto-configured by GitLab
- SSH keys must be base64 encoded to avoid whitespace issues in GitLab variables

## 🔑 SSH Key Setup

### **Encode Your SSH Key:**
```bash
# Encode your SSH private key to base64
cat ~/.ssh/id_rsa | base64 -w 0
# or if using ed25519
cat ~/.ssh/id_ed25519 | base64 -w 0
```

### **Add to GitLab Variables:**
- Copy the base64 output
- Add as `STAGING_SSH_PRIVATE_KEY` and `PROD_SSH_PRIVATE_KEY`
- Mark as **Protected** and **Masked**

## 📋 Setup Checklist

### **AWS EC2 Setup:**
- [ ] Launch staging EC2 instance (t3.medium)
- [ ] Launch production EC2 instance (t3.large)
- [ ] Configure security groups (ports 22, 80, 443, 8000, 8001, 3978)
- [ ] Run `ci-cd/scripts/setup-ec2.sh` on both instances
- [ ] Copy docker-compose files to EC2 instances

### **GitLab Repository Setup:**
- [ ] Ensure `.gitlab-ci.yml` is in repository root
- [ ] Configure GitLab CI/CD Variables (see table above)
- [ ] Create `dev` and `prod` branches

### **Environment Configuration:**
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
git checkout -b dev
git push origin dev
# Check GitLab CI/CD → Pipelines for deployment status
```

## 🔍 Monitoring Commands

```bash
# Check running containers
docker ps

# View container logs
docker logs qurieus-frontend
docker logs qurieus-backend
docker logs qurieus-msteams-bot

# Check docker-compose status
cd /home/ubuntu/staging/qurieus-frontend && docker-compose ps
cd /home/ubuntu/staging/qurieus-backend && docker-compose ps
cd /home/ubuntu/staging/qurieus-bot-teams && docker-compose ps

# View real-time logs
docker-compose logs -f
```

## 🛠️ Troubleshooting

### Common Issues:
1. **Docker permission denied**: `sudo usermod -aG docker ubuntu` then logout/login
2. **Port conflicts**: `sudo netstat -tulpn | grep :8000`
3. **Container not starting**: `docker logs <container-name>`
4. **GitLab CI/CD failing**: Check variables format and SSH key encoding
5. **MSTeamsBot not deploying**: Check if bot directory exists on EC2

### Health Checks:
- Frontend: `curl http://localhost:8000/api/health`
- Backend: `curl http://localhost:8001/health`
- MSTeamsBot: `curl http://localhost:3978/health`

## 🎯 Benefits of This Setup

1. **Unified Deployment**: All applications deploy together
2. **Consistent Environments**: Same setup for staging and production
3. **Easy Scaling**: Add more applications to the monorepo easily
4. **Version Control**: All apps versioned together
5. **Cost Effective**: Single CI/CD pipeline for multiple apps
6. **Maintenance**: Centralized configuration and updates
7. **Security**: Base64 encoded SSH keys for secure deployment

## 🔮 Future Enhancements

1. **Database Migrations**: Prisma migrations are now run automatically during frontend deployment (staging and production) using `docker-compose run --rm frontend yarn prisma migrate deploy` in the pipeline.
2. **Selective Build/Deploy**: You can use force variables (`FORCE_FRONTEND`, `FORCE_BACKEND`, `FORCE_BOT`) to trigger build and deploy for individual apps regardless of detected changes.
3. **GitHub Actions**: See `GITHUB_ACTIONS_CI_CD_SUMMARY.md` for the equivalent GitHub Actions setup and reference.
4. **Monitoring**: Integrate with Prometheus/Grafana
5. **Load Balancing**: Add Application Load Balancer
6. **Auto-scaling**: Implement EC2 Auto Scaling Groups
7. **Blue-Green Deployment**: Zero-downtime deployments

## 📞 Support

If you encounter issues:
1. Check GitLab CI/CD pipeline logs
2. Check EC2 instance logs
3. Verify environment variables and secrets
4. Ensure SSH keys are properly base64 encoded

---

**This setup provides you with a robust GitLab CI/CD pipeline that automatically builds, tests, and deploys all three applications in your monorepo to AWS EC2 instances whenever you push to the `dev` or `prod` branches.** 