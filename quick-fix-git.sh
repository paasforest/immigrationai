#!/bin/bash

# Quick fix for git ownership issue

cd /home/immigrant/immigration_ai

echo "🔧 Fixing git ownership issue..."
echo ""

# Add safe directory
git config --global --add safe.directory /home/immigrant/immigration_ai

# Fix ownership
sudo chown -R $USER:$USER .git

echo "✅ Git ownership fixed!"
echo ""
echo "Now run: ./fix-and-deploy.sh"
echo ""
