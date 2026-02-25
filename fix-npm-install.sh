#!/bin/bash

# Fix npm install network issues
# This script helps resolve npm network timeout problems

echo "🔧 Fixing npm network issues..."
echo ""

cd /home/immigrant/immigration_ai

# Increase npm timeout
echo "⏱️  Increasing npm timeout settings..."
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retries 5

echo "✅ Timeout settings updated"
echo ""

# Check if we're behind a proxy (common issue)
echo "🔍 Checking network configuration..."
if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ]; then
    echo "⚠️  Proxy detected:"
    echo "   HTTP_PROXY: ${HTTP_PROXY:-not set}"
    echo "   HTTPS_PROXY: ${HTTPS_PROXY:-not set}"
    echo ""
    echo "If you're NOT behind a proxy, unset these:"
    echo "   unset HTTP_PROXY"
    echo "   unset HTTPS_PROXY"
fi

echo ""
echo "📦 Attempting to install dependencies with increased timeout..."
echo ""

# Try installing with verbose output
npm install --verbose 2>&1 | tee npm-install.log

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ npm install completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Install backend dependencies: cd backend && npm install"
    echo "   2. Start development: npm run dev"
else
    echo ""
    echo "❌ npm install failed. Trying alternative solutions..."
    echo ""
    echo "💡 Alternative Solutions:"
    echo ""
    echo "Option 1: Try with --prefer-offline (uses cache)"
    echo "   npm install --prefer-offline"
    echo ""
    echo "Option 2: Clear npm cache and retry"
    echo "   npm cache clean --force"
    echo "   npm install"
    echo ""
    echo "Option 3: Install packages one by one (slower but more reliable)"
    echo "   npm install --no-save next react react-dom"
    echo "   npm install"
    echo ""
    echo "Option 4: Use a different registry (if npmjs.org is blocked)"
    echo "   npm config set registry https://registry.npmmirror.com"
    echo "   npm install"
    echo ""
    echo "Check the log file: npm-install.log"
fi
