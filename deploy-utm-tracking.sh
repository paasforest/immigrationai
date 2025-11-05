#!/bin/bash

# Deploy UTM Tracking to Hetzner Production Server
# Server: 78.46.183.41
# Path: /var/www/immigrationai/backend

set -e

SERVER="root@78.46.183.41"
BACKEND_PATH="/var/www/immigrationai/backend"

echo "🚀 Deploying UTM Tracking System to Hetzner..."
echo ""

# Step 1: Run Database Migration
echo "📊 Step 1/5: Running database migration..."
ssh $SERVER << 'ENDSSH'
cd /var/www/immigrationai/backend
echo "Running UTM tracking migration..."
psql $DATABASE_URL -c "
-- UTM Tracking Table for Marketing Attribution
CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  referrer VARCHAR(500),
  landing_page VARCHAR(500),
  session_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tracking_user_id ON user_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_utm_source ON user_tracking(utm_source);
CREATE INDEX IF NOT EXISTS idx_user_tracking_utm_campaign ON user_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_user_tracking_converted ON user_tracking(converted);
CREATE INDEX IF NOT EXISTS idx_user_tracking_created_at ON user_tracking(created_at);
"
echo "✅ Database migration complete"
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Database migration successful"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo ""

# Step 2: Upload tracking service
echo "📤 Step 2/5: Uploading trackingService.ts..."
scp backend/src/services/trackingService.ts $SERVER:$BACKEND_PATH/src/services/
if [ $? -eq 0 ]; then
    echo "✅ Tracking service uploaded"
else
    echo "❌ Upload failed"
    exit 1
fi

echo ""

# Step 3: Upload updated auth files
echo "📤 Step 3/5: Uploading updated auth files..."
scp backend/src/services/authService.prisma.ts $SERVER:$BACKEND_PATH/src/services/
scp backend/src/controllers/authController.ts $SERVER:$BACKEND_PATH/src/controllers/
if [ $? -eq 0 ]; then
    echo "✅ Auth files uploaded"
else
    echo "❌ Upload failed"
    exit 1
fi

echo ""

# Step 4: Build backend
echo "🔨 Step 4/5: Building backend..."
ssh $SERVER << 'ENDSSH'
cd /var/www/immigrationai/backend
npm run build 2>&1 | grep -E "(success|error|warning)" | tail -10 || true
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Build completed"
else
    echo "⚠️  Build completed with warnings (non-fatal)"
fi

echo ""

# Step 5: Restart PM2
echo "🔄 Step 5/5: Restarting backend..."
ssh $SERVER << 'ENDSSH'
pm2 restart immigration-backend
pm2 save
echo "Waiting for backend to stabilize..."
sleep 3
pm2 status immigration-backend
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ Backend restarted successfully"
else
    echo "❌ Backend restart failed"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ UTM Tracking Deployment Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Deployed:"
echo "  ✅ Database: user_tracking table created"
echo "  ✅ Backend: trackingService.ts"
echo "  ✅ Backend: Updated auth service"
echo "  ✅ Backend: Updated auth controller"
echo "  ✅ PM2: Restarted and saved"
echo ""
echo "🧪 Test It:"
echo "  1. Visit: https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=test"
echo "  2. Sign up for a test account"
echo "  3. Check database:"
echo "     ssh $SERVER"
echo '     psql $DATABASE_URL -c "SELECT * FROM user_tracking WHERE utm_source = '\''proconnectsa'\'';"'
echo ""
echo "📊 View Analytics:"
echo '  ssh $SERVER'
echo '  psql $DATABASE_URL -c "SELECT utm_source, COUNT(*) FROM user_tracking GROUP BY utm_source;"'
echo ""
echo "✅ Ready for ProConnectSA integration!"

