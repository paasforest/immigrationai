#!/bin/bash

# Deploy Marketing Test Feature to Production
# This script commits changes and deploys to Hetzner

set -e

echo "🚀 Deploying Marketing Test Feature"
echo "===================================="
echo ""

cd /home/immigrant/immigration_ai

# Step 1: Stage changes
echo "📦 Staging changes..."
git add app/dashboard/page.tsx \
        backend/src/controllers/aiController.ts \
        backend/src/services/limitEnforcement.ts \
        MARKETING_TEST_IMPLEMENTATION.md \
        MARKETING_ROLLOUT_STRATEGY.md

echo "✅ Files staged"
echo ""

# Step 2: Commit
echo "💾 Committing changes..."
git commit -m "feat: Add marketing_test subscription plan with 5 core features

- Add marketing_test plan to limitEnforcement.ts with only 5 features enabled:
  * SOP Generator
  * SOP Reviewer  
  * Visa Eligibility Checker
  * AI Chat Assistant
  * Document Checklist
- Update dashboard to show only enabled features for marketing_test users
- Add feature access check to AI Chat endpoint
- All other features are disabled for marketing test period
- Unlimited usage for testing purposes"

echo "✅ Changes committed"
echo ""

# Step 3: Push to Git (triggers Vercel auto-deploy for frontend)
echo "📤 Pushing to Git (triggers Vercel auto-deploy)..."
git push origin main

echo "✅ Frontend will auto-deploy on Vercel"
echo ""

# Step 4: Deploy backend to Hetzner
echo "🌐 Deploying backend to Hetzner..."
echo ""

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"
BACKEND_PATH="/var/www/immigrationai/backend"

echo "📤 Uploading backend files to Hetzner..."

# Upload the changed backend files
scp backend/src/services/limitEnforcement.ts ${HETZNER_USER}@${HETZNER_IP}:${BACKEND_PATH}/src/services/
scp backend/src/controllers/aiController.ts ${HETZNER_USER}@${HETZNER_IP}:${BACKEND_PATH}/src/controllers/

echo "✅ Files uploaded"
echo ""

echo "🔧 Building and restarting backend on Hetzner..."
ssh ${HETZNER_USER}@${HETZNER_IP} << 'ENDSSH'
cd /var/www/immigrationai/backend

# Install dependencies if needed
npm install

# Build TypeScript
npm run build

# Restart PM2
pm2 restart immigration-backend

# Check status
pm2 status immigration-backend

# Show recent logs
echo ""
echo "📋 Recent logs:"
pm2 logs immigration-backend --lines 20 --nostream
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Frontend: Auto-deploying on Vercel (check https://immigrationai.co.za)"
echo "  ✅ Backend: Deployed to Hetzner (https://api.immigrationai.co.za)"
echo ""
echo "🧪 Next Steps:"
echo "  1. Wait for Vercel deployment to complete (~2-3 minutes)"
echo "  2. Assign test users to 'marketing_test' plan in database"
echo "  3. Test the features"
echo ""
