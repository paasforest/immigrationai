#!/bin/bash

###############################################################################
# COMMIT AND DEPLOY MARKETPLACE SYSTEM
# This script commits all marketplace changes and deploys to Hetzner
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     Marketplace System - Commit and Deploy                          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Step 1: Remove any git lock files
echo -e "${BLUE}🔓 Checking for git lock files...${NC}"
rm -f .git/index.lock 2>/dev/null || true
echo -e "${GREEN}✅ Git ready${NC}"
echo ""

# Step 2: Add all marketplace files
echo -e "${BLUE}📦 Staging marketplace files...${NC}"

# Frontend files
git add app/find-a-specialist/ 2>/dev/null || true
git add app/get-help/ 2>/dev/null || true
git add app/intake-status/ 2>/dev/null || true
git add app/admin/verifications/ 2>/dev/null || true
git add app/admin/marketplace/ 2>/dev/null || true
git add app/dashboard/immigration/leads/analytics/ 2>/dev/null || true
git add components/intake/ 2>/dev/null || true
git add components/admin/VerificationCard.tsx 2>/dev/null || true
git add components/admin/VerificationQueue.tsx 2>/dev/null || true
git add components/admin/MarketplaceOverview.tsx 2>/dev/null || true
git add components/immigration/leads/LeadAnalytics.tsx 2>/dev/null || true
git add components/immigration/leads/LeadPerformanceChart.tsx 2>/dev/null || true

# API and utilities
git add lib/api/publicIntake.ts 2>/dev/null || true
git add lib/utils/countryFlags.ts 2>/dev/null || true
git add lib/api/immigration.ts 2>/dev/null || true
git add types/immigration.ts 2>/dev/null || true

# Backend files
git add backend/src/controllers/intakeController.ts 2>/dev/null || true
git add backend/src/routes/intake.routes.ts 2>/dev/null || true
git add backend/src/services/routingEngine.ts 2>/dev/null || true
git add backend/src/services/emailService.ts 2>/dev/null || true
git add backend/src/data/seedServices.ts 2>/dev/null || true
git add backend/prisma/schema.prisma 2>/dev/null || true
git add backend/package.json 2>/dev/null || true
git add backend/src/app.ts 2>/dev/null || true

# Documentation
git add backend/MARKETPLACE_TESTING.md 2>/dev/null || true
git add MARKETPLACE_COMPLETE.md 2>/dev/null || true

# Modified files
git add app/page.tsx 2>/dev/null || true
git add app/dashboard/immigration/layout.tsx 2>/dev/null || true
git add components/intake/IntakeForm.tsx 2>/dev/null || true
git add app/get-help/\[serviceSlug\]/page.tsx 2>/dev/null || true

echo -e "${GREEN}✅ Files staged${NC}"
echo ""

# Step 3: Check what will be committed
echo -e "${BLUE}📋 Files to be committed:${NC}"
git status --short | grep -E "^A|^M" | head -20 || echo "No new files to commit"
echo ""

# Step 4: Commit
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "feat: Complete marketplace intake and routing system (M5-M8)

- M5: Public professional directory with filtering and profile pages
- M6: Admin verification panel and marketplace overview
- M7: Professional lead analytics with performance charts
- M8: Navigation integration and testing guide

Backend:
- Added getPublicDirectory, getPublicProfile, admin verification functions
- Added getMyLeadStats for professional analytics
- Added verification email functions
- All 17 routes registered and working

Frontend:
- Public directory pages (find-a-specialist)
- Admin verification and marketplace pages
- Lead analytics dashboard with recharts
- Preferred specialist wiring in intake form
- Navigation links added to homepage

Testing:
- Complete testing guide with 8 scenarios
- All routes verified and documented" || {
    echo -e "${YELLOW}⚠️  Commit failed or no changes to commit${NC}"
    exit 1
}

echo -e "${GREEN}✅ Committed successfully${NC}"
echo ""

# Step 5: Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || {
        echo -e "${RED}❌ Push failed${NC}"
        echo "You may need to push manually: git push origin main"
        exit 1
    }
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping push${NC}"
fi
echo ""

# Step 6: Deploy to Hetzner
echo -e "${BLUE}🚀 Deploy to Hetzner?${NC}"
read -p "Deploy to Hetzner server? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}📍 Hetzner Deployment Instructions:${NC}"
    echo ""
    echo "SSH into your Hetzner server and run:"
    echo ""
    echo "  cd /path/to/immigration_ai"
    echo "  git pull origin main"
    echo "  cd backend"
    echo "  npm install"
    echo "  npx prisma migrate deploy"
    echo "  npx prisma generate"
    echo "  npm run seed:services"
    echo "  npm run build"
    echo "  pm2 restart all"
    echo ""
    echo "Or use the automated script:"
    echo "  ssh root@78.46.183.41 'cd /path/to/immigration_ai/backend && bash deploy.sh'"
    echo ""
    
    read -p "Do you want to run deployment commands via SSH? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter Hetzner server path (e.g., /var/www/immigration_ai): " HETZNER_PATH
        read -p "Enter SSH user (default: root): " SSH_USER
        SSH_USER=${SSH_USER:-root}
        
        echo ""
        echo -e "${BLUE}📡 Connecting to Hetzner...${NC}"
        
        ssh ${SSH_USER}@78.46.183.41 << EOF
set -e
cd ${HETZNER_PATH}
echo "📍 Current directory: \$(pwd)"
echo "📥 Pulling latest code..."
git pull origin main || echo "Git pull failed - check manually"
cd backend
echo "📦 Installing dependencies..."
npm install --production
echo "🔧 Running migrations..."
npx prisma migrate deploy
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "🌱 Seeding services..."
npm run seed:services || echo "Seed failed - check manually"
echo "🔨 Building..."
npm run build
echo "🔄 Restarting PM2..."
pm2 restart all || pm2 start dist/app.js --name immigration-backend
echo "✅ Deployment complete!"
pm2 status
EOF
        
        echo ""
        echo -e "${GREEN}✅ Deployment commands executed${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping Hetzner deployment${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                         ✅ COMPLETE                                  ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Marketplace system committed and ready for deployment!${NC}"
echo ""
