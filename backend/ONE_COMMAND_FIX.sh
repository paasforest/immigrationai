#!/bin/bash

# ONE COMMAND FIX - Run migration on Hetzner
# This script does everything automatically

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"

echo "🚀 Running migration on Hetzner server..."
echo ""

# Step 1: Find backend directory
echo "🔍 Finding backend directory..."
BACKEND_PATH=$(ssh ${HETZNER_USER}@${HETZNER_IP} "find / -name 'schema.prisma' 2>/dev/null | head -1 | xargs dirname")

if [ -z "$BACKEND_PATH" ]; then
    echo "❌ Could not find backend directory automatically"
    echo ""
    echo "Please SSH to server and find it manually:"
    echo "  ssh ${HETZNER_USER}@${HETZNER_IP}"
    echo "  find / -name 'schema.prisma' 2>/dev/null"
    exit 1
fi

echo "✅ Found backend at: ${BACKEND_PATH}"
echo ""

# Step 2: Pull latest code
echo "📥 Pulling latest code..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && git pull origin main || echo 'Git pull skipped'"

# Step 3: Run migration
echo "🔧 Running migration..."
ssh ${HETZNER_USER}@${HETZNER_IP} << EOF
cd ${BACKEND_PATH}
echo "📍 Directory: \$(pwd)"
echo "📦 Running migration..."
npx prisma migrate dev --name add_multi_tenant_models
echo "✅ Generating Prisma Client..."
npx prisma generate
EOF

# Step 4: Restart backend
echo ""
echo "🔄 Restarting backend..."
ssh ${HETZNER_USER}@${HETZNER_IP} "pm2 restart all || systemctl restart immigration-ai || echo 'Please restart manually'"

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Verify:"
echo "  ssh ${HETZNER_USER}@${HETZNER_IP}"
echo "  cd ${BACKEND_PATH}"
echo "  npx prisma studio"
