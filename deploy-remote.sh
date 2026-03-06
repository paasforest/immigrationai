#!/bin/bash
# Deploy to Hetzner: pull latest and restart frontend + backend
# Run from your local machine (requires SSH access to server)

set -e

HETZNER_IP="${HETZNER_IP:-78.46.183.41}"
HETZNER_USER="${HETZNER_USER:-root}"
REPO_PATH="${REPO_PATH:-/var/www/immigrationai}"

echo "Deploying to ${HETZNER_USER}@${HETZNER_IP} (path: ${REPO_PATH})"
echo ""

ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH} && git pull origin main"
echo "Pulled latest code."
echo ""

echo "Restarting backend..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH}/backend && pm2 restart immigration-backend || pm2 restart all || true"
echo ""

echo "Restarting frontend (if managed by pm2)..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${REPO_PATH} && (pm2 restart immigration-frontend 2>/dev/null || pm2 restart next 2>/dev/null || pm2 restart all 2>/dev/null || echo 'Restart frontend manually if needed')"
echo ""

echo "Done."
echo "Verify: ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 status'"
echo ""
echo "If your server path or host differ, run:"
echo "  REPO_PATH=/var/www/immigrationai HETZNER_IP=78.46.183.41 ./deploy-remote.sh"
