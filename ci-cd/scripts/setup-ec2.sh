#!/bin/bash
# EC2 Setup - NO Docker. Installs Node, Python, PM2. Run once on new server.

set -e

REPO_URL=${1:-$GITHUB_REPO_URL}
REPO_DIR="/home/ubuntu/qurieus"
DEPLOY_BASE="/home/ubuntu"

echo "🚀 Setting up EC2 for Qurieus (no Docker)..."

sudo apt update && sudo apt install -y curl

# Node.js 20
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# Yarn
if ! command -v yarn &>/dev/null; then
  npm install -g yarn
fi

# Python 3.11
if ! python3 --version 2>/dev/null | grep -q "3.1[1-9]"; then
  sudo apt install -y python3.11 python3.11-venv python3-pip
fi

# PM2
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
fi

# Create deploy dirs
mkdir -p $DEPLOY_BASE/{staging,prod}/{qurieus-frontend,qurieus-backend,qurieus-bot-teams}
sudo chown -R ubuntu:ubuntu $DEPLOY_BASE/staging $DEPLOY_BASE/prod

# Clone repo
if [ ! -d "$REPO_DIR" ]; then
  if [ -z "$REPO_URL" ]; then
    echo "❌ Usage: $0 https://github.com/org/qurieus.git"
    exit 1
  fi
  git clone "$REPO_URL" "$REPO_DIR"
fi

chmod +x "$REPO_DIR/ci-cd/scripts/deploy-from-source.sh" 2>/dev/null || true

echo ""
echo "✅ Setup complete!"
echo "1. Add .env in $DEPLOY_BASE/prod/{qurieus-frontend,qurieus-backend,qurieus-bot-teams}/"
echo "2. Push to prod → CI/CD deploys automatically"
echo "3. Or: cd $REPO_DIR && ./ci-cd/scripts/deploy-from-source.sh prod prod true true true"
