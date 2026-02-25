#!/bin/bash

###############################################################################
# ADMIN USER CREATION FOR HETZNER SERVER
# Run this script on your Hetzner server to create an admin user
###############################################################################

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║         Immigration AI - Admin User Creation (Hetzner)              ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Find the backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="${SCRIPT_DIR}/backend"

echo -e "${BLUE}📂 Backend directory: ${BACKEND_DIR}${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: Backend directory not found at ${BACKEND_DIR}${NC}"
    echo "Please run this script from the immigration_ai directory"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

# Check if create-admin-user.js exists
if [ ! -f "create-admin-user.js" ]; then
    echo -e "${RED}❌ Error: create-admin-user.js not found${NC}"
    echo "Please make sure you've pulled the latest code from git"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if .env exists and has DATABASE_URL
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with DATABASE_URL"
    exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prompt for admin creation method
echo "How would you like to create the admin user?"
echo ""
echo "1) Quick Setup (auto-generate email and password)"
echo "2) Custom email and password"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo -e "${BLUE}🚀 Creating admin with auto-generated credentials...${NC}"
    echo ""
    node create-admin-user.js
elif [ "$choice" = "2" ]; then
    echo ""
    read -p "Enter admin email: " email
    read -sp "Enter password (min 8 characters): " password
    echo ""
    
    if [ ${#password} -lt 8 ]; then
        echo -e "${RED}❌ Password must be at least 8 characters${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}🚀 Creating admin user...${NC}"
    echo ""
    node create-admin-user.js "$email" "$password"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Admin creation process complete!${NC}"
echo ""
echo -e "${YELLOW}📝 NEXT STEPS:${NC}"
echo ""
echo "1. Save the credentials shown above"
echo "2. Go to: https://www.immigrationai.co.za/auth/login"
echo "3. Login with your admin credentials"
echo "4. Access UTM Analytics: https://www.immigrationai.co.za/admin/utm-analytics"
echo ""
echo -e "${BLUE}🎯 You can now monitor ProConnectSA traffic!${NC}"
echo ""



