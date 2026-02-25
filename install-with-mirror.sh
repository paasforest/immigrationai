#!/bin/bash

# Install npm packages using alternative registry
# Useful when npmjs.org is slow or blocked

set -e

echo "🌐 Installing with alternative npm registry..."
echo ""

cd /home/immigrant/immigration_ai

# Check current registry
CURRENT_REGISTRY=$(npm config get registry)
echo "Current registry: $CURRENT_REGISTRY"
echo ""

# Option 1: Use npmmirror.com (Chinese mirror, often faster)
echo "📦 Switching to npmmirror.com registry..."
npm config set registry https://registry.npmmirror.com

echo "✅ Registry changed to: https://registry.npmmirror.com"
echo ""

# Configure timeout settings
echo "⏱️  Configuring timeout settings..."
npm config set fetch-timeout 120000
npm config set fetch-retry-mintimeout 30000
npm config set fetch-retry-maxtimeout 300000
npm config set fetch-retries 10
echo "✅ Timeout settings configured"
echo ""

# Clear cache
echo "🧹 Clearing npm cache..."
npm cache clean --force
echo "✅ Cache cleared"
echo ""

# Try installing
echo "📦 Installing dependencies..."
echo "   This may take several minutes depending on your connection..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "💡 To switch back to official registry later:"
    echo "   npm config set registry https://registry.npmjs.org"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Install backend dependencies: cd backend && npm install"
    echo "   2. Start development: npm run dev"
else
    echo ""
    echo "❌ Installation failed with alternative registry too."
    echo ""
    echo "💡 Alternative solutions:"
    echo ""
    echo "Option 1: Try Taobao registry"
    echo "   npm config set registry https://registry.npmmirror.com"
    echo "   npm install"
    echo ""
    echo "Option 2: Install with --prefer-offline (if you have cached packages)"
    echo "   npm install --prefer-offline"
    echo ""
    echo "Option 3: Check your network connection"
    echo "   - Try a different network (mobile hotspot)"
    echo "   - Check if you're behind a firewall"
    echo "   - Verify internet is working: ping google.com"
    echo ""
    echo "Option 4: Install packages manually in smaller batches"
    echo "   See FIX_NETWORK_TIMEOUT.md for details"
fi
