#!/bin/bash
# Installs/updates systemd timer that runs Qurieus watchdog every minute.

set -e

REPO_DIR=${REPO_DIR:-/home/ubuntu/qurieus}
SCRIPT_SOURCE="$REPO_DIR/ci-cd/scripts/qurieus-watchdog.sh"
SCRIPT_TARGET="/usr/local/bin/qurieus-watchdog.sh"
SERVICE_FILE="/etc/systemd/system/qurieus-watchdog.service"
TIMER_FILE="/etc/systemd/system/qurieus-watchdog.timer"

if [ ! -f "$SCRIPT_SOURCE" ]; then
  echo "⚠️ Watchdog source script not found at $SCRIPT_SOURCE"
  exit 1
fi

sudo install -m 755 "$SCRIPT_SOURCE" "$SCRIPT_TARGET"

sudo tee "$SERVICE_FILE" >/dev/null <<'EOF'
[Unit]
Description=Qurieus PM2 watchdog
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/qurieus-watchdog.sh
EOF

sudo tee "$TIMER_FILE" >/dev/null <<'EOF'
[Unit]
Description=Run Qurieus watchdog every minute

[Timer]
OnBootSec=30s
OnUnitActiveSec=60s
AccuracySec=10s
Unit=qurieus-watchdog.service
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now qurieus-watchdog.timer
sudo systemctl restart qurieus-watchdog.timer

echo "✅ Qurieus watchdog timer installed/updated"
sudo systemctl status qurieus-watchdog.timer --no-pager -n 20 || true
