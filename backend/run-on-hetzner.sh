#!/bin/bash

# Script to run migration on Hetzner server
# Backend location: /var/www/immigrationai/backend

echo "🚀 Running migration on Hetzner server..."
echo "📍 Backend: /var/www/immigrationai/backend"
echo ""

# Commands to run on Hetzner
cat << 'EOF'

# Copy and paste these commands on your Hetzner server:

cd /var/www/immigrationai/backend

# Pull latest code
git pull origin main

# Run migration
npx prisma migrate dev --name add_multi_tenant_models

# Generate Prisma Client
npx prisma generate

# Restart backend
pm2 restart all

# Verify (optional)
npx prisma studio

EOF

echo ""
echo "✅ Or run all at once:"
echo ""
echo "cd /var/www/immigrationai/backend && git pull origin main && npx prisma migrate dev --name add_multi_tenant_models && npx prisma generate && pm2 restart all"
