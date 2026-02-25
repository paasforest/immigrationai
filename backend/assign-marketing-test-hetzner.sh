#!/bin/bash

# Assign users to marketing_test plan on Hetzner server
# This script runs on the Hetzner server where database is accessible

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"
BACKEND_PATH="/var/www/immigrationai/backend"

echo "🚀 Assigning users to marketing_test plan on Hetzner"
echo "====================================================="
echo ""

# Upload the script to Hetzner
echo "📤 Uploading script to Hetzner..."
scp backend/assign-marketing-test.js ${HETZNER_USER}@${HETZNER_IP}:${BACKEND_PATH}/

echo "✅ Script uploaded"
echo ""

# Run the script on Hetzner
echo "🔄 Running script on Hetzner..."
echo ""

if [ "$1" == "--all" ]; then
    echo "Assigning ALL users to marketing_test plan..."
    ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && node assign-marketing-test.js --all"
elif [ "$1" == "--list" ]; then
    echo "Listing users with marketing_test plan..."
    ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && node assign-marketing-test.js --list"
elif [ -n "$1" ]; then
    echo "Assigning user: $1"
    ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && node assign-marketing-test.js $1"
else
    echo "Listing all users..."
    ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && node assign-marketing-test.js"
fi

echo ""
echo "✅ Done!"
echo ""
