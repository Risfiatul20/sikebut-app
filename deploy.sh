#!/usr/bin/env bash
set -e

# Configuration
BRANCH="${1:-main}"
CONTAINER_NAME="sikebut-app"

echo "========================================="
echo " Starting Deployment for ${CONTAINER_NAME}"
echo " Branch: ${BRANCH}"
echo "========================================="

# 1. Fetch & pull latest changes from Git
echo "[1/4] Pulling latest code from Git..."
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

# 2. Check environment file
if [ ! -f .env.production ]; then
  echo "[WARNING] .env.production not found! Creating default template if missing..."
  if [ -f .env.example ]; then
    cp .env.example .env.production
  fi
fi

# 3. Build & start Docker containers
echo "[2/4] Building and starting Docker container..."
docker compose build
docker compose up -d --remove-orphans

# 4. Clean up unused images (dangling build stages)
echo "[3/4] Cleaning up unused build images..."
docker image prune -f

# 5. Verify deployment status
echo "[4/4] Verifying container status..."
sleep 5
docker compose ps

echo "========================================="
echo " Deployment Completed Successfully! "
echo "========================================="
