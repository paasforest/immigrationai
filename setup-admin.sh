#!/bin/bash

# Setup Admin System for Immigration AI
# This script:
# 1. Adds role column to database
# 2. Creates an admin user
# 3. Deploys admin system to production

set -e

echo "🔧 IMMIGRATION AI - ADMIN SYSTEM SETUP"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HETZNER_IP="78.46.183.41"
BACKEND_DIR="/home/paas/immigration_ai/backend"

echo -e "${BLUE}Step 1: Add role column to database${NC}"
cd backend
psql "$DATABASE_URL" -f prisma/migrations/add_role_column.sql
echo -e "${GREEN}✅ Role column added${NC}"
echo ""

echo -e "${BLUE}Step 2: Regenerate Prisma Client${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma client updated${NC}"
echo ""

echo -e "${BLUE}Step 3: Create admin user${NC}"
echo -e "${YELLOW}Enter admin email:${NC}"
read ADMIN_EMAIL
echo -e "${YELLOW}Enter admin password:${NC}"
read -s ADMIN_PASSWORD
echo ""

node src/scripts/create-admin-user.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
echo -e "${GREEN}✅ Admin user created${NC}"
echo ""

echo -e "${BLUE}Step 4: Deploy to production (Hetzner)${NC}"
echo "This will:"
echo "  - Run database migration on production"
echo "  - Upload new backend files"
echo "  - Rebuild and restart backend"
echo ""
echo -e "${YELLOW}Continue? (y/n)${NC}"
read DEPLOY_CONFIRM

if [ "$DEPLOY_CONFIRM" = "y" ]; then
  echo ""
  echo "📦 Deploying to Hetzner..."
  
  # Run migration on production
  echo "Running database migration..."
  ssh root@$HETZNER_IP "cd $BACKEND_DIR && psql \"\$DATABASE_URL\" -f prisma/migrations/add_role_column.sql"
  
  # Upload new files
  echo "Uploading admin routes and controllers..."
  scp src/routes/admin.routes.ts root@$HETZNER_IP:$BACKEND_DIR/src/routes/
  scp src/controllers/adminController.ts root@$HETZNER_IP:$BACKEND_DIR/src/controllers/
  scp src/middleware/requireAdmin.ts root@$HETZNER_IP:$BACKEND_DIR/src/middleware/
  scp src/services/trackingService.ts root@$HETZNER_IP:$BACKEND_DIR/src/services/
  
  # Regenerate Prisma client on production
  echo "Regenerating Prisma client..."
  ssh root@$HETZNER_IP "cd $BACKEND_DIR && npx prisma generate"
  
  # Rebuild and restart
  echo "Building and restarting backend..."
  ssh root@$HETZNER_IP "cd $BACKEND_DIR && npm run build && pm2 restart immigration-backend"
  
  echo ""
  echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
  echo ""
  
  # Create admin user on production
  echo "Creating admin user on production..."
  ssh root@$HETZNER_IP "cd $BACKEND_DIR && node src/scripts/create-admin-user.js '$ADMIN_EMAIL' '$ADMIN_PASSWORD'"
  
  echo ""
  echo -e "${GREEN}🎉 ADMIN SYSTEM DEPLOYED!${NC}"
  echo ""
  echo "📍 Admin Panel URL: https://immigrationai.co.za/admin"
  echo "📧 Admin Email: $ADMIN_EMAIL"
  echo ""
  echo "⚠️  IMPORTANT: Save your admin credentials securely!"
fi

cd ..

echo ""
echo "✅ Setup complete!"


