#!/bin/bash

# Deploy routing engine fix to Hetzner
# This script should be run on the Hetzner server

set -e

echo "🚀 Deploying routing engine fix to Hetzner..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Find backend directory
if [ -d "/root/immigration_ai/backend" ]; then
    BACKEND_DIR="/root/immigration_ai/backend"
elif [ -d "/home/immigrant/immigration_ai/backend" ]; then
    BACKEND_DIR="/home/immigrant/immigration_ai/backend"
elif [ -d "./backend" ]; then
    BACKEND_DIR="./backend"
else
    echo -e "${RED}❌ Backend directory not found. Please run this script from the project root or specify BACKEND_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Backend directory: $BACKEND_DIR${NC}"
cd "$BACKEND_DIR"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git not found. Skipping git pull.${NC}"
    echo -e "${YELLOW}   Please manually copy the updated routingEngine.ts file${NC}"
else
    # Try to pull latest changes
    echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
    cd ..
    
    # Check if this is a git repository
    if [ -d ".git" ]; then
        git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed. Continuing with manual deployment...${NC}"
    else
        echo -e "${YELLOW}⚠️  Not a git repository. Skipping git pull.${NC}"
        echo -e "${YELLOW}   Please manually copy the updated routingEngine.ts file${NC}"
    fi
    
    cd "$BACKEND_DIR"
fi

# Check if routingEngine.ts exists and has the fix
if [ -f "src/services/routingEngine.ts" ]; then
    if grep -q "ensurePersonalOrganization" "src/services/routingEngine.ts"; then
        echo -e "${GREEN}✅ routingEngine.ts contains the fix${NC}"
    else
        echo -e "${RED}❌ routingEngine.ts does not contain the fix${NC}"
        echo -e "${YELLOW}   Please ensure the file has been updated${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ routingEngine.ts not found at src/services/routingEngine.ts${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install --production 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  npm install had warnings (continuing...)${NC}"
fi

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting backend with PM2...${NC}"
    
    # Find the PM2 process name
    PM2_NAME=$(pm2 list | grep -E "backend|immigration|api" | head -1 | awk '{print $2}' || echo "")
    
    if [ -n "$PM2_NAME" ]; then
        echo -e "${GREEN}📋 Found PM2 process: $PM2_NAME${NC}"
        pm2 restart "$PM2_NAME" || pm2 restart all
        pm2 save
        echo -e "${GREEN}✅ Backend restarted${NC}"
    else
        echo -e "${YELLOW}⚠️  No PM2 process found. Starting backend...${NC}"
        if [ -f "dist/server.js" ] || [ -f "build/server.js" ]; then
            pm2 start dist/server.js || pm2 start build/server.js || pm2 start npm -- start
        else
            pm2 start npm -- start
        fi
        pm2 save
    fi
    
    # Show PM2 status
    echo ""
    echo -e "${GREEN}📊 PM2 Status:${NC}"
    pm2 list
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please restart the backend manually:${NC}"
    echo -e "${YELLOW}   cd $BACKEND_DIR && npm start${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📝 What was deployed:${NC}"
echo "   - Fixed routingEngine.ts to create personal organizations for independent professionals"
echo "   - Independent professionals can now accept leads and create cases"
echo ""
echo -e "${YELLOW}🧪 To test:${NC}"
echo "   1. Have an independent professional accept a lead"
echo "   2. Verify a personal organization is created automatically"
echo "   3. Verify the case is created successfully"
echo ""
