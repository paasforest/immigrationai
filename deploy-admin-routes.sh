#!/bin/bash

# Deploy Admin Routes to Hetzner Production Server
# Server: 78.46.183.41
# Backend: /var/www/immigrationai/backend
# Usage: ./deploy-admin-routes.sh

set -e

echo "🚀 Deploying Admin Routes to Hetzner"
echo "===================================="
echo ""
echo "Server: 78.46.183.41"
echo "Path: /var/www/immigrationai/backend"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="root@78.46.183.41"
BACKEND_PATH="/var/www/immigrationai/backend"

echo -e "${BLUE}Step 1: Testing SSH connection...${NC}"
if ssh -o BatchMode=yes -o ConnectTimeout=5 $SERVER "echo 2>&1" &>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  SSH connection test failed${NC}"
    echo "You may need to enter password or set up SSH keys"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 2: Checking current server status...${NC}"
ssh $SERVER "cd $BACKEND_PATH && pm2 status immigration-backend" || echo "PM2 process check (continuing...)"

echo ""
echo -e "${BLUE}Step 3: Pulling latest code from GitHub...${NC}"
ssh $SERVER "cd $BACKEND_PATH && git pull origin main"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    echo "Please check if you're in the correct directory and have git access"
    exit 1
fi

echo -e "${GREEN}✅ Code pulled successfully${NC}"

echo ""
echo -e "${BLUE}Step 4: Installing dependencies (if needed)...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npm install"

echo ""
echo -e "${BLUE}Step 5: Generating Prisma client...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npx prisma generate"

echo ""
echo -e "${BLUE}Step 6: Building TypeScript...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npm run build"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check the error above"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo ""
echo -e "${BLUE}Step 7: Restarting PM2 process...${NC}"
ssh $SERVER "cd $BACKEND_PATH && pm2 restart immigration-backend || pm2 start dist/app.js --name immigration-backend"

echo ""
echo -e "${BLUE}Step 8: Saving PM2 configuration...${NC}"
ssh $SERVER "pm2 save"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""

echo -e "${BLUE}Verifying deployment...${NC}"
echo ""

echo "📊 PM2 Status:"
ssh $SERVER "pm2 status"

echo ""
echo "📝 Recent Logs (last 20 lines):"
ssh $SERVER "cd $BACKEND_PATH && pm2 logs immigration-backend --lines 20 --nostream"

echo ""
echo -e "${BLUE}Testing health endpoint...${NC}"
sleep 3  # Give server time to fully restart

if curl -f http://78.46.183.41:4000/health &>/dev/null; then
    echo -e "${GREEN}✅ Health endpoint responding${NC}"
elif curl -f https://api.immigrationai.co.za/health &>/dev/null; then
    echo -e "${GREEN}✅ Health endpoint responding (via domain)${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint not responding immediately (may still be starting)${NC}"
    echo "Check logs: ssh $SERVER 'pm2 logs immigration-backend'"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}What was deployed:${NC}"
echo "  ✅ Document Analytics API endpoint"
echo "  ✅ Revenue Analytics API endpoint"
echo "  ✅ System Health API endpoint"
echo "  ✅ User Management API endpoints"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test Document Analytics: https://immigrationai.co.za/admin/documents"
echo "  2. Test Revenue Analytics: https://immigrationai.co.za/admin/revenue"
echo "  3. Test System Health: https://immigrationai.co.za/admin/system"
echo "  4. Monitor logs: ssh $SERVER 'pm2 logs immigration-backend'"
echo "  5. Check status: ssh $SERVER 'pm2 status'"
echo ""
echo -e "${GREEN}✅ Backend is now updated with new admin routes!${NC}"
echo ""

