#!/bin/bash

###############################################################################
# DEPLOY MARKETPLACE TO HETZNER
# Run this after committing to git
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║         Marketplace Deployment to Hetzner                            ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Get backend path (with default)
DEFAULT_BACKEND_PATH="/var/www/immigrationai/backend"

echo -e "${YELLOW}📍 Where is your backend code on Hetzner?${NC}"
echo "Common locations:"
echo "  - /var/www/immigrationai/backend (default)"
echo "  - /var/www/immigration_ai/backend"
echo "  - /opt/immigration_ai/backend"
echo ""
read -p "Enter backend path [${DEFAULT_BACKEND_PATH}]: " BACKEND_PATH

# Use default if empty
BACKEND_PATH=${BACKEND_PATH:-$DEFAULT_BACKEND_PATH}

if [ -z "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Backend path required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using path: ${BACKEND_PATH}${NC}"

# Test SSH connection
echo ""
echo -e "${BLUE}📡 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 ${HETZNER_USER}@${HETZNER_IP} "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to Hetzner server${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is set up: ssh-copy-id ${HETZNER_USER}@${HETZNER_IP}"
    echo "  2. Server is accessible"
    echo "  3. Firewall allows SSH"
    exit 1
fi

echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Deploy
echo -e "${BLUE}🚀 Deploying marketplace system...${NC}"
echo ""

ssh ${HETZNER_USER}@${HETZNER_IP} << EOF
set -e

cd ${BACKEND_PATH}
echo "📍 Current directory: \$(pwd)"

# Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main || {
    echo "⚠️  Git pull failed - continuing with existing code"
}

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

# Run migrations
echo ""
echo "🔧 Running Prisma migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migration failed - check manually"
}

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed services
echo ""
echo "🌱 Seeding marketplace services..."
npm run seed:services || {
    echo "⚠️  Service seeding failed - check manually"
}

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build || {
    echo "❌ Build failed"
    exit 1
}

# Restart PM2
echo ""
echo "🔄 Restarting PM2..."
pm2 restart immigration-backend || pm2 start dist/app.js --name immigration-backend || {
    echo "⚠️  PM2 restart failed - check manually"
}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs immigration-backend --lines 10 --nostream || true
EOF

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ DEPLOYMENT COMPLETE                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Verify backend is running:"
echo "   ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 status'"
echo ""
echo "2. Check logs:"
echo "   ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 logs immigration-backend'"
echo ""
echo "3. Test API endpoint:"
echo "   curl https://api.immigrationai.co.za/api/intake/services"
echo ""
echo "4. Verify database migration:"
echo "   ssh ${HETZNER_USER}@${HETZNER_IP} 'cd ${BACKEND_PATH} && npx prisma studio'"
echo ""
