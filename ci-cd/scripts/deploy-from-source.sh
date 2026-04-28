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

# Load nvm if present (needed for node/yarn in non-interactive SSH).
# Source with explicit args so nvm does not parse deploy script positional args.
[ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" --no-use

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

ensure_nvm_loaded() {
  [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" --no-use
  command -v nvm >/dev/null 2>&1
}

install_nvm_if_missing() {
  if ensure_nvm_loaded; then
    return 0
  fi

  echo "📦 nvm not found. Installing nvm..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  else
    echo "❌ Neither curl nor wget is available to install nvm."
    return 1
  fi

  ensure_nvm_loaded
}

use_repo_node_version() {
  local nvmrc="$REPO_DIR/.nvmrc"
  if [ ! -f "$nvmrc" ]; then
    echo "❌ No .nvmrc found in repo. Refusing to continue without an explicit Node version."
    return 1
  fi

  local node_version
  node_version=$(tr -d '[:space:]' < "$nvmrc")
  if [ -z "$node_version" ]; then
    echo "❌ .nvmrc is empty. Refusing to continue."
    return 1
  fi

  install_nvm_if_missing || {
    echo "❌ Unable to install/load nvm; cannot guarantee Node version."
    return 1
  }

  echo "🟢 Using Node $node_version from .nvmrc"
  nvm install "$node_version"
  nvm use "$node_version"

  local active_node
  active_node=$(node -v 2>/dev/null || true)
  if [ -z "$active_node" ]; then
    echo "❌ Node is not available even after nvm use."
    return 1
  fi

  echo "✅ Active Node version: $active_node"
  return 0
}

use_repo_node_version || exit 1

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

# Sync .env.prod from repo to ENV_DIR (committed; deployed automatically on prod)
# Paddle keys are injected from GitLab CI/CD variables (not in repo)
if [ "$ENV" = "prod" ]; then
  if [ -f "$REPO_DIR/qurieus-frontend/.env.prod" ]; then
    cp "$REPO_DIR/qurieus-frontend/.env.prod" "$ENV_DIR/prod.qurieus.frontend.env"
    # Inject Paddle vars: from CI/CD env first, else from server-side file (masked/protected vars may not pass through SSH)
    if [ -n "$PADDLE_API_KEY" ] || [ -n "$NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" ] || [ -n "$PADDLE_WEBHOOK_SIGNING_KEY" ]; then
      {
        echo ""
        echo "# Paddle (from CI/CD variables)"
        [ -n "$PADDLE_API_KEY" ] && echo "PADDLE_API_KEY=$PADDLE_API_KEY"
        [ -n "$NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" ] && echo "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=$NEXT_PUBLIC_PADDLE_CLIENT_TOKEN"
        [ -n "$PADDLE_WEBHOOK_SIGNING_KEY" ] && echo "PADDLE_WEBHOOK_SIGNING_KEY=$PADDLE_WEBHOOK_SIGNING_KEY"
        [ -n "$BYPASS_WEBHOOK_VERIFICATION" ] && echo "BYPASS_WEBHOOK_VERIFICATION=$BYPASS_WEBHOOK_VERIFICATION"
      } >> "$ENV_DIR/prod.qurieus.frontend.env"
      echo "   Injected Paddle vars from CI/CD"
    elif [ -f "$ENV_DIR/prod.paddle.env" ]; then
      echo "" >> "$ENV_DIR/prod.qurieus.frontend.env"
      echo "# Paddle (from server-side prod.paddle.env)" >> "$ENV_DIR/prod.qurieus.frontend.env"
      cat "$ENV_DIR/prod.paddle.env" >> "$ENV_DIR/prod.qurieus.frontend.env"
      echo "   Injected Paddle vars from prod.paddle.env"
    fi
    echo "   Synced frontend .env.prod from repo"
  else
    echo "⚠️  Missing qurieus-frontend/.env.prod - expected in repo for prod"
    exit 1
  fi
  if [ -f "$REPO_DIR/qurieus-backend/.env.prod" ]; then
    cp "$REPO_DIR/qurieus-backend/.env.prod" "$ENV_DIR/prod.qurieus.backend.env"
    echo "   Synced backend .env.prod from repo"
  else
    echo "⚠️  Missing qurieus-backend/.env.prod - expected in repo for prod"
    exit 1
  fi
fi

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

# Ensure AUTH_TRUST_HOST for NextAuth behind nginx (session persistence after login)
grep -q '^AUTH_TRUST_HOST=' "$REPO_DIR/qurieus-frontend/.env" 2>/dev/null || echo "AUTH_TRUST_HOST=true" >> "$REPO_DIR/qurieus-frontend/.env"

# Deploy Frontend
if [ "$FRONTEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Frontend..."
  cd "$REPO_DIR/qurieus-frontend"
  PKG_CHANGED=$(packages_changed "qurieus-frontend")
  [ ! -d "node_modules" ] || [ "$PKG_CHANGED" = "yes" ] && yarn install --frozen-lockfile
  yarn prisma generate
  yarn prisma migrate deploy
  # Inject build time for header display (user can verify latest deploy)
  export NEXT_PUBLIC_BUILD_TIME=$(date -u +"%Y-%m-%d %H:%M UTC")
  yarn build
  pm2 restart qurieus-frontend --update-env 2>/dev/null || (cd "$REPO_DIR" && REPO_DIR="$REPO_DIR" pm2 start ecosystem.config.cjs --only qurieus-frontend)
  echo "✅ Frontend deployed"
else
  echo "⏭️ Skipping Frontend build"
  # Always restart frontend so it picks up env changes (e.g. Paddle keys)
  pm2 restart qurieus-frontend --update-env 2>/dev/null && echo "   Frontend restarted (env refresh)" || true
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

# Ensure watchdog timer is present and points to latest script from repo.
if [ -x "$REPO_DIR/ci-cd/scripts/install-qurieus-watchdog.sh" ]; then
  REPO_DIR="$REPO_DIR" "$REPO_DIR/ci-cd/scripts/install-qurieus-watchdog.sh" || true
fi

# Deploy nginx site config if present
NGINX_SITE="$REPO_DIR/qurieus-backend/nginx/sites-available/qurieus"
if [ -f "$NGINX_SITE" ]; then
  echo "📋 Updating nginx config..."
  sudo cp "$NGINX_SITE" /etc/nginx/sites-available/qurieus
  sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null && echo "   nginx reloaded" || echo "   ⚠️ nginx reload skipped (check config)"
fi

echo "✅ Deployment completed!"
