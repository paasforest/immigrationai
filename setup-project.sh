#!/bin/bash

# Immigration AI Project Setup Script
# This script fixes permissions and installs missing dependencies
# ⚠️ SAFE FOR LOCAL DEVELOPMENT - Does NOT affect production!

set -e

echo "🚀 Immigration AI - Local Development Setup"
echo "============================================="
echo ""
echo "⚠️  NOTE: This is for LOCAL development only."
echo "    Production is on Hetzner (api.immigrationai.co.za)"
echo "    This script will NOT affect production!"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (we don't want that)
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please don't run this script as root${NC}"
   exit 1
fi

PROJECT_ROOT="/home/immigrant/immigration_ai"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Step 1: Fix permissions on node_modules
echo "🔧 Step 1: Fixing permissions on node_modules..."
if [ -d "node_modules" ]; then
    echo "   Fixing frontend node_modules permissions..."
    sudo chown -R $USER:$USER node_modules 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not fix frontend node_modules permissions (may need manual fix)${NC}"
    }
fi

if [ -d "backend/node_modules" ]; then
    echo "   Fixing backend node_modules permissions..."
    sudo chown -R $USER:$USER backend/node_modules 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not fix backend node_modules permissions (may need manual fix)${NC}"
    }
fi

echo -e "${GREEN}✅ Permissions check complete${NC}"
echo ""

# Step 2: Install frontend dependencies
echo "📦 Step 2: Installing frontend dependencies..."
cd "$PROJECT_ROOT"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ package.json not found in frontend${NC}"
    exit 1
fi
echo ""

# Step 3: Install backend dependencies
echo "📦 Step 3: Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ package.json not found in backend${NC}"
    exit 1
fi
echo ""

# Step 4: Generate Prisma client
echo "🗄️  Step 4: Generating Prisma client..."
cd "$PROJECT_ROOT/backend"
if [ -f "prisma/schema.prisma" ]; then
    npx prisma generate
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma schema not found${NC}"
fi
echo ""

# Step 5: Check environment files
echo "🔐 Step 5: Checking environment files..."
cd "$PROJECT_ROOT"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
    echo "   Creating template..."
    cat > backend/.env << 'EOF'
# Backend Environment Variables
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/immigration_ai

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_jwt_secret_here_minimum_32_characters_long
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_minimum_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_STARTER_MONTHLY_PRICE_ID=price_starter_monthly
STRIPE_ENTRY_MONTHLY_PRICE_ID=price_entry_monthly
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_professional_monthly
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_enterprise_monthly
STRIPE_STARTER_ANNUAL_PRICE_ID=price_starter_annual
STRIPE_ENTRY_ANNUAL_PRICE_ID=price_entry_annual
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_professional_annual
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_enterprise_annual

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-key
FROM_EMAIL=noreply@immigrationai.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
EOF
    echo -e "${GREEN}✅ Created backend/.env template${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your actual values!${NC}"
else
    echo -e "${GREEN}✅ backend/.env exists${NC}"
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "   Creating template..."
    cat > .env.local << 'EOF'
# Frontend Environment Variables
# Point to PRODUCTION API (default - safe for local testing)
NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za

# OR point to LOCAL backend (if running local backend on port 4000)
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional: Stripe (use test keys for local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
EOF
    echo -e "${GREEN}✅ Created .env.local template${NC}"
    echo -e "${YELLOW}⚠️  Default: Points to PRODUCTION API (https://api.immigrationai.co.za)${NC}"
    echo -e "${YELLOW}⚠️  Change to localhost:4000 only if running local backend${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
    # Check if it points to production
    if grep -q "api.immigrationai.co.za" .env.local; then
        echo -e "${GREEN}   ✓ Points to production API (safe)${NC}"
    elif grep -q "localhost" .env.local; then
        echo -e "${YELLOW}   ⚠ Points to localhost (make sure local backend is running)${NC}"
    fi
fi
echo ""

# Step 6: Verify Node.js and npm versions
echo "🔍 Step 6: Verifying system requirements..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "   Node.js: $NODE_VERSION"
echo "   npm: $NPM_VERSION"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ System requirements met${NC}"
echo ""

# Step 7: Check if database is accessible (optional)
echo "🗄️  Step 7: Database connection check (optional)..."
cd "$PROJECT_ROOT/backend"
if [ -f ".env" ]; then
    # Try to read DATABASE_URL from .env
    if grep -q "DATABASE_URL" .env; then
        echo "   Database URL found in .env"
        echo -e "${YELLOW}⚠️  Make sure your database is running and accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ Local Development Setup Complete!${NC}"
echo ""
echo "🌐 Production System (DO NOT MODIFY):"
echo "   - Frontend: https://immigrationai.co.za (Vercel)"
echo "   - Backend: https://api.immigrationai.co.za (Hetzner)"
echo ""
echo "📋 Next Steps for Local Development:"
echo "   1. ✅ Dependencies installed"
echo "   2. ✅ Permissions fixed"
echo "   3. ✅ .env.local created (points to production API by default)"
echo "   4. Start frontend: npm run dev"
echo "   5. Visit: http://localhost:3000"
echo ""
echo "💡 To run local backend (optional):"
echo "   1. Create backend/.env with local database config"
echo "   2. Update .env.local: NEXT_PUBLIC_API_URL=http://localhost:4000"
echo "   3. Start backend: cd backend && npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - See LOCAL_DEVELOPMENT_SETUP.md for detailed guide"
echo "   - See HETZNER_DEPLOYMENT_SUCCESS.md for production info"
echo ""
echo "⚠️  Remember: This is LOCAL development only!"
echo "    Production is on Hetzner and should not be modified from here."
echo ""
