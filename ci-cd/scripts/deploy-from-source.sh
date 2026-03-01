#!/bin/bash
# Git-based deployment - NO Docker. Pulls code, conditional install, build, PM2 restart.
#
# Usage: ./deploy-from-source.sh <env> <branch> [frontend_changed] [backend_changed] [bot_changed]
#   env: staging | prod
#   branch: dev | prod
#
# Prerequisites: Node, Python 3.11+, PM2, repo at $REPO_DIR, .env in /home/ubuntu/$env/

set -e

ENV=${1:-staging}
BRANCH=${2:-dev}
FRONTEND_CHANGED=${3:-true}
BACKEND_CHANGED=${4:-true}
BOT_CHANGED=${5:-true}

REPO_DIR=${REPO_DIR:-/home/ubuntu/qurieus}
DEPLOY_BASE="/home/ubuntu/$ENV"

echo "🚀 Deploying to $ENV (branch: $BRANCH) - no Docker"
echo "   Frontend: $FRONTEND_CHANGED | Backend: $BACKEND_CHANGED | Bot: $BOT_CHANGED"

# Pull latest code
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
PREV_HEAD=$(git rev-parse HEAD~1 2>/dev/null || echo "HEAD")

packages_changed() {
  local app_path=$1
  git diff --name-only $PREV_HEAD HEAD -- "$app_path/package.json" "$app_path/yarn.lock" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

requirements_changed() {
  git diff --name-only $PREV_HEAD HEAD -- "qurieus-backend/requirements.txt" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

# Copy .env from deploy dir to app (for build + runtime)
copy_env() {
  local app=$1
  local src="$DEPLOY_BASE/$app/.env"
  local dest="$REPO_DIR/$app/.env"
  if [ -f "$src" ]; then
    cp "$src" "$dest"
  else
    echo "⚠️  No .env at $src - create it for $app"
  fi
}

# Deploy Frontend
if [ "$FRONTEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Frontend..."
  copy_env "qurieus-frontend"
  cd "$REPO_DIR/qurieus-frontend"
  PKG_CHANGED=$(packages_changed "qurieus-frontend")
  [ ! -d "node_modules" ] || [ "$PKG_CHANGED" = "yes" ] && yarn install --frozen-lockfile
  yarn prisma generate
  yarn prisma migrate deploy 2>/dev/null || true
  yarn build
  pm2 restart qurieus-frontend --update-env 2>/dev/null || (cd "$REPO_DIR" && pm2 start ecosystem.config.cjs --only qurieus-frontend)
  echo "✅ Frontend deployed"
else
  echo "⏭️ Skipping Frontend"
fi

# Deploy Backend
if [ "$BACKEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Backend..."
  copy_env "qurieus-backend"
  cd "$REPO_DIR/qurieus-backend"
  REQ_CHANGED=$(requirements_changed)
  if [ "$REQ_CHANGED" = "yes" ] || [ ! -d ".venv" ]; then
    python3 -m venv .venv 2>/dev/null || true
    .venv/bin/pip install -r requirements.txt -q
  fi
  pm2 restart qurieus-backend --update-env 2>/dev/null || (cd "$REPO_DIR" && pm2 start ecosystem.config.cjs --only qurieus-backend)
  echo "✅ Backend deployed"
else
  echo "⏭️ Skipping Backend"
fi

# Deploy Bot
if [ "$BOT_CHANGED" = "true" ]; then
  echo "📦 Deploying MSTeams Bot..."
  copy_env "qurieus-bot-teams"
  cd "$REPO_DIR/qurieus-bot-teams"
  PKG_CHANGED=$(packages_changed "qurieus-bot-teams")
  [ ! -d "node_modules" ] || [ "$PKG_CHANGED" = "yes" ] && yarn install --frozen-lockfile
  pm2 restart qurieus-bot-teams --update-env 2>/dev/null || (cd "$REPO_DIR" && pm2 start ecosystem.config.cjs --only qurieus-bot-teams)
  echo "✅ Bot deployed"
else
  echo "⏭️ Skipping Bot"
fi

pm2 save 2>/dev/null || true
echo "✅ Deployment completed!"
