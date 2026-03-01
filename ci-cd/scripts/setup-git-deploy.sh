#!/bin/bash
# One-time setup for Git-based deployment (CI/CD Fast workflow)
# Run this on your EC2 server via SSH if /home/ubuntu/qurieus does not exist
#
# Usage: ./setup-git-deploy.sh [REPO_URL]
#   REPO_URL: Git clone URL (default: from env GITHUB_REPO_URL or prompts)
#
# Prerequisites: setup-ec2.sh has been run (Docker, deploy dirs exist)

set -e

REPO_URL=${1:-$GITHUB_REPO_URL}
REPO_DIR="/home/ubuntu/qurieus"
DEPLOY_BASE="/home/ubuntu"

echo "🚀 Setting up Git-based deployment for Qurieus..."

# Ensure we're in a directory we can work from
cd /home/ubuntu

# Clone repo if it doesn't exist
if [ ! -d "$REPO_DIR" ]; then
  if [ -z "$REPO_URL" ]; then
    echo "❌ Repo not found at $REPO_DIR and no REPO_URL provided."
    echo "   Usage: $0 https://github.com/YOUR_ORG/qurieus.git"
    echo "   Or: export GITHUB_REPO_URL=... && $0"
    exit 1
  fi
  echo "📦 Cloning repo from $REPO_URL..."
  git clone "$REPO_URL" qurieus
  cd qurieus
else
  echo "✅ Repo already exists at $REPO_DIR"
  cd "$REPO_DIR"
  git fetch origin
fi

# Copy docker-compose.deploy.yml to each deployment directory
for env in staging prod; do
  for app in frontend backend bot; do
    case $app in
      frontend) SRC="frontend.deploy.yml"; DEST="$DEPLOY_BASE/$env/qurieus-frontend" ;;
      backend)  SRC="backend.deploy.yml";  DEST="$DEPLOY_BASE/$env/qurieus-backend" ;;
      bot)      SRC="bot.deploy.yml";      DEST="$DEPLOY_BASE/$env/qurieus-bot-teams" ;;
    esac
    mkdir -p "$DEST"
    cp "ci-cd/docker-compose/$SRC" "$DEST/docker-compose.deploy.yml"
    echo "   Copied $SRC → $DEST/docker-compose.deploy.yml"
  done
done

# Ensure deploy script is executable
chmod +x ci-cd/scripts/deploy-from-source.sh

echo ""
echo "✅ Git-based deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create .env files in each deploy dir if not present:"
echo "   - /home/ubuntu/prod/qurieus-frontend/.env"
echo "   - /home/ubuntu/prod/qurieus-backend/.env"
echo "   - /home/ubuntu/prod/qurieus-bot-teams/.env"
echo "2. Re-run deployment from GitHub Actions (or manually):"
echo "   cd $REPO_DIR && ./ci-cd/scripts/deploy-from-source.sh prod prod true true false"
