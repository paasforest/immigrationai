#!/bin/bash

# Fix permissions for Immigration AI project
# Run this from the project directory

echo "🔧 Fixing permissions for Immigration AI project..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Project directory: $SCRIPT_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    echo "   Expected: /home/immigrant/immigration_ai"
    exit 1
fi

# Fix permissions on node_modules if they exist
if [ -d "node_modules" ]; then
    echo "🔧 Fixing frontend node_modules permissions..."
    sudo chown -R $USER:$USER node_modules
    echo "✅ Frontend node_modules permissions fixed"
else
    echo "⚠️  Frontend node_modules not found (will be created when you run npm install)"
fi

if [ -d "backend/node_modules" ]; then
    echo "🔧 Fixing backend node_modules permissions..."
    sudo chown -R $USER:$USER backend/node_modules
    echo "✅ Backend node_modules permissions fixed"
else
    echo "⚠️  Backend node_modules not found (will be created when you run npm install)"
fi

# Also fix permissions on the project directory itself (optional, but helpful)
echo ""
echo "🔧 Fixing project directory permissions..."
sudo chown -R $USER:$USER "$SCRIPT_DIR"
echo "✅ Project directory permissions fixed"

echo ""
echo "✅ All permissions fixed!"
echo ""
echo "📋 Next steps:"
echo "   1. Install dependencies: npm install"
echo "   2. Install backend dependencies: cd backend && npm install"
echo "   3. Start development: npm run dev"
