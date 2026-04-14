#!/bin/bash
# Auto-heal watchdog for Qurieus PM2 services.

set -u

PM2_HOME="/home/ubuntu/.pm2"
PM2_CMD="/usr/local/bin/pm2"

if [ ! -x "$PM2_CMD" ]; then
  PM2_CMD="$(command -v pm2 2>/dev/null || true)"
fi

if [ -z "$PM2_CMD" ]; then
  logger -t qurieus-watchdog "pm2 binary not found; skipping run"
  exit 0
fi

run_pm2() {
  sudo -u ubuntu env PM2_HOME="$PM2_HOME" "$PM2_CMD" "$@"
}

restart_app() {
  local app="$1"
  logger -t qurieus-watchdog "Restarting $app"
  run_pm2 restart "$app" --update-env >/dev/null 2>&1 || true
}

check_http() {
  local url="$1"
  curl -fsS --max-time 12 "$url" >/dev/null 2>&1
}

# Keep PM2 daemon process list persistent.
run_pm2 save >/dev/null 2>&1 || true

# Ensure expected apps exist and are online in PM2.
for app in qurieus-frontend qurieus-backend qurieus-bot-teams; do
  if ! run_pm2 pid "$app" 2>/dev/null | awk '$1 > 0 { found=1 } END { exit(found ? 0 : 1) }'; then
    logger -t qurieus-watchdog "$app has no live PID in PM2"
    restart_app "$app"
  fi
done

# Health probes.
if ! check_http "http://127.0.0.1:8000/"; then
  logger -t qurieus-watchdog "Frontend health probe failed on 127.0.0.1:8000"
  restart_app "qurieus-frontend"
fi

if ! check_http "http://127.0.0.1:8001/"; then
  logger -t qurieus-watchdog "Backend health probe failed on 127.0.0.1:8001"
  restart_app "qurieus-backend"
fi

if ! check_http "https://qurieus.com/"; then
  logger -t qurieus-watchdog "Public site health probe failed on https://qurieus.com/"
  restart_app "qurieus-frontend"
  sleep 5
  check_http "https://qurieus.com/" || logger -t qurieus-watchdog "Public site still failing after frontend restart"
fi

run_pm2 save >/dev/null 2>&1 || true

