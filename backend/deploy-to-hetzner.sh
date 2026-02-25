#!/bin/bash

# Deploy and run migration on Hetzner server
# Server: 78.46.183.41

set -e

HETZNER_IP="78.46.183.41"
HETZNER_USER="root"  # Change if you use a different user

echo "🚀 Deploying to Hetzner Server: ${HETZNER_IP}"
echo ""

# Check if we can SSH
echo "📡 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 ${HETZNER_USER}@${HETZNER_IP} "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to Hetzner server"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is set up: ssh-copy-id ${HETZNER_USER}@${HETZNER_IP}"
    echo "  2. Server is accessible"
    echo "  3. Firewall allows SSH"
    exit 1
fi

echo "✅ SSH connection successful"
echo ""

# Ask for backend path on server
echo "📍 Where is your backend code on the Hetzner server?"
echo "Common locations:"
echo "  - /opt/immigration_ai/backend"
echo "  - /var/www/immigration_ai/backend"
echo "  - ~/immigration_ai/backend"
echo ""
read -p "Enter backend path: " BACKEND_PATH

# Push code (if using Git)
read -p "Push code via Git? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing code to Git..."
    git add .
    git commit -m "Add multi-tenant models and organization management" || echo "No changes to commit"
    git push origin main
    
    echo "📥 Pulling code on Hetzner server..."
    ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && git pull origin main"
else
    echo "⏭️  Skipping Git push"
fi

# Run migration on server
echo ""
echo "🔧 Running migration on Hetzner server..."
ssh ${HETZNER_USER}@${HETZNER_IP} << EOF
cd ${BACKEND_PATH}
echo "📍 Current directory: \$(pwd)"
echo "📦 Running Prisma migration..."
npx prisma migrate dev --name add_multi_tenant_models
echo "✅ Generating Prisma Client..."
npx prisma generate
echo "✅ Migration complete!"
EOF

# Restart backend
echo ""
read -p "Restart backend service? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Restarting backend..."
    ssh ${HETZNER_USER}@${HETZNER_IP} "pm2 restart all || systemctl restart immigration-ai || echo 'Please restart manually'"
    echo "✅ Backend restarted"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Verify migration:"
echo "  ssh ${HETZNER_USER}@${HETZNER_IP}"
echo "  cd ${BACKEND_PATH}"
echo "  npx prisma studio"
echo ""
echo "Expected new tables:"
echo "  - organizations"
echo "  - cases"
echo "  - case_documents"
echo "  - tasks"
echo "  - messages"
echo "  - document_checklists"
echo "  - checklist_items"
echo "  - audit_logs"
