#!/bin/bash
# Git-based deployment - NO Docker. Pulls code, conditional install, build, PM2 restart.
#
# Usage: ./deploy-from-source.sh <env> <branch> [frontend_changed] [backend_changed] [bot_changed]
#   env: staging | prod
#   branch: dev | prod
#
# Prerequisites: Node, Python 3.11+, PM2, repo at $REPO_DIR.
# On server: app-specific env files in ENV_DIR (default /home/ubuntu):
#   prod.qurieus.frontend.env, prod.qurieus.backend.env, prod.qurieus.bot.env
#   staging.qurieus.frontend.env, staging.qurieus.backend.env, staging.qurieus.bot.env

set -e

ENV=${1:-staging}
BRANCH=${2:-dev}
FRONTEND_CHANGED=${3:-true}
BACKEND_CHANGED=${4:-true}
BOT_CHANGED=${5:-true}

REPO_DIR=${REPO_DIR:-/home/ubuntu/qurieus}

if [ ! -d "$REPO_DIR" ]; then
  echo "❌ Repo not found at $REPO_DIR. Set REPO_DIR or run setup-ec2.sh first."
  exit 1
fi

echo "🚀 Deploying to $ENV (branch: $BRANCH) - no Docker"
echo "   Frontend: $FRONTEND_CHANGED | Backend: $BACKEND_CHANGED | Bot: $BOT_CHANGED"

# Sync or pull code
cd "$REPO_DIR"
if [ "$SKIP_GIT_PULL" = "1" ]; then
  echo "Code was rsynced from CI - skipping git pull"
  PREV_HEAD=$(git rev-parse HEAD~1 2>/dev/null || echo "HEAD")
else
  if [ -n "$GITLAB_DEPLOY_TOKEN" ] && [ -n "$GITLAB_DEPLOY_TOKEN_USER" ]; then
    GIT_URL="https://${GITLAB_DEPLOY_TOKEN_USER}:${GITLAB_DEPLOY_TOKEN}@gitlab.com/frontslash/apps/qurieus.git"
    git remote set-url origin "$GIT_URL" 2>/dev/null || git remote add origin "$GIT_URL"
  fi
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
  PREV_HEAD=$(git rev-parse HEAD~1 2>/dev/null || echo "HEAD")
fi

packages_changed() {
  local app_path=$1
  git diff --name-only $PREV_HEAD HEAD -- "$app_path/package.json" "$app_path/yarn.lock" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

requirements_changed() {
  git diff --name-only $PREV_HEAD HEAD -- "qurieus-backend/requirements.txt" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

# Copy app-specific env files from server (prod.qurieus.{app}.env or staging.qurieus.{app}.env)
ENV_DIR="${ENV_DIR:-/home/ubuntu}"
ENV_PREFIX="$([ "$ENV" = "prod" ] && echo "prod" || echo "staging").qurieus"

copy_app_env() {
  local app_dir=$1
  local app_name=$2   # frontend | backend | bot
  local src="$ENV_DIR/${ENV_PREFIX}.${app_name}.env"
  local dest="$REPO_DIR/$app_dir/.env"
  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "   $app_dir: ${ENV_PREFIX}.${app_name}.env -> .env"
  else
    echo "⚠️  No $src on server - create it for $ENV deployment"
    exit 1
  fi
}

echo "📋 Copying env files for $ENV..."
copy_app_env "qurieus-frontend" "frontend"
copy_app_env "qurieus-backend" "backend"
copy_app_env "qurieus-bot-teams" "bot"

# Deploy Frontend
if [ "$FRONTEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Frontend..."
  cd "$REPO_DIR/qurieus-frontend"
  PKG_CHANGED=$(packages_changed "qurieus-frontend")
  [ ! -d "node_modules" ] || [ "$PKG_CHANGED" = "yes" ] && yarn install --frozen-lockfile
  yarn prisma generate
  yarn prisma migrate deploy 2>/dev/null || true
  yarn build
  pm2 restart qurieus-frontend --update-env 2>/dev/null || (cd "$REPO_DIR" && REPO_DIR="$REPO_DIR" pm2 start ecosystem.config.cjs --only qurieus-frontend)
  echo "✅ Frontend deployed"
else
  echo "⏭️ Skipping Frontend"
fi

# Deploy Backend
if [ "$BACKEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Backend..."
  cd "$REPO_DIR/qurieus-backend"
  REQ_CHANGED=$(requirements_changed)
  if [ "$REQ_CHANGED" = "yes" ] || [ ! -d ".venv" ]; then
    python3 -m venv .venv 2>/dev/null || true
    .venv/bin/pip install -r requirements.txt -q
  fi
  pm2 restart qurieus-backend --update-env 2>/dev/null || (cd "$REPO_DIR" && REPO_DIR="$REPO_DIR" pm2 start ecosystem.config.cjs --only qurieus-backend)
  echo "✅ Backend deployed"
else
  echo "⏭️ Skipping Backend"
fi

# Deploy Bot
if [ "$BOT_CHANGED" = "true" ]; then
  echo "📦 Deploying MSTeams Bot..."
  cd "$REPO_DIR/qurieus-bot-teams"
  PKG_CHANGED=$(packages_changed "qurieus-bot-teams")
  [ ! -d "node_modules" ] || [ "$PKG_CHANGED" = "yes" ] && yarn install --frozen-lockfile
  pm2 restart qurieus-bot-teams --update-env 2>/dev/null || (cd "$REPO_DIR" && REPO_DIR="$REPO_DIR" pm2 start ecosystem.config.cjs --only qurieus-bot-teams)
  echo "✅ Bot deployed"
else
  echo "⏭️ Skipping Bot"
fi

pm2 save 2>/dev/null || true
echo "✅ Deployment completed!"
