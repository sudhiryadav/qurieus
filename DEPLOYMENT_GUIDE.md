# 🚀 Complete GitLab CI/CD Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions to deploy your Qurieus monorepo (Frontend, Backend, and MSTeamsBot) to AWS EC2 using GitLab CI/CD.

## 🏗️ Repository Structure

```
qurieus/ (Root Repository)
├── .gitlab-ci.yml                       # GitLab CI/CD configuration
├── qurieus-frontend/                    # Next.js frontend
├── qurieus-backend/                     # Python FastAPI backend
├── qurieus-bot-teams/                   # MSTeamsBot Node.js
├── scripts/
│   └── setup-ec2.sh                     # EC2 automation script
└── GITLAB_CI_CD_SUMMARY.md              # Quick reference
```

## 🔧 Prerequisites

- AWS Account with EC2 access
- GitLab repository with your code
- SSH key pair for EC2 access
- Docker installed locally (for testing)

## 📋 Step-by-Step Setup

### Step 1: AWS EC2 Setup

#### 1.1 Launch EC2 Instances

**Staging Instance:**
- Instance Type: `t3.medium` (2 vCPU, 4 GB RAM)
- OS: Ubuntu 22.04 LTS
- Security Group: Allow ports 22, 80, 443, 8000, 8001, 3978
- Key Pair: Your SSH key pair

**Production Instance:**
- Instance Type: `t3.large` (2 vCPU, 8 GB RAM)
- OS: Ubuntu 22.04 LTS
- Security Group: Same as staging
- Key Pair: Your SSH key pair

#### 1.2 Configure EC2 Instances

SSH into each instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directories
mkdir -p /home/ubuntu/staging/qurieus-frontend
mkdir -p /home/ubuntu/staging/qurieus-backend
mkdir -p /home/ubuntu/staging/qurieus-bot-teams
mkdir -p /home/ubuntu/prod/qurieus-frontend
mkdir -p /home/ubuntu/prod/qurieus-backend
mkdir -p /home/ubuntu/prod/qurieus-bot-teams

# Logout and login again
exit
```

#### 1.3 Copy Docker Compose Files

```bash
# Staging
scp -i your-key.pem qurieus-frontend/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-frontend/
scp -i your-key.pem qurieus-backend/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-backend/
scp -i your-key.pem qurieus-bot-teams/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-bot-teams/

# Production
scp -i your-key.pem qurieus-frontend/docker-compose.yml ubuntu@prod-ip:/home/ubuntu/prod/qurieus-frontend/
scp -i your-key.pem qurieus-backend/docker-compose.yml ubuntu@prod-ip:/home/ubuntu/prod/qurieus-backend/
scp -i your-key.pem qurieus-bot-teams/docker-compose.yml ubuntu@prod-ip:/home/ubuntu/prod/qurieus-bot-teams/
```

### Step 2: GitLab CI/CD Configuration

#### 2.1 Prepare SSH Keys

Encode your SSH private keys to base64:

```bash
# Encode SSH key
cat ~/.ssh/id_rsa | base64 -w 0
# or
cat ~/.ssh/id_ed25519 | base64 -w 0
```

Copy the base64 output (it will be a long string without spaces).

#### 2.2 Configure GitLab Variables

Go to your GitLab project → Settings → CI/CD → Variables and add:

| Variable Name | Value | Protected | Masked |
|---------------|-------|-----------|--------|
| `STAGING_SSH_PRIVATE_KEY` | Base64 encoded SSH key | ✅ | ✅ |
| `STAGING_SSH_USER` | `ubuntu` | ✅ | ❌ |
| `STAGING_SERVER_IP` | Your staging EC2 IP | ✅ | ❌ |
| `PROD_SSH_PRIVATE_KEY` | Base64 encoded SSH key | ✅ | ✅ |
| `PROD_SSH_USER` | `ubuntu` | ✅ | ❌ |
| `PROD_SERVER_IP` | Your production EC2 IP | ✅ | ❌ |

**Note:** `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` are auto-configured.

#### 2.3 Create Branches

```bash
# Create dev and prod branches
git checkout -b dev
git push origin dev

