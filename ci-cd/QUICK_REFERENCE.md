# 🚀 Quick Reference - GitLab CI/CD Deployment

## 📋 Essential Files

| File | Purpose |
|------|---------|
| `.gitlab-ci.yml` | GitLab CI/CD pipeline configuration |
| `GITLAB_CI_CD_SUMMARY.md` | Complete setup summary |
| `DEPLOYMENT_GUIDE.md` | Detailed step-by-step guide |
| `scripts/setup-ec2.sh` | EC2 automation script |

## 🔑 GitLab Variables Required

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `STAGING_SSH_PRIVATE_KEY` | Base64 encoded SSH key | ✅ | ✅ |
| `STAGING_SSH_USER` | `ubuntu` | ✅ | ❌ |
| `STAGING_SERVER_IP` | Staging EC2 IP | ✅ | ❌ |
| `PROD_SSH_PRIVATE_KEY` | Base64 encoded SSH key | ✅ | ✅ |
| `PROD_SSH_USER` | `ubuntu` | ✅ | ❌ |
| `PROD_SERVER_IP` | Production EC2 IP | ✅ | ❌ |

## 🔧 Quick Commands

### SSH Key Encoding
```bash
# Encode SSH key for GitLab variables
cat ~/.ssh/id_rsa | base64 -w 0
```

### EC2 Setup
```bash
# SSH into EC2 and run setup
ssh -i your-key.pem ubuntu@your-ec2-ip
curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/setup-ec2.sh | bash
```

### Copy Docker Compose Files
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

### Test Deployment
```bash
# Create branches
git checkout -b dev
git push origin dev

git checkout -b prod
git push origin prod

# Test staging deployment
git checkout dev
echo "# Test" >> README.md
git add README.md
git commit -m "Test deployment"
git push origin dev
```

## 🔍 Monitoring Commands

### Container Management
```bash
# Check running containers
docker ps

# View logs
docker logs qurieus-frontend
docker logs qurieus-backend
docker logs qurieus-msteams-bot

# Check docker-compose status
cd /home/ubuntu/staging/qurieus-frontend && docker-compose ps
cd /home/ubuntu/staging/qurieus-backend && docker-compose ps
cd /home/ubuntu/staging/qurieus-bot-teams && docker-compose ps

# View real-time logs
docker-compose logs -f

# Restart services
docker-compose restart

# Pull latest images
docker-compose pull
```

### Health Checks
```bash
# Frontend
curl http://localhost:8000/api/health

# Backend
curl http://localhost:8001/health

# MSTeamsBot
curl http://localhost:3978/health
```

## 🌐 Application Ports

| Application | Port | Technology |
|-------------|------|------------|
| **Frontend** | 8000 | Next.js |
| **Backend** | 8001 | FastAPI |
| **MSTeamsBot** | 3978 | Node.js |

## 🚀 Deployment Workflow

1. **Push to `dev`** → Deploys to **Staging EC2**
2. **Push to `prod`** → Deploys to **Production EC2**
3. **GitLab CI/CD** builds all three Docker images
4. **Images pushed** to GitLab Container Registry
5. **SSH deployment** to EC2 instances
6. **Containers restarted** with new images

## 🛠️ Troubleshooting

### Common Issues
1. **Docker permission denied**: `sudo usermod -aG docker ubuntu` then logout/login
2. **Port conflicts**: `sudo netstat -tulpn | grep :8000`
3. **Container not starting**: `docker logs <container-name>`
4. **GitLab CI/CD failing**: Check SSH key encoding and variables
5. **MSTeamsBot not deploying**: Check if bot directory exists on EC2

### Useful Debug Commands
```bash
# View all containers (including stopped)
docker ps -a

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Check what's using a port
sudo netstat -tulpn | grep :8000
```

## 📞 Support

If you encounter issues:
1. Check GitLab CI/CD pipeline logs
2. Review EC2 instance logs
3. Verify environment variables
4. Ensure SSH keys are properly base64 encoded

## 🎯 Next Steps

1. ✅ Set up SSL certificates with Let's Encrypt
2. ✅ Configure domain names
3. ✅ Set up monitoring (Prometheus/Grafana)
4. ✅ Implement database backups
5. ✅ Add load balancing for high availability
6. ✅ Configure MSTeamsBot webhook endpoints

## Prisma Migrations
Prisma migrations are run automatically during frontend deployment (staging and production) using:

```
docker-compose run --rm frontend yarn prisma migrate deploy
```

## Selective Build/Deploy
Use the following force variables in your CI/CD pipeline to force build and deploy for individual apps:
- `FORCE_FRONTEND`
- `FORCE_BACKEND`
- `FORCE_BOT`

## GitHub Actions
See `GITHUB_ACTIONS_QUICK_REFERENCE.md` for the equivalent GitHub Actions quick reference.

---

**This quick reference provides essential commands and information for your GitLab CI/CD deployment.** 