#!/bin/bash
# Update email values in deployment env files on server.
# Run this on the server (or via: ssh user@server 'bash -s' < ci-cd/scripts/update-env-emails.sh)
#
# Changes: support@qurieus.com, hello@qurieus.com -> hello@qurieus.com

ENV_DIR="${ENV_DIR:-/home/ubuntu}"

update_file() {
  local f="$1"
  if [ -f "$f" ]; then
    # support@qurieus.com -> hello@qurieus.com
    sed -i.bak "s/support@qurieus\.com/hello@qurieus.com/g" "$f"
    # hello@qurieus.com -> hello@qurieus.com (lowercase hello)
    sed -i.bak "s/hello@qurieus\.com/hello@qurieus.com/g" "$f"
    # admin@qurieus.com fallback -> hello@qurieus.com
    sed -i.bak "s/admin@qurieus\.com/hello@qurieus.com/g" "$f"
    rm -f "${f}.bak"
    echo "Updated: $f"
  else
    echo "Skip (not found): $f"
  fi
}

echo "Updating email values in $ENV_DIR..."
update_file "$ENV_DIR/prod.qurieus.frontend.env"
update_file "$ENV_DIR/prod.qurieus.backend.env"
update_file "$ENV_DIR/prod.qurieus.bot.env"
update_file "$ENV_DIR/staging.qurieus.frontend.env"
update_file "$ENV_DIR/staging.qurieus.backend.env"
update_file "$ENV_DIR/staging.qurieus.bot.env"
echo "Done. Restart apps to pick up changes: pm2 restart all"