git checkout -b prod
git push origin prod
```

### Step 3: Environment Configuration

#### 3.1 Create Environment Files on EC2

**Staging Frontend** (`/home/ubuntu/staging/qurieus-frontend/.env`):
```bash
NEXT_PUBLIC_API_URL=http://your-staging-ip:8001
NEXT_PUBLIC_ENVIRONMENT=staging
```

**Staging Backend** (`/home/ubuntu/staging/qurieus-backend/.env`):
```bash
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://your-staging-ip:8000
```

**Staging MSTeamsBot** (`/home/ubuntu/staging/qurieus-bot-teams/.env`):
```bash
MICROSOFT_APP_ID=your_app_id
MICROSOFT_APP_PASSWORD=your_app_password
PORT=3978
```

**Production** (same structure, replace `staging` with `prod` and IP addresses).

### Step 4: Test Deployment

#### 4.1 Test Staging

```bash
# Make a change and push to dev branch
git checkout dev
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test staging deployment"
git push origin dev
```

#### 4.2 Monitor Pipeline

1. Go to GitLab → CI/CD → Pipelines
2. Monitor the pipeline execution
3. Check for any errors

#### 4.3 Verify Deployment

SSH into your staging EC2 and check:

```bash
# Check running containers
docker ps

# Check logs
docker logs qurieus-frontend
docker logs qurieus-backend
docker logs qurieus-msteams-bot

# Access applications
curl http://localhost:8000  # Frontend
curl http://localhost:8001  # Backend
curl http://localhost:3978  # MSTeamsBot
```

## 🔍 Monitoring & Troubleshooting

### Useful Commands

```bash
# Check container status
docker ps

# View logs
docker logs <container-name>

# Check docker-compose status
cd /home/ubuntu/staging/qurieus-frontend && docker-compose ps

# View real-time logs
docker-compose logs -f

# Restart services
docker-compose restart

# Pull latest images
docker-compose pull
```

### Common Issues

1. **Docker permission denied:**
   ```bash
   sudo usermod -aG docker ubuntu
   # Logout and login again
   ```

2. **Port conflicts:**
   ```bash
   sudo netstat -tulpn | grep :8000
   ```

3. **GitLab CI/CD failing:**
   - Check SSH key encoding
   - Verify variable names and values
   - Check GitLab runner status

4. **Container not starting:**
   ```bash
   docker logs <container-name>
   ```

### Health Checks

```bash
# Frontend health check
curl http://localhost:8000/api/health

# Backend health check
curl http://localhost:8001/health

# MSTeamsBot health check
curl http://localhost:3978/health
```

## 🌐 Application Access

| Environment | Frontend | Backend | MSTeamsBot |
|-------------|----------|---------|------------|
| **Staging** | `http://staging-ip:8000` | `http://staging-ip:8001` | `http://staging-ip:3978` |
| **Production** | `http://prod-ip:8000` | `http://prod-ip:8001` | `http://prod-ip:3978` |

## 🔄 Deployment Workflow

1. **Push to `dev` branch** → Automatic deployment to staging
2. **Push to `prod` branch** → Automatic deployment to production
3. **GitLab CI/CD builds** all three Docker images
4. **Images pushed** to GitLab Container Registry
5. **SSH deployment** to EC2 instances
6. **Containers restarted** with new images

## 🔮 Next Steps

1. **SSL/HTTPS Setup** with Let's Encrypt
2. **Domain Configuration** with DNS
3. **Monitoring Setup** (Prometheus/Grafana)
4. **Database Backups** configuration
5. **Load Balancing** for high availability
6. **MSTeamsBot Webhook** configuration

## 📞 Support

If you encounter issues:
1. Check GitLab CI/CD pipeline logs
2. Review EC2 instance logs
3. Verify environment variables
4. Ensure SSH keys are properly encoded

---

**This setup provides a complete CI/CD pipeline that automatically deploys your monorepo applications to AWS EC2 whenever you push to the `dev` or `prod` branches.** 