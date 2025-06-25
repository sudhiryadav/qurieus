# 🚀 Quick Reference - GitHub Actions Deployment

## 📋 Essential Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci-cd.yml` | GitHub Actions pipeline configuration |
| `ci-cd/GITHUB_ACTIONS_CI_CD_SUMMARY.md` | Complete setup summary |
| `ci-cd/GITHUB_ACTIONS_DEPLOYMENT_GUIDE.md` | Detailed step-by-step guide |
| `ci-cd/scripts/setup-ec2.sh` | EC2 automation script |

## 🔑 GitHub Actions Secrets Required

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `STAGING_SSH_PRIVATE_KEY` | Base64 encoded SSH key |
| `STAGING_SSH_USER` | `ubuntu` |
| `STAGING_SERVER_IP` | Staging EC2 IP |
| `PROD_SSH_PRIVATE_KEY` | Base64 encoded SSH key |
| `PROD_SSH_USER` | `ubuntu` |
| `PROD_SERVER_IP` | Production EC2 IP |

## 🔧 Quick Commands

### SSH Key Encoding
```bash
cat ~/.ssh/id_rsa | base64 -w 0
```

### EC2 Setup
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
curl -fsSL https://raw.githubusercontent.com/your-repo/main/ci-cd/scripts/setup-ec2.sh | bash
```

### Copy Docker Compose Files
```bash
scp -i your-key.pem qurieus-frontend/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-frontend/
scp -i your-key.pem qurieus-backend/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-backend/
scp -i your-key.pem qurieus-bot-teams/docker-compose.yml ubuntu@staging-ip:/home/ubuntu/staging/qurieus-bot-teams/

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

## 🔍 Monitoring & Troubleshooting

(Use the same monitoring and troubleshooting commands as in the GitLab quick reference.)

## 📞 Support
If you encounter issues:
1. Check GitHub Actions workflow logs
2. Review EC2 instance logs
3. Verify environment variables and secrets
4. Ensure SSH keys are properly base64 encoded

---

**This quick reference provides essential commands and information for your GitHub Actions deployment.** 