#!/bin/bash

# Quick script to find backend path on Hetzner

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"

echo "🔍 Finding backend path on Hetzner server..."
echo ""

# Common paths to check
PATHS=(
    "/var/www/immigration_ai/backend"
    "/var/www/immigrationai/backend"
    "/opt/immigration_ai/backend"
    "/home/root/immigration_ai/backend"
    "~/immigration_ai/backend"
)

echo "Checking common locations..."
echo ""

for path in "${PATHS[@]}"; do
    echo -n "Checking $path... "
    if ssh ${HETZNER_USER}@${HETZNER_IP} "test -d $path && echo 'FOUND' || echo 'not found'" 2>/dev/null | grep -q "FOUND"; then
        echo "✅ FOUND!"
        echo ""
        echo "📍 Backend path: $path"
        echo ""
        echo "Use this path in the deployment script:"
        echo "  $path"
        exit 0
    else
        echo "❌"
    fi
done

echo ""
echo "❌ Backend path not found in common locations."
echo ""
echo "Let's check where PM2 is running from:"
ssh ${HETZNER_USER}@${HETZNER_IP} "pm2 list 2>/dev/null | grep immigration || echo 'PM2 not running or process not found'"

echo ""
echo "Or check for package.json files:"
ssh ${HETZNER_USER}@${HETZNER_IP} "find /var/www /opt /home -name 'package.json' -path '*/backend/*' 2>/dev/null | head -5"
