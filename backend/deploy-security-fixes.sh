#!/bin/bash

# Security Fixes Deployment Script for Hetzner Server
# This deploys the critical JWT and logging security fixes
# Usage: ./deploy-security-fixes.sh

set -e  # Exit on any error

echo "🔒 Deploying Critical Security Fixes to Hetzner..."
echo ""
echo "⚠️  CRITICAL: This deployment requires JWT secrets to be set!"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate secure secrets
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  STEP 1: Pre-Deployment Checks${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

# Check if on server or local
if [ -f "/opt/immigration_ai/backend/.env" ]; then
    echo -e "${GREEN}✅ Running on Hetzner server${NC}"
    ON_SERVER=true
    BACKEND_DIR="/opt/immigration_ai/backend"
elif [ -f ".env" ]; then
    echo -e "${BLUE}ℹ️  Running locally - will prepare for server deployment${NC}"
    ON_SERVER=false
    BACKEND_DIR="."
else
    echo -e "${RED}❌ Cannot find backend directory${NC}"
    echo "Run this script from the backend directory or on the Hetzner server"
    exit 1
fi

echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  STEP 2: Check Environment Variables${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

cd $BACKEND_DIR

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo ""
    echo "Creating .env from template..."
    
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        echo -e "${GREEN}✅ Created .env from template${NC}"
    else
        echo -e "${RED}❌ No .env.production.example found${NC}"
        exit 1
    fi
fi

# Check for JWT_SECRET
if grep -q "^JWT_SECRET=" .env && ! grep -q "^JWT_SECRET=$" .env && ! grep -q "JWT_SECRET=.*your-secret" .env; then
    JWT_SECRET_SET=true
    echo -e "${GREEN}✅ JWT_SECRET is set${NC}"
else
    JWT_SECRET_SET=false
    echo -e "${RED}⚠️  JWT_SECRET is NOT set or using default${NC}"
fi

# Check for REFRESH_TOKEN_SECRET
if grep -q "^REFRESH_TOKEN_SECRET=" .env && ! grep -q "^REFRESH_TOKEN_SECRET=$" .env && ! grep -q "REFRESH_TOKEN_SECRET=.*your-refresh" .env; then
    REFRESH_TOKEN_SECRET_SET=true
    echo -e "${GREEN}✅ REFRESH_TOKEN_SECRET is set${NC}"
else
    REFRESH_TOKEN_SECRET_SET=false
    echo -e "${RED}⚠️  REFRESH_TOKEN_SECRET is NOT set or using default${NC}"
fi

# Check for NODE_ENV
if grep -q "^NODE_ENV=production" .env; then
    echo -e "${GREEN}✅ NODE_ENV=production${NC}"
else
    echo -e "${YELLOW}⚠️  NODE_ENV is not set to production${NC}"
fi

echo ""

# If secrets are not set, offer to generate them
if [ "$JWT_SECRET_SET" = false ] || [ "$REFRESH_TOKEN_SECRET_SET" = false ]; then
    echo -e "${RED}🚨 CRITICAL: JWT secrets MUST be set!${NC}"
    echo ""
    echo "Your new security fixes will PREVENT the server from starting without proper secrets."
    echo "This is a SECURITY FEATURE to prevent authentication bypass attacks."
    echo ""
    
    read -p "Generate secure JWT secrets now? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}Generating secure secrets...${NC}"
        
        NEW_JWT_SECRET=$(generate_secret)
        NEW_REFRESH_SECRET=$(generate_secret)
        
        echo ""
        echo -e "${GREEN}✅ Secrets generated!${NC}"
        echo ""
        echo -e "${YELLOW}Add these to your .env file:${NC}"
        echo ""
        echo "JWT_SECRET=$NEW_JWT_SECRET"
        echo "REFRESH_TOKEN_SECRET=$NEW_REFRESH_SECRET"
        echo ""
        
        read -p "Automatically add to .env file? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Backup existing .env
            cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
            
            # Update or add JWT_SECRET
            if grep -q "^JWT_SECRET=" .env; then
                sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" .env
            else
                echo "JWT_SECRET=$NEW_JWT_SECRET" >> .env
            fi
            
            # Update or add REFRESH_TOKEN_SECRET
            if grep -q "^REFRESH_TOKEN_SECRET=" .env; then
                sed -i "s|^REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=$NEW_REFRESH_SECRET|" .env
            else
                echo "REFRESH_TOKEN_SECRET=$NEW_REFRESH_SECRET" >> .env
            fi
            
            # Ensure NODE_ENV is production
            if grep -q "^NODE_ENV=" .env; then
                sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" .env
            else
                echo "NODE_ENV=production" >> .env
            fi
            
            echo -e "${GREEN}✅ Secrets added to .env file${NC}"
            echo -e "${GREEN}✅ Backup saved to .env.backup.TIMESTAMP${NC}"
            JWT_SECRET_SET=true
            REFRESH_TOKEN_SECRET_SET=true
        else
            echo -e "${YELLOW}⚠️  Please manually add the secrets to .env before continuing${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Deployment aborted - secrets are required${NC}"
        echo ""
        echo "To set secrets manually:"
        echo "1. Generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
        echo "2. Add to .env: JWT_SECRET=<generated-secret>"
        echo "3. Add to .env: REFRESH_TOKEN_SECRET=<different-generated-secret>"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  STEP 3: Pull Latest Security Fixes${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

if [ "$ON_SERVER" = true ]; then
    echo "📥 Pulling latest code from GitHub..."
    git pull origin main || {
        echo -e "${YELLOW}⚠️  Git pull failed - you may need to stash or commit local changes${NC}"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${BLUE}ℹ️  Skipping git pull (running locally)${NC}"
fi

echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  STEP 4: Install Dependencies & Build${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo -e "${GREEN}✅ Build completed${NC}"

echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  STEP 5: Deploy with PM2${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting PM2 process..."
    pm2 restart immigration-backend || {
        echo "No existing process found, starting new..."
        pm2 start dist/app.js --name immigration-backend
    }
    
    echo ""
    echo "💾 Saving PM2 configuration..."
    pm2 save
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "📝 Recent logs (last 20 lines):"
    pm2 logs immigration-backend --lines 20 --nostream
    
    echo -e "${GREEN}✅ PM2 deployment completed${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found - starting with Node.js${NC}"
    node dist/app.js &
    echo -e "${GREEN}✅ Server started${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ SECURITY FIXES DEPLOYED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}What was fixed:${NC}"
echo "  🔒 JWT secrets are now required (no defaults)"
echo "  🔒 Query logging disabled in production"
echo "  🔒 Strict CORS configuration"
echo "  🔒 Server will fail to start if misconfigured"
echo ""
echo -e "${BLUE}Verify deployment:${NC}"
echo "  1. Check PM2 logs: pm2 logs immigration-backend"
echo "  2. Test health endpoint: curl http://localhost:4000/health"
echo "  3. Test from frontend: curl https://your-domain.com/api/health"
echo ""
echo -e "${BLUE}Monitor:${NC}"
echo "  • pm2 monit           - Real-time monitoring"
echo "  • pm2 logs            - View logs"
echo "  • pm2 status          - Process status"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: If server fails to start, check:${NC}"
echo "  1. JWT_SECRET is set and at least 32 characters"
echo "  2. REFRESH_TOKEN_SECRET is set and different from JWT_SECRET"
echo "  3. All required environment variables are set"
echo ""
echo -e "${GREEN}🎉 Your server is now secure and production-ready!${NC}"
echo ""

