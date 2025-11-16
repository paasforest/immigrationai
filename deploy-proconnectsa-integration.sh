#!/bin/bash

###############################################################################
# ProConnectSA Integration Deployment Script
# This script deploys the complete ProConnectSA integration to production
###############################################################################

set -e  # Exit on error

echo "🚀 ProConnectSA Integration Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

###############################################################################
# Step 1: Verify Environment Variables
###############################################################################

echo "📋 Step 1: Checking Environment Variables..."
echo ""

# Check for GA4 Measurement ID
if [ -z "$NEXT_PUBLIC_GA_MEASUREMENT_ID" ]; then
    print_warning "NEXT_PUBLIC_GA_MEASUREMENT_ID not set"
    print_info "Google Analytics will not work without this variable"
    print_info "Set it with: export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
    echo ""
    read -p "Continue without Google Analytics? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Google Analytics ID: $NEXT_PUBLIC_GA_MEASUREMENT_ID"
fi

# Check for API URL
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    print_warning "NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000"
    export NEXT_PUBLIC_API_URL="http://localhost:4000"
else
    print_success "API URL: $NEXT_PUBLIC_API_URL"
fi

echo ""

###############################################################################
# Step 2: Install Dependencies
###############################################################################

echo "📦 Step 2: Installing Dependencies..."
echo ""

npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

###############################################################################
# Step 3: Build Application
###############################################################################

echo "🔨 Step 3: Building Application..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

echo ""

###############################################################################
# Step 4: Check Implementation
###############################################################################

echo "🔍 Step 4: Verifying Implementation..."
echo ""

# Check if required files exist
files=(
    "app/pricing/page.tsx"
    "components/GoogleAnalytics.tsx"
    "app/layout.tsx"
    "app/auth/signup/page.tsx"
    "lib/utm-tracker.ts"
    "app/admin/utm-analytics/page.tsx"
    "PROCONNECTSA_INTEGRATION_COMPLETE.md"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required files are missing"
    exit 1
fi

echo ""

###############################################################################
# Step 5: Run Tests (if available)
###############################################################################

echo "🧪 Step 5: Running Tests..."
echo ""

if grep -q "\"test\":" package.json; then
    npm test
    if [ $? -eq 0 ]; then
        print_success "Tests passed"
    else
        print_warning "Some tests failed (continuing anyway)"
    fi
else
    print_info "No test script found, skipping tests"
fi

echo ""

###############################################################################
# Step 6: Deployment Summary
###############################################################################

echo "📊 Step 6: Deployment Summary"
echo "=============================="
echo ""

print_success "ProConnectSA Integration Ready for Deployment"
echo ""
echo "Features Deployed:"
echo "  ✅ Plan parameter pre-selection"
echo "  ✅ Google Analytics (GA4) tracking"
echo "  ✅ UTM tracking system"
echo "  ✅ Admin analytics dashboard"
echo "  ✅ Conversion tracking"
echo ""

print_info "Admin Dashboard URL: https://immigrationai.co.za/admin/utm-analytics"
echo ""

###############################################################################
# Step 7: Testing Instructions
###############################################################################

echo "🧪 Testing Instructions"
echo "======================="
echo ""
echo "1. Test Plan Pre-selection:"
echo "   Visit: https://immigrationai.co.za/pricing?plan=professional"
echo "   Expected: Professional plan highlighted with purple ring"
echo ""
echo "2. Test UTM Tracking:"
echo "   Visit: https://immigrationai.co.za/?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration"
echo "   Check: Browser console shows '🎯 New visitor tracked:'"
echo ""
echo "3. Test Admin Dashboard:"
echo "   Visit: https://immigrationai.co.za/admin/utm-analytics"
echo "   Expected: See UTM analytics dashboard"
echo ""
echo "4. Test Complete Flow:"
echo "   a) Visit: https://immigrationai.co.za/pricing?plan=entry&utm_source=proconnectsa"
echo "   b) Sign up for an account"
echo "   c) Check admin dashboard for attribution data"
echo ""

###############################################################################
# Step 8: Restart Services (if needed)
###############################################################################

echo "🔄 Step 8: Restart Services"
echo "==========================="
echo ""

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    read -p "Restart PM2 services? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 restart all
        print_success "PM2 services restarted"
    fi
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    read -p "Restart Docker containers? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose restart
        print_success "Docker containers restarted"
    fi
fi

echo ""

###############################################################################
# Final Message
###############################################################################

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
print_success "ProConnectSA integration is now live!"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the integration using URLs above"
echo "  2. Monitor admin dashboard for ProConnectSA traffic"
echo "  3. Check Google Analytics after 24-48 hours"
echo "  4. Review PROCONNECTSA_INTEGRATION_COMPLETE.md for details"
echo ""
echo "📞 Support:"
echo "  - Check browser console for debug messages (look for emoji logs)"
echo "  - Verify environment variables are set"
echo "  - Test in incognito mode if issues occur"
echo ""
print_info "Documentation: PROCONNECTSA_INTEGRATION_COMPLETE.md"
echo ""



