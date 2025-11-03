#!/bin/bash

# Deploy Critical Security Fixes to Hetzner Production Server
# Server: 78.46.183.41
# Backend: /var/www/immigrationai/backend
# Usage: ./deploy-security-to-hetzner.sh

set -e

echo "🔒 Deploying Critical Security Fixes to Production Hetzner Server"
echo "=================================================================="
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
    echo "Continuing anyway (you may need to enter password)..."
fi

echo ""
echo -e "${BLUE}Step 2: Checking current server status...${NC}"
ssh $SERVER "cd $BACKEND_PATH && pm2 status immigration-backend" || echo "PM2 process not found (will start fresh)"

echo ""
echo -e "${BLUE}Step 3: Pulling latest security fixes from GitHub...${NC}"
ssh $SERVER "cd $BACKEND_PATH && git pull origin main"

echo ""
echo -e "${BLUE}Step 4: Checking environment variables...${NC}"
ssh $SERVER "cd $BACKEND_PATH && bash -c '
if [ ! -f .env ]; then
    echo \"❌ .env file not found!\"
    exit 1
fi

# Check JWT_SECRET
if grep -q \"^JWT_SECRET=\" .env && ! grep -q \"JWT_SECRET=.*your-secret\" .env; then
    echo \"✅ JWT_SECRET is set\"
    JWT_SET=true
else
    echo \"⚠️  JWT_SECRET needs to be set\"
    JWT_SET=false
fi

# Check REFRESH_TOKEN_SECRET
if grep -q \"^REFRESH_TOKEN_SECRET=\" .env && ! grep -q \"REFRESH_TOKEN_SECRET=.*your-refresh\" .env; then
    echo \"✅ REFRESH_TOKEN_SECRET is set\"
    REFRESH_SET=true
else
    echo \"⚠️  REFRESH_TOKEN_SECRET needs to be set\"
    REFRESH_SET=false
fi

# Generate and set secrets if needed
if [ \"$JWT_SET\" = false ] || [ \"$REFRESH_SET\" = false ]; then
    echo \"\"
    echo \"🔑 Generating secure JWT secrets...\"
    
    JWT_SECRET=\$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")
    REFRESH_SECRET=\$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")
    
    # Backup .env
    cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
    echo \"✅ Backed up .env file\"
    
    # Update or add JWT_SECRET
    if grep -q \"^JWT_SECRET=\" .env; then
        sed -i \"s|^JWT_SECRET=.*|JWT_SECRET=\$JWT_SECRET|\" .env
    else
        echo \"JWT_SECRET=\$JWT_SECRET\" >> .env
    fi
    
    # Update or add REFRESH_TOKEN_SECRET
    if grep -q \"^REFRESH_TOKEN_SECRET=\" .env; then
        sed -i \"s|^REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=\$REFRESH_SECRET|\" .env
    else
        echo \"REFRESH_TOKEN_SECRET=\$REFRESH_SECRET\" >> .env
    fi
    
    # Ensure NODE_ENV=production
    if grep -q \"^NODE_ENV=\" .env; then
        sed -i \"s|^NODE_ENV=.*|NODE_ENV=production|\" .env
    else
        echo \"NODE_ENV=production\" >> .env
    fi
    
    echo \"✅ JWT secrets configured\"
    echo \"✅ NODE_ENV set to production\"
fi
'"

echo ""
echo -e "${BLUE}Step 5: Installing dependencies...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npm install"

echo ""
echo -e "${BLUE}Step 6: Generating Prisma client...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npx prisma generate"

echo ""
echo -e "${BLUE}Step 7: Building TypeScript...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npm run build"

echo ""
echo -e "${BLUE}Step 8: Restarting PM2 process...${NC}"
ssh $SERVER "cd $BACKEND_PATH && pm2 restart immigration-backend || pm2 start dist/app.js --name immigration-backend"

echo ""
echo -e "${BLUE}Step 9: Saving PM2 configuration...${NC}"
ssh $SERVER "pm2 save"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ SECURITY FIXES DEPLOYED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""

echo -e "${BLUE}Verifying deployment...${NC}"
echo ""

echo "📊 PM2 Status:"
ssh $SERVER "pm2 status"

echo ""
echo "📝 Recent Logs (last 30 lines):"
ssh $SERVER "pm2 logs immigration-backend --lines 30 --nostream"

echo ""
echo -e "${BLUE}Testing health endpoint...${NC}"
sleep 3  # Give server time to fully restart
if curl -f http://78.46.183.41:4000/health &>/dev/null; then
    echo -e "${GREEN}✅ Health endpoint responding${NC}"
elif curl -f https://api.immigrationai.co.za/health &>/dev/null; then
    echo -e "${GREEN}✅ Health endpoint responding (via domain)${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint not responding immediately (may still be starting)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}What was fixed:${NC}"
echo "  🔒 JWT secrets now required (no defaults allowed)"
echo "  🔒 Query logging disabled in production"
echo "  🔒 Strict CORS configuration"
echo "  🔒 Server will fail to start if misconfigured"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test login from frontend: https://immigrationai.co.za"
echo "  2. Monitor logs: ssh root@78.46.183.41 'pm2 logs immigration-backend'"
echo "  3. Check status: ssh root@78.46.183.41 'pm2 status'"
echo ""
echo -e "${YELLOW}⚠️  Note: Users may need to re-login if JWT secrets were changed${NC}"
echo ""

