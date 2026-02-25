#!/bin/bash

# Initial Hetzner Server Setup Script for Immigration AI
# Run this ONCE on a fresh Hetzner VPS
# Usage: bash setup-hetzner.sh

set -e  # Exit on any error

echo "🚀 Setting up Hetzner VPS for Immigration AI..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root${NC}"
    echo "Usage: sudo bash setup-hetzner.sh"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
apt install -y nginx

# Install certbot (for SSL certificates)
echo "📦 Installing certbot..."
apt install -y certbot python3-certbot-nginx

# Install git (if not present)
echo "📦 Installing git..."
apt install -y git

# Install build essentials (for native modules)
echo "📦 Installing build tools..."
apt install -y build-essential

# Configure firewall
echo "🔒 Configuring firewall (UFW)..."
apt install -y ufw
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo -e "${GREEN}✅ Basic setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone https://github.com/YOUR_REPO/immigration_ai.git"
echo "2. Copy .env.production.example to .env and configure"
echo "3. Run: cd immigration_ai/backend && npm install && npm run build"
echo "4. Start with PM2: pm2 start dist/app.js --name immigration-backend"
echo "5. Setup PM2 to start on boot: pm2 save && pm2 startup"
echo ""
echo "To setup nginx:"
echo "1. Copy nginx.conf.template to /etc/nginx/sites-available/immigration-api"
echo "2. Edit and replace 'api.yourdomain.com' with your actual domain"
echo "3. Enable site: sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/"
echo "4. Test config: sudo nginx -t"
echo "5. Restart nginx: sudo systemctl restart nginx"
echo "6. Get SSL: sudo certbot --nginx -d api.yourdomain.com"
echo ""


