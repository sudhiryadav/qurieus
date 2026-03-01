#!/bin/bash
# Run on server AFTER migrating to PM2. Stops containers, removes Docker.

set -e

echo "🛑 Stopping Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "🗑️ Removing Docker..."
sudo apt remove -y docker.io docker-doc docker-compose docker-compose-v2 2>/dev/null || true
sudo apt purge -y docker-ce docker-ce-cli containerd.io 2>/dev/null || true
sudo rm -rf /var/lib/docker /var/lib/containerd

echo "✅ Docker removed. Apps run via PM2."
