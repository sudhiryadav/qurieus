#!/bin/bash
# Git-based deployment - NO Docker. Pulls code, conditional install, build, PM2 restart.
#
# Usage: ./deploy-from-source.sh <env> <branch> [frontend_changed] [backend_changed] [bot_changed]
#   env: staging | prod
#   branch: dev | prod
#
# Prerequisites: Node, Python 3.11+, PM2, repo at $REPO_DIR.
# CI is expected to place app-specific .env files at:
#   $REPO_DIR/qurieus-frontend/.env
#   $REPO_DIR/qurieus-backend/.env
#   $REPO_DIR/qurieus-bot-teams/.env

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

normalize_node_version() {
  # Strips leading "v" and surrounding whitespace.
  printf "%s" "$1" | tr -d '[:space:]' | sed 's/^v//'
}

version_matches_nvmrc() {
  local requested normalized_requested active normalized_active
  requested="$1"
  active="$2"
  normalized_requested=$(normalize_node_version "$requested")
  normalized_active=$(normalize_node_version "$active")

  # Exact version pin (e.g. 24.15.0) must match fully.
  if printf "%s" "$normalized_requested" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    [ "$normalized_active" = "$normalized_requested" ]
    return $?
  fi

  # Major pin (e.g. 24) accepts any v24.x.y currently active.
  if printf "%s" "$normalized_requested" | grep -Eq '^[0-9]+$'; then
    [ "${normalized_active%%.*}" = "$normalized_requested" ]
    return $?
  fi

  # For aliases like lts/* we cannot reliably compare without nvm.
  return 1
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

use_node_version_from_nvmrc() {
  local nvmrc="$1"
  if [ ! -f "$nvmrc" ]; then
    echo "❌ No .nvmrc found at $nvmrc. Refusing to continue without an explicit Node version."
    return 1
  fi

  local node_version
  node_version=$(tr -d '[:space:]' < "$nvmrc")
  if [ -z "$node_version" ]; then
    echo "❌ .nvmrc is empty. Refusing to continue."
    return 1
  fi

  # Fast-path: if current node already satisfies .nvmrc, skip nvm install.
  local active_node
  active_node=$(node -v 2>/dev/null || true)
  if [ -n "$active_node" ] && version_matches_nvmrc "$node_version" "$active_node"; then
    echo "✅ Reusing existing Node version: $active_node (matches .nvmrc=$node_version)"
    return 0
  fi

  install_nvm_if_missing || {
    echo "❌ Unable to install/load nvm; cannot guarantee Node version."
    return 1
  }

  echo "🟢 Using Node $node_version from $(dirname "$nvmrc")/.nvmrc"
  # Binary-only install avoids expensive source builds in CI deploys.
  # If binary is unavailable, fail fast with actionable guidance.
  if ! nvm install --binary "$node_version"; then
    echo "❌ Binary Node install failed for $node_version (source build disabled to prevent deploy timeout)."
    echo "   Preinstall this Node version on the server (NodeSource or manual tarball), then redeploy."
    return 1
  fi
  nvm use "$node_version"

  active_node=$(node -v 2>/dev/null || true)
  if [ -z "$active_node" ]; then
    echo "❌ Node is not available even after nvm use."
    return 1
  fi

  echo "✅ Active Node version: $active_node"
  return 0
}

use_repo_node_version() {
  use_node_version_from_nvmrc "$REPO_DIR/.nvmrc"
}

use_app_node_version() {
  local app_dir="$1"
  local app_nvmrc="$REPO_DIR/$app_dir/.nvmrc"
  if [ -f "$app_nvmrc" ]; then
    use_node_version_from_nvmrc "$app_nvmrc"
  else
    use_repo_node_version
  fi
}

use_repo_node_version || exit 1

packages_changed() {
  local app_path=$1
  git diff --name-only $PREV_HEAD HEAD -- "$app_path/package.json" "$app_path/yarn.lock" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

requirements_changed() {
  git diff --name-only $PREV_HEAD HEAD -- "qurieus-backend/requirements.txt" 2>/dev/null | grep -q . && echo "yes" || echo "no"
}

ensure_app_env_exists() {
  local app_dir=$1
  local env_path="$REPO_DIR/$app_dir/.env"
  if [ ! -f "$env_path" ]; then
    echo "❌ Missing $env_path"
    echo "   CI must upload File variable content to this path before deploy."
    exit 1
  fi
}

echo "📋 Validating app env files..."
ensure_app_env_exists "qurieus-frontend"
ensure_app_env_exists "qurieus-backend"
ensure_app_env_exists "qurieus-bot-teams"

# Ensure AUTH_TRUST_HOST for NextAuth behind nginx (session persistence after login)
grep -q '^AUTH_TRUST_HOST=' "$REPO_DIR/qurieus-frontend/.env" 2>/dev/null || echo "AUTH_TRUST_HOST=true" >> "$REPO_DIR/qurieus-frontend/.env"

# Deploy Frontend
if [ "$FRONTEND_CHANGED" = "true" ]; then
  echo "📦 Deploying Frontend..."
  use_app_node_version "qurieus-frontend" || exit 1
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
  use_app_node_version "qurieus-bot-teams" || exit 1
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
