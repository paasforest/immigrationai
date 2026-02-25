#!/bin/bash

# Deploy Conversion Improvements
# This script commits and pushes the pricing page improvements

set -e

echo "🚀 Deploying Conversion Improvements..."

# Fix git permissions if needed
if [ -f .git/index.lock ]; then
    echo "🔧 Removing git lock file..."
    sudo rm -f .git/index.lock
fi

# Fix ownership if needed
echo "🔧 Fixing git ownership..."
sudo chown -R $USER:$USER .git 2>/dev/null || true

# Stage changes
echo "📦 Staging changes..."
git add app/pricing/page.tsx app/page.tsx

# Commit
echo "💾 Committing changes..."
git commit -m "feat: Add conversion optimization to pricing page - social proof, value comparison, testimonials, and pay-per-use option" || echo "No changes to commit"

# Push
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo ""
echo "📊 Changes deployed:"
echo "  - Social proof section (1,250+ users, 4.8/5 rating)"
echo "  - Value comparison (Save 90%+ vs consultants)"
echo "  - Annual savings banner"
echo "  - Customer testimonials"
echo "  - Pay-per-use option (R99/document)"
echo "  - Enhanced plan cards"
echo ""
echo "🌐 Vercel will auto-deploy in 2-5 minutes"
echo "Check: https://vercel.com/dashboard"
