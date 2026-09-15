@echo off
setlocal enabledelayedexpansion

set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=main
set CONTAINER_NAME=sikebut-app

echo =========================================
echo  Starting Deployment for %CONTAINER_NAME%
echo  Branch: %BRANCH%
echo =========================================

echo [1/4] Pulling latest code from Git...
git fetch origin %BRANCH%
git checkout %BRANCH%
git pull origin %BRANCH%

if not exist .env.production (
  echo [WARNING] .env.production not found!
  if exist .env.example (
    copy .env.example .env.production
  )
)

echo [2/4] Building and starting Docker container...
docker compose build
docker compose up -d --remove-orphans

echo [3/4] Cleaning up unused build images...
docker image prune -f

echo [4/4] Verifying container status...
docker compose ps

echo =========================================
echo  Deployment Completed Successfully!
echo =========================================
