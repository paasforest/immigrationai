#!/bin/bash
set -e

echo "=== Stopping old backend process ==="
pkill -f "node dist/app.js" 2>/dev/null && echo "Killed old process" || echo "No old process running"
sleep 1

echo "=== Pulling latest code ==="
cd /var/www/immigrationai/backend
git fetch origin main
git reset --hard origin/main

echo "=== Installing dependencies ==="
npm install --production=false

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy

echo "=== Seeding visa requirements (upsert — safe to re-run) ==="
npx ts-node prisma/seed-visa-requirements.ts

echo "=== Building ==="
npm run build 2>&1 | tail -10

echo "=== Starting backend ==="
nohup node dist/app.js > /var/log/immigrationai-backend.log 2>&1 &
echo "Backend PID: $!"

sleep 4

echo "=== Health check ==="
curl -si http://127.0.0.1:4000/api/health
