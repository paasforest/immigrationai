# ✅ Hetzner Deployment - Ready to Deploy!

## 🎯 What's Been Prepared

I've prepared **everything** you need for Hetzner deployment. When you're ready to deploy, it will take just **10 minutes**.

### ✅ Files Created for You:

1. **`backend/setup-hetzner.sh`** - Initial server setup (Node.js, PM2, nginx)
2. **`backend/deploy.sh`** - Quick deployment script
3. **`backend/nginx.conf.template`** - Nginx configuration (ready to use)
4. **`backend/ecosystem.config.js`** - PM2 configuration
5. **`backend/README_DEPLOYMENT.md`** - Complete deployment guide
6. **`backend/.env.production.example`** - Environment variables template

---

## 🚀 Quick Deployment (10 Minutes)

### Step 1: Initial Server Setup (5 min)

```bash
# SSH into Hetzner
ssh root@YOUR_HETZNER_IP

# Run setup script
bash <(curl -s https://raw.githubusercontent.com/YOUR_REPO/immigration_ai/main/backend/setup-hetzner.sh)

# Or if downloaded locally:
cd /path/to/immigration_ai/backend
bash setup-hetzner.sh
```

**This installs:**
- ✅ Node.js 20
- ✅ PM2
- ✅ nginx
- ✅ certbot (for SSL)
- ✅ Git
- ✅ Build tools
- ✅ Firewall (UFW) configured

### Step 2: Clone & Configure (3 min)

```bash
# Clone your repo
cd /opt
git clone https://github.com/YOUR_REPO/immigration_ai.git
cd immigration_ai/backend

# Copy environment file
cp .env.production.example .env

# Edit with your values
nano .env
```

**Fill in these 5 critical values:**

1. **DATABASE_URL** - From Supabase dashboard
2. **SUPABASE_URL** - From Supabase API settings
3. **SUPABASE_SERVICE_KEY** - From Supabase API settings
4. **OPENAI_API_KEY** - From OpenAI dashboard
5. **FRONTEND_URL** - Your Vercel URL

### Step 3: Deploy (2 min)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Start with PM2
pm2 start dist/app.js --name immigration-backend

# Save and enable auto-start
pm2 save
pm2 startup

# Done!
```

---

## 🌐 Setup Nginx & SSL (5 min)

```bash
# Copy nginx config
sudo cp backend/nginx.conf.template /etc/nginx/sites-available/immigration-api

# Edit and change domain
sudo nano /etc/nginx/sites-available/immigration-api
# Change: server_name api.yourdomain.com

# Enable site
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

---

## ✅ That's It! You're Live

Your API is now running at:
- **http://api.yourdomain.com**
- **https://api.yourdomain.com** (with SSL)

---

## 📊 Verify Deployment

### Health Check
```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok",...}
```

### Check PM2
```bash
pm2 status
pm2 logs immigration-backend
```

### Check Nginx
```bash
sudo systemctl status nginx
curl http://localhost:4000/health
```

---

## 🔄 Future Updates

When you update your code:

```bash
cd /opt/immigration_ai/backend
git pull origin main
./deploy.sh
```

The `deploy.sh` script handles everything automatically!

---

## 🎯 Everything is Production-Ready

### ✅ Security
- Firewall configured (UFW)
- SSL certificates (Let's Encrypt)
- Environment variables secured
- Rate limiting active
- Helmet security headers
- CORS configured

### ✅ Performance
- Connection pooling (Prisma)
- PM2 auto-restart
- Nginx reverse proxy
- Timeout configurations
- File upload limits (10MB)

### ✅ Monitoring
- PM2 monitoring built-in
- Health check endpoint
- Logging configured
- Graceful shutdown

### ✅ Scalability
- Easy to upgrade VPS size
- Can add more PM2 instances
- Database connection pooling
- File storage on Supabase CDN

---

## 📁 File Reference

**You created these files for automatic deployment:**

| File | Purpose |
|------|---------|
| `backend/setup-hetzner.sh` | One-time server setup |
| `backend/deploy.sh` | Quick deploy/update script |
| `backend/nginx.conf.template` | Nginx configuration |
| `backend/ecosystem.config.js` | PM2 process config |
| `backend/README_DEPLOYMENT.md` | Full deployment docs |
| `.env.production.example` | Environment variables template |

---

## 💰 Cost Summary

**Monthly Costs:**
- Hetzner CX21: **€4.87/month**
- Supabase: **€0** (free tier)
- Vercel: **€0** (free tier)
- **Total: €5/month**

**Upgrades available:**
- CX31 (4GB RAM): €11.78/month
- Supabase Pro: €25/month
- Vercel Pro: $20/month

---

## 🎉 You're Ready!

When you're ready to deploy:
1. SSH into Hetzner
2. Run `setup-hetzner.sh`
3. Configure `.env` file
4. Run `deploy.sh`
5. Setup nginx & SSL
6. Done!

**Total time: ~15 minutes**

Everything is automated and production-ready! 🚀


