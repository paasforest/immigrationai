#!/bin/bash

# Setup Git Configuration
# Run this once to configure git properly

cd /home/immigrant/immigration_ai

echo "🔧 Setting up Git configuration..."
echo ""

# Fix ownership
echo "1. Fixing git ownership..."
git config --global --add safe.directory /home/immigrant/immigration_ai
sudo chown -R $USER:$USER .git 2>/dev/null || echo "⚠️  May need manual fix"
echo "✅ Ownership fixed"
echo ""

# Configure user
echo "2. Configuring git user..."
git config user.email "paasforest@gmail.com"
git config user.name "paasforest"
echo "✅ User configured"
echo ""

# Configure remote with PAT
echo "3. Configuring remote URL..."
GITHUB_PAT=""
REPO_URL="https://${GITHUB_PAT}@github.com/paasforest/immigrationai.git"
git remote set-url origin "$REPO_URL"
echo "✅ Remote configured"
echo ""

echo "✅ Git setup complete!"
echo ""
echo "Now you can run: ./fix-and-deploy.sh"
echo ""
