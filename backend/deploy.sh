#!/bin/bash

# Immigration AI Backend Deployment Script for Hetzner
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting Immigration AI Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with your configuration."
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Prisma generate warning - continuing...${NC}"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart immigration-backend || pm2 start dist/app.js --name immigration-backend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PM2 process restarted${NC}"

# Show status
pm2 status

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Monitoring: pm2 monit"
echo "📝 Logs: pm2 logs immigration-backend"
echo "🔄 Status: pm2 status"
echo ""


