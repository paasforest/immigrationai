#!/bin/bash

# Deploy Pricing Page Indexing Fix
# This fixes Google indexing issues for the pricing page

set -e

echo "🔧 Fixing Pricing Page for Google Indexing..."

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
git add app/pricing/page.tsx app/pricing/layout.tsx

# Commit
echo "💾 Committing changes..."
git commit -m "fix: Make pricing page accessible to Google crawlers for indexing" || echo "No changes to commit"

# Push
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo ""
echo "🔍 What was fixed:"
echo "  - Added crawler detection (Googlebot, Bingbot, etc.)"
echo "  - Created layout.tsx with SEO metadata"
echo "  - Pricing page now visible to search engines"
echo "  - Regular users still need to sign up/login"
echo ""
echo "🌐 Vercel will auto-deploy in 2-5 minutes"
echo "📊 After deployment, test in Google Search Console:"
echo "   URL Inspection → https://www.immigrationai.co.za/pricing"
