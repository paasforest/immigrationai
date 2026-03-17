#!/bin/bash
# Deploy backend to Hetzner (pull, migrate, prisma generate, build, pm2 restart).
# Frontend is on Vercel and auto-deploys when you push to git; this script does not touch it.
# Run from your local machine (requires SSH access to server).

set -e

HETZNER_IP="${HETZNER_IP:-78.46.183.41}"
HETZNER_USER="${HETZNER_USER:-root}"
REPO_PATH="${REPO_PATH:-/var/www/immigrationai}"

echo "Deploying to ${HETZNER_USER}@${HETZNER_IP} (path: ${REPO_PATH})"
echo ""

ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH} && git pull origin main"
echo "Pulled latest code."
echo ""

echo "Running database migrations..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH}/backend && npx prisma migrate deploy"
echo "Migrations done."
echo ""

echo "Generating Prisma client..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH}/backend && npx prisma generate"
echo ""

echo "Building backend (so dist/ has current routes, e.g. /api/organizations/me)..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH}/backend && npm run build"
echo "Build done."
echo ""

echo "Restarting backend..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH}/backend && pm2 restart immigration-backend || pm2 restart all || true"
echo ""

echo "Done. (Frontend on Vercel updates automatically when you push to git.)"
echo "Verify: ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 status'"
echo ""
echo "If your server path or host differ, run:"
echo "  REPO_PATH=/var/www/immigrationai HETZNER_IP=78.46.183.41 ./deploy-remote.sh"
