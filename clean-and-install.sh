#!/bin/bash

# Clean and reinstall npm dependencies
# Fixes ENOTEMPTY and permission issues

set -e

echo "🧹 Cleaning and reinstalling dependencies..."
echo ""

cd /home/immigrant/immigration_ai

# Step 1: Remove node_modules (may need sudo if owned by root)
echo "🗑️  Removing frontend node_modules..."
if [ -d "node_modules" ]; then
    # Try without sudo first
    rm -rf node_modules 2>/dev/null || {
        echo "   ⚠️  Permission denied, using sudo..."
        sudo rm -rf node_modules
        sudo chown -R $USER:$USER . 2>/dev/null || true
    }
    echo "✅ Frontend node_modules removed"
else
    echo "   ℹ️  node_modules doesn't exist (already clean)"
fi

# Step 2: Remove package-lock.json (optional, but helps with consistency)
echo "🗑️  Removing package-lock.json..."
rm -f package-lock.json
echo "✅ package-lock.json removed"

# Step 3: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force
echo "✅ npm cache cleared"

# Step 4: Fix npm timeout settings
echo "⏱️  Configuring npm timeout settings..."
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retries 5
echo "✅ Timeout settings configured"

# Step 5: Install dependencies
echo ""
echo "📦 Installing frontend dependencies..."
echo "   This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend dependencies installed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Install backend dependencies:"
    echo "      cd backend && npm install"
    echo ""
    echo "   2. Start development:"
    echo "      npm run dev"
else
    echo ""
    echo "❌ Installation failed. Check the error messages above."
    echo ""
    echo "💡 Try these alternatives:"
    echo "   - Check internet connection"
    echo "   - Try: npm install --prefer-offline"
    echo "   - Or use alternative registry: npm config set registry https://registry.npmmirror.com"
fi
