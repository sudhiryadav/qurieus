#!/usr/bin/env bash
set -euo pipefail

CLOUD_RUN_PORT="${PORT:-8080}"
export BACKEND_PORT="${BACKEND_PORT:-8001}"
export FRONTEND_PORT="${FRONTEND_PORT:-8000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export NODE_ENV="${NODE_ENV:-production}"
export PATH="/opt/venv/bin:${PATH}"
export HF_HOME="${HF_HOME:-/app/hf-cache}"
export TRANSFORMERS_CACHE="${TRANSFORMERS_CACHE:-/app/hf-cache}"
export TRANSFORMERS_OFFLINE="${TRANSFORMERS_OFFLINE:-1}"
export HF_HUB_OFFLINE="${HF_HUB_OFFLINE:-1}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Add it in Cloud Run → Variables & Secrets."
  exit 1
fi

sed "s/LISTEN_PORT/${CLOUD_RUN_PORT}/g" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

wait_for_tcp() {
  local port="$1"
  local name="$2"
  local pid="$3"
  local timeout="${4:-180}"
  local i=0
  echo "Waiting for ${name} to listen on 127.0.0.1:${port}..."
  while ! (echo >/dev/tcp/127.0.0.1/"${port}") >/dev/null 2>&1; do
    if ! kill -0 "${pid}" 2>/dev/null; then
      echo "ERROR: ${name} (pid ${pid}) exited before opening port ${port}."
      exit 1
    fi
    i=$((i + 1))
    if [ "${i}" -ge "${timeout}" ]; then
      echo "ERROR: ${name} did not listen on ${port} within ${timeout}s."
      exit 1
    fi
    sleep 1
  done
  echo "${name} is listening on ${port}."
}

echo "Applying Prisma migrations..."
cd /app/qurieus-frontend
MIGRATE_DATABASE_URL="${DIRECT_DATABASE_URL:-${DATABASE_URL}}"
DATABASE_URL="${MIGRATE_DATABASE_URL}" npx prisma migrate deploy

echo "Starting FastAPI backend on 127.0.0.1:${BACKEND_PORT}..."
cd /app/qurieus-backend
FAST_API_HOST=127.0.0.1 FAST_API_PORT="${BACKEND_PORT}" \
  uvicorn main:app --host 127.0.0.1 --port "${BACKEND_PORT}" &
BACKEND_PID=$!

echo "Starting Next.js frontend on 127.0.0.1:${FRONTEND_PORT}..."
cd /app/qurieus-frontend
PORT="${FRONTEND_PORT}" HOSTNAME=0.0.0.0 NODE_NO_WARNINGS=1 node server.js &
FRONTEND_PID=$!

wait_for_tcp "${BACKEND_PORT}" "backend" "${BACKEND_PID}"
wait_for_tcp "${FRONTEND_PORT}" "frontend" "${FRONTEND_PID}"

echo "Starting nginx on port ${CLOUD_RUN_PORT}..."
nginx -g "daemon off;" &
NGINX_PID=$!

shutdown() {
  echo "Shutting down..."
  kill "${NGINX_PID}" "${FRONTEND_PID}" "${BACKEND_PID}" 2>/dev/null || true
  wait "${NGINX_PID}" "${FRONTEND_PID}" "${BACKEND_PID}" 2>/dev/null || true
}

trap shutdown SIGTERM SIGINT

wait -n "${NGINX_PID}" "${FRONTEND_PID}" "${BACKEND_PID}"
status=$?
echo "A process exited (status ${status}). Stopping the container."
shutdown
exit "${status}"
