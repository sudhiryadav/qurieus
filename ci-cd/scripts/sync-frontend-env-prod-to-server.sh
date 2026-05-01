#!/bin/bash
# OPTIONAL: One-off sync of local qurieus-frontend/.env to server.
# Use this for manual secret updates without a full deploy.
#
# Usage: ./sync-frontend-env-prod-to-server.sh [server_user@server_ip]
#   Or set: PROD_SSH_TARGET=ubuntu@your-prod-ip
#
# Copies qurieus-frontend/.env -> server's prod.qurieus.frontend.env

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_PROD="$REPO_ROOT/qurieus-frontend/.env"
ENV_FILE="/home/ubuntu/prod.qurieus.frontend.env"

SSH_TARGET="${1:-$PROD_SSH_TARGET}"

if [ -z "$SSH_TARGET" ]; then
  echo "Usage: $0 ubuntu@your-prod-server-ip"
  echo "   Or: PROD_SSH_TARGET=ubuntu@ip $0"
  exit 1
fi

if [ ! -f "$ENV_PROD" ]; then
  echo "Error: $ENV_PROD not found."
  exit 1
fi

echo "Syncing .env to $SSH_TARGET:$ENV_FILE"

scp "$ENV_PROD" "$SSH_TARGET:$ENV_FILE"

echo "Done. Restart the frontend to pick up changes:"
echo "  ssh $SSH_TARGET 'cd /home/ubuntu/qurieus && pm2 restart qurieus-frontend --update-env'"
