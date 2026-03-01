#!/bin/bash
# Git-based deployment script - runs on the server
# Pulls latest code, conditionally runs yarn install, builds (with Docker cache), and restarts
#
# Usage: ./deploy-from-source.sh <env> <branch> [frontend_changed] [backend_changed] [bot_changed]
#   env: staging | prod
#   branch: dev | prod
#   frontend_changed, backend_changed, bot_changed: true | false (default: true if not specified)
#
# Prerequisites:
#   - Repo cloned at $REPO_DIR (default: /home/ubuntu/qurieus)
#   - Deployment dirs at /home/ubuntu/$env/qurieus-{frontend,backend,bot-teams}
#   - docker-compose.deploy.yml files in each deployment dir (build from source)
#   - If repo missing, run: ./ci-cd/scripts/setup-git-deploy.sh <REPO_URL>

set -e

# Support both docker compose (v2) and docker-compose (v1)
DOCKER_COMPOSE="docker compose"
if ! docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
fi

ENV=${1:-staging}
BRANCH=${2:-dev}
FRONTEND_CHANGED=${3:-true}
BACKEND_CHANGED=${4:-true}
BOT_CHANGED=${5:-true}

REPO_DIR=${REPO_DIR:-/home/ubuntu/qurieus}
DEPLOY_BASE="/home/ubuntu/$ENV"
export REPO_DIR

echo "🚀 Deploying to $ENV (branch: $BRANCH)"
echo "   Frontend: $FRONTEND_CHANGED | Backend: $BACKEND_CHANGED | Bot: $BOT_CHANGED"

# Pull latest code
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
PREV_HEAD=$(git rev-parse HEAD~1 2>/dev/null || echo "HEAD")

# Check if package files changed (for conditional yarn install)
# When using Docker build, layer cache handles this - we use it for logging only
packages_changed() {
  local app_path=$1
  git diff --name-only $PREV_HEAD HEAD -- "$app_path/package.json" "$app_path/yarn.lock" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

requirements_changed() {
  git diff --name-only $PREV_HEAD HEAD -- "qurieus-backend/requirements.txt" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

# Deploy Frontend
if [ "$FRONTEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Frontend..."
  PKG_CHANGED=$(packages_changed "qurieus-frontend")
  echo "   Package files changed: $PKG_CHANGED (Docker cache will skip yarn install if unchanged)"
  
  cd "$DEPLOY_BASE/qurieus-frontend"
  $DOCKER_COMPOSE -f docker-compose.deploy.yml build --no-cache=false
  $DOCKER_COMPOSE -f docker-compose.deploy.yml run --rm frontend yarn prisma migrate deploy 2>/dev/null || true
  $DOCKER_COMPOSE -f docker-compose.deploy.yml up -d --remove-orphans
  echo "✅ Frontend deployed"
else
  echo "⏭️ Skipping Frontend (no changes)"
fi

# Deploy Backend
if [ "$BACKEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Backend..."
  REQ_CHANGED=$(requirements_changed)
  echo "   Requirements changed: $REQ_CHANGED (Docker cache will skip pip install if unchanged)"
  
  cd "$DEPLOY_BASE/qurieus-backend"
  $DOCKER_COMPOSE -f docker-compose.deploy.yml build --no-cache=false
  $DOCKER_COMPOSE -f docker-compose.deploy.yml up -d --remove-orphans
  echo "✅ Backend deployed"
else
  echo "⏭️ Skipping Backend (no changes)"
fi

# Deploy Bot
if [ "$BOT_CHANGED" = "true" ]; then
  echo "📦 Deploying MSTeams Bot..."
  PKG_CHANGED=$(packages_changed "qurieus-bot-teams")
  echo "   Package files changed: $PKG_CHANGED (Docker cache will skip yarn install if unchanged)"
  
  cd "$DEPLOY_BASE/qurieus-bot-teams"
  $DOCKER_COMPOSE -f docker-compose.deploy.yml build --no-cache=false
  $DOCKER_COMPOSE -f docker-compose.deploy.yml up -d --remove-orphans
  echo "✅ Bot deployed"
else
  echo "⏭️ Skipping Bot (no changes)"
fi

echo "✅ Deployment completed!"
