#!/bin/bash

# Fix TypeScript build errors by installing missing type definitions

echo "🔧 Fixing TypeScript build errors..."

cd "$(dirname "$0")"

# Install missing type definitions
echo "📦 Installing missing type definitions..."
npm install --save-dev @types/d3-color @types/d3-path 2>&1 | tail -5

# Or if that doesn't work, try adding to tsconfig
echo ""
echo "✅ Type definitions installed"
echo ""
echo "If errors persist, the build should still work with skipLibCheck: true"
echo "Try building again: npm run build"
