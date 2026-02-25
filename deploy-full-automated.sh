#!/bin/bash

###############################################################################
# FULLY AUTOMATED DEPLOYMENT TO HETZNER
# This script handles everything: commit, push, deploy
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║         Full Automated Deployment to Hetzner                          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Configuration
HETZNER_IP="78.46.183.41"
HETZNER_USER="root"
BACKEND_PATH="/var/www/immigrationai/backend"

# Step 1: Check if we need to push to GitHub
echo -e "${BLUE}📋 Step 1: Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    read -p "Commit and push to GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}💾 Committing changes...${NC}"
        git add -A
        git commit -m "fix: TypeScript build errors and prepare for deployment" || echo "No changes to commit"
        echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
        git push origin main || {
            echo -e "${RED}❌ Push failed. Please push manually: git push origin main${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Pushed to GitHub${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Check if we're ahead of origin
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
if [ "$AHEAD" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  You have $AHEAD unpushed commits${NC}"
    read -p "Push to GitHub now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main || {
            echo -e "${RED}❌ Push failed${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Pushed to GitHub${NC}"
    fi
fi

echo ""

# Step 2: Test SSH connection
echo -e "${BLUE}📡 Step 2: Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${HETZNER_USER}@${HETZNER_IP} "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to Hetzner server${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is set up: ssh-copy-id ${HETZNER_USER}@${HETZNER_IP}"
    echo "  2. Server is accessible"
    echo "  3. Firewall allows SSH"
    echo ""
    echo "Or run deployment manually on Hetzner (see MANUAL_DEPLOY.md)"
    exit 1
fi

echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Step 3: Deploy to Hetzner
echo -e "${BLUE}🚀 Step 3: Deploying to Hetzner...${NC}"
echo -e "${YELLOW}📍 Backend path: ${BACKEND_PATH}${NC}"
echo ""

ssh ${HETZNER_USER}@${HETZNER_IP} << EOF
set -e

cd ${BACKEND_PATH}
echo "📍 Current directory: \$(pwd)"

# Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main || {
    echo "⚠️  Git pull failed - check manually"
    exit 1
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
    exit 1
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
echo "📝 Recent logs (last 10 lines):"
pm2 logs immigration-backend --lines 10 --nostream || true
EOF

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ DEPLOYMENT COMPLETE                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Verification Steps:${NC}"
echo ""
echo "1. Test API endpoint:"
echo "   curl https://api.immigrationai.co.za/api/intake/services"
echo ""
echo "2. Check PM2 status:"
echo "   ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 status'"
echo ""
echo "3. Check logs:"
echo "   ssh ${HETZNER_USER}@${HETZNER_IP} 'pm2 logs immigration-backend --lines 50'"
echo ""
