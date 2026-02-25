#!/bin/bash

# Deploy Admin System to Hetzner
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

HETZNER_IP="78.46.183.41"
BACKEND_DIR="/home/paas/immigration_ai/backend"

echo -e "${BLUE}🚀 Deploying Admin System to Production${NC}"
echo "============================================"
echo ""

# Step 1: Upload migration
echo -e "${BLUE}Step 1: Uploading migration file${NC}"
scp backend/prisma/migrations/add_role_column.sql root@$HETZNER_IP:$BACKEND_DIR/prisma/migrations/
echo -e "${GREEN}✅ Migration uploaded${NC}"
echo ""

# Step 2: Run migration
echo -e "${BLUE}Step 2: Running database migration${NC}"
ssh root@$HETZNER_IP "cd $BACKEND_DIR && psql \"\$DATABASE_URL\" -f prisma/migrations/add_role_column.sql"
echo -e "${GREEN}✅ Migration complete${NC}"
echo ""

# Step 3: Upload backend files
echo -e "${BLUE}Step 3: Uploading admin backend files${NC}"
scp backend/src/routes/admin.routes.ts root@$HETZNER_IP:$BACKEND_DIR/src/routes/
scp backend/src/controllers/adminController.ts root@$HETZNER_IP:$BACKEND_DIR/src/controllers/
scp backend/src/middleware/requireAdmin.ts root@$HETZNER_IP:$BACKEND_DIR/src/middleware/
scp backend/src/services/trackingService.ts root@$HETZNER_IP:$BACKEND_DIR/src/services/
echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Step 4: Rebuild and restart
echo -e "${BLUE}Step 4: Building and restarting backend${NC}"
ssh root@$HETZNER_IP "cd $BACKEND_DIR && npx prisma generate && npm run build && pm2 restart immigration-backend"
echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

# Step 5: Get admin credentials
echo -e "${YELLOW}Enter admin email (e.g., admin@immigrationai.co.za):${NC}"
read ADMIN_EMAIL
echo -e "${YELLOW}Enter admin password (min 8 characters):${NC}"
read -s ADMIN_PASSWORD
echo ""

# Step 6: Create admin user
echo -e "${BLUE}Step 5: Creating admin user${NC}"
ssh root@$HETZNER_IP "cd $BACKEND_DIR && node src/scripts/create-admin-user.js '$ADMIN_EMAIL' '$ADMIN_PASSWORD'"
echo ""

echo -e "${GREEN}🎉 ADMIN SYSTEM DEPLOYED SUCCESSFULLY!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📍 Admin Panel:${NC} https://immigrationai.co.za/admin"
echo -e "${BLUE}📊 Payments:${NC} https://immigrationai.co.za/admin/payments"
echo -e "${BLUE}📈 UTM Analytics:${NC} https://immigrationai.co.za/admin/utm-analytics"
echo ""
echo -e "${BLUE}🔑 Your Admin Credentials:${NC}"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: [saved securely]"
echo ""
echo "⚠️  SAVE THESE CREDENTIALS - You'll need them to login!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


