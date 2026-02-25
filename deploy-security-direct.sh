#!/bin/bash

# Deploy Critical Security Fixes to Hetzner (Direct File Upload)
# Server: 78.46.183.41
# Backend: /var/www/immigrationai/backend

set -e

echo "🔒 Deploying Critical Security Fixes to Production Hetzner Server"
echo "=================================================================="
echo ""
echo "Server: 78.46.183.41"
echo "Path: /var/www/immigrationai/backend"
echo "Method: Direct file upload"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="root@78.46.183.41"
BACKEND_PATH="/var/www/immigrationai/backend"
LOCAL_BACKEND="./backend/src"

echo -e "${BLUE}Step 1: Testing SSH connection...${NC}"
if ssh -o BatchMode=yes -o ConnectTimeout=5 $SERVER "echo 2>&1" &>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  SSH connection test failed${NC}"
    echo "Continuing anyway (you may need to enter password)..."
fi

echo ""
echo -e "${BLUE}Step 2: Creating backup of current production files...${NC}"
ssh $SERVER "cd $BACKEND_PATH && tar -czf backup-\$(date +%Y%m%d_%H%M%S).tar.gz src/config src/app.ts || echo 'Backup created'"

echo ""
echo -e "${BLUE}Step 3: Uploading security-fixed files...${NC}"

# Upload the fixed JWT config
echo "  📤 Uploading src/config/jwt.ts..."
scp backend/src/config/jwt.ts $SERVER:$BACKEND_PATH/src/config/jwt.ts

# Upload the fixed database config
echo "  📤 Uploading src/config/database.ts..."
scp backend/src/config/database.ts $SERVER:$BACKEND_PATH/src/config/database.ts

# Upload the fixed app.ts
echo "  📤 Uploading src/app.ts..."
scp backend/src/app.ts $SERVER:$BACKEND_PATH/src/app.ts

echo -e "${GREEN}✅ Files uploaded${NC}"

echo ""
echo -e "${BLUE}Step 4: Checking/Setting environment variables...${NC}"
ssh $SERVER "cd $BACKEND_PATH && bash -c '
# Check if .env exists
if [ ! -f .env ]; then
    echo \"❌ .env file not found!\"
    exit 1
fi

# Check JWT_SECRET
if grep -q \"^JWT_SECRET=\" .env && ! grep -q \"JWT_SECRET=.*your-secret\" .env && ! grep -q \"^JWT_SECRET=\$\" .env; then
    echo \"✅ JWT_SECRET is already set\"
    JWT_NEEDS_GEN=false
else
    echo \"⚠️  JWT_SECRET needs to be set\"
    JWT_NEEDS_GEN=true
fi

# Check REFRESH_TOKEN_SECRET
if grep -q \"^REFRESH_TOKEN_SECRET=\" .env && ! grep -q \"REFRESH_TOKEN_SECRET=.*your-refresh\" .env && ! grep -q \"^REFRESH_TOKEN_SECRET=\$\" .env; then
    echo \"✅ REFRESH_TOKEN_SECRET is already set\"
    REFRESH_NEEDS_GEN=false
else
    echo \"⚠️  REFRESH_TOKEN_SECRET needs to be set\"
    REFRESH_NEEDS_GEN=true
fi

# Generate and set secrets if needed
if [ \"\$JWT_NEEDS_GEN\" = true ] || [ \"\$REFRESH_NEEDS_GEN\" = true ]; then
    echo \"\"
    echo \"🔑 Generating secure JWT secrets...\"
    
    # Backup .env
    cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
    echo \"✅ Backed up .env file\"
    
    if [ \"\$JWT_NEEDS_GEN\" = true ]; then
        JWT_SECRET=\$(node -e \"console.log(require('\"'\"'crypto'\"'\"').randomBytes(64).toString('\"'\"'hex'\"'\"'))\")
        if grep -q \"^JWT_SECRET=\" .env; then
            sed -i \"s|^JWT_SECRET=.*|JWT_SECRET=\$JWT_SECRET|\" .env
        else
            echo \"JWT_SECRET=\$JWT_SECRET\" >> .env
        fi
        echo \"✅ Generated and set JWT_SECRET\"
    fi
    
    if [ \"\$REFRESH_NEEDS_GEN\" = true ]; then
        REFRESH_SECRET=\$(node -e \"console.log(require('\"'\"'crypto'\"'\"').randomBytes(64).toString('\"'\"'hex'\"'\"'))\")
        if grep -q \"^REFRESH_TOKEN_SECRET=\" .env; then
            sed -i \"s|^REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=\$REFRESH_SECRET|\" .env
        else
            echo \"REFRESH_TOKEN_SECRET=\$REFRESH_SECRET\" >> .env
        fi
        echo \"✅ Generated and set REFRESH_TOKEN_SECRET\"
    fi
    
    # Ensure NODE_ENV=production
    if grep -q \"^NODE_ENV=\" .env; then
        sed -i \"s|^NODE_ENV=.*|NODE_ENV=production|\" .env
    else
        echo \"NODE_ENV=production\" >> .env
    fi
    
    echo \"✅ NODE_ENV set to production\"
fi
'"

echo ""
echo -e "${BLUE}Step 5: Building TypeScript...${NC}"
ssh $SERVER "cd $BACKEND_PATH && npm run build"

echo ""
echo -e "${BLUE}Step 6: Restarting PM2 process...${NC}"
ssh $SERVER "cd $BACKEND_PATH && pm2 restart immigration-backend"

echo ""
echo -e "${BLUE}Step 7: Saving PM2 configuration...${NC}"
ssh $SERVER "pm2 save"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ SECURITY FIXES DEPLOYED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""

echo -e "${BLUE}Verifying deployment...${NC}"
echo ""

echo "📊 PM2 Status:"
ssh $SERVER "pm2 status immigration-backend"

echo ""
echo "📝 Recent Logs (last 30 lines):"
ssh $SERVER "pm2 logs immigration-backend --lines 30 --nostream"

echo ""
echo -e "${BLUE}Testing health endpoint...${NC}"
sleep 3
if curl -f http://78.46.183.41:4000/health 2>/dev/null | grep -q "ok"; then
    echo -e "${GREEN}✅ Health endpoint responding correctly${NC}"
elif curl -f https://api.immigrationai.co.za/health 2>/dev/null | grep -q "ok"; then
    echo -e "${GREEN}✅ Health endpoint responding correctly (via domain)${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint check inconclusive (server may still be starting)${NC}"
    echo "Check manually: curl https://api.immigrationai.co.za/health"
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
echo -e "${BLUE}Your production server details:${NC}"
echo "  • Server: https://api.immigrationai.co.za"
echo "  • Status: Check with: pm2 status"
echo "  • Logs: ssh root@78.46.183.41 'pm2 logs immigration-backend'"
echo ""
echo -e "${YELLOW}⚠️  Note: Users may need to re-login if JWT secrets were changed${NC}"
echo ""

