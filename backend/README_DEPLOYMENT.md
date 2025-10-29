# 🚀 Hetzner Deployment Guide - Immigration AI

This guide will help you deploy the Immigration AI backend to Hetzner VPS.

---

## 📋 Prerequisites

- Hetzner VPS (CX21 or CX31 recommended)
- GitHub repository with your code
- Supabase project created
- OpenAI API key
- Domain name (optional but recommended)

---

## ⚡ Quick Start (5 Steps)

### 1. Initial Server Setup
```bash
# SSH into your Hetzner server
ssh root@YOUR_SERVER_IP

# Run the setup script
wget https://raw.githubusercontent.com/YOUR_REPO/immigration_ai/main/backend/setup-hetzner.sh
bash setup-hetzner.sh
```

### 2. Clone Repository
```bash
cd /opt
git clone https://github.com/YOUR_REPO/immigration_ai.git
cd immigration_ai/backend
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.production.example .env

# Edit with your values
nano .env

# IMPORTANT: Fill in all these values:
# - DATABASE_URL (from Supabase)
# - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
# - JWT_SECRET, JWT_REFRESH_SECRET
# - OPENAI_API_KEY
```

### 4. Install & Build
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build
```

### 5. Deploy with PM2
```bash
# Start the backend
pm2 start dist/app.js --name immigration-backend

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 logs immigration-backend
```

---

## 🔧 Configuration Files

### Environment Variables (.env)

Copy from `.env.production.example` and fill in:

#### Database (Supabase)
```bash
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

#### Supabase Storage
```bash
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### JWT Secrets
```bash
# Generate with: openssl rand -base64 32
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
```

#### OpenAI
```bash
OPENAI_API_KEY="sk-proj-your-key-here"
```

#### Frontend URL
```bash
FRONTEND_URL="https://yourproject.vercel.app"
```

---

## 🌐 Configure Nginx

### 1. Create Nginx Config
```bash
# Copy the template
sudo cp nginx.conf.template /etc/nginx/sites-available/immigration-api

# Edit it
sudo nano /etc/nginx/sites-available/immigration-api

# IMPORTANT: Change 'api.yourdomain.com' to your actual domain!
```

### 2. Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx
```

### 3. Get SSL Certificate
```bash
# Get certificate from Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Maintenance

### Check Backend Status
```bash
# PM2 status
pm2 status

# Real-time monitoring
pm2 monit

# View logs
pm2 logs immigration-backend

# View last 100 lines
pm2 logs immigration-backend --lines 100
```

### Check Nginx Status
```bash
# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/immigration-api-access.log
```

### Check Database Connection
```bash
# Test from server
cd /opt/immigration_ai/backend
npx prisma studio  # Opens web interface
```

---

## 🔄 Updating the Backend

### Quick Update (After Code Changes)
```bash
cd /opt/immigration_ai/backend
git pull origin main          # Pull latest code
npm install                   # Update dependencies
npm run build                 # Rebuild
pm2 restart immigration-backend # Restart
```

### Or Use the Deploy Script
```bash
cd /opt/immigration_ai/backend
chmod +x deploy.sh
./deploy.sh
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs immigration-backend

# Check if port is in use
lsof -i :4000

# Kill process if needed
kill -9 $(lsof -t -i:4000)

# Restart
pm2 restart immigration-backend
```

### Database Connection Error
```bash
# Test connection
psql "YOUR_DATABASE_URL"

# Check Supabase status
# Go to Supabase Dashboard → Check database status

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Nginx Error
```bash
# Check syntax
sudo nginx -t

# View error log
sudo tail -50 /var/log/nginx/error.log

# Check if backend is running
curl http://localhost:4000/health
```

### File Upload Fails
```bash
# Check Supabase service key
cat .env | grep SUPABASE_SERVICE_KEY

# Test Supabase connection
# Go to Supabase Dashboard → Storage → Check buckets exist
```

### Out of Memory
```bash
# Check memory usage
htop

# If running out of memory on CX21:
# 1. Upgrade to CX31 (€11.78/month)
# 2. Or restart: pm2 restart immigration-backend
```

---

## 📈 Scaling & Performance

### Upgrade VPS
If you need more resources:
1. Go to Hetzner Cloud Console
2. Select your VPS
3. Click "Resize"
4. Choose CX31 (€11.78/month) or higher

### Add Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Check system resources
htop              # CPU & Memory
iotop             # Disk I/O
nethogs          # Network usage
```

### Setup Automatic Backups
```bash
# Install backup script
sudo apt install cron

# Create backup script
nano /opt/backup-db.sh
```

---

## 🔒 Security Checklist

- [ ] ✅ Firewall enabled (UFW)
- [ ] ✅ SSH keys only (disable password auth)
- [ ] ✅ SSL certificate installed
- [ ] ✅ Environment variables secured
- [ ] ✅ Database password is strong
- [ ] ✅ JWT secrets are random and secure
- [ ] ✅ PM2 running as non-root user
- [ ] ✅ Nginx configured with security headers
- [ ] ✅ Rate limiting active (in application code)
- [ ] ✅ File upload size limits set

---

## 📞 Getting Help

### Logs Location
- PM2 logs: `./logs/pm2-*.log`
- Nginx access: `/var/log/nginx/immigration-api-access.log`
- Nginx errors: `/var/log/nginx/immigration-api-error.log`
- Application logs: `./logs/combined.log`

### Health Check
```bash
# Check backend
curl http://localhost:4000/health

# Check through nginx
curl http://api.yourdomain.com/health
```

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ `pm2 status` shows "online"
- ✅ Health check returns `{"status":"ok"}`
- ✅ SSL certificate is active
- ✅ API responds on https://api.yourdomain.com
- ✅ Database connection works
- ✅ File uploads work to Supabase Storage
- ✅ Frontend can connect to backend

---

**You're all set! 🚀**

For issues or questions, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u nginx`


