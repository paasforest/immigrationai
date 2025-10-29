# 🚀 Immigration AI - Supabase Hybrid Setup Guide

## Best of Both Worlds: Supabase + Hetzner

### Why This Setup?

✅ **Supabase** = Managed PostgreSQL (free for small scale)  
✅ **Hetzner** = Cheap compute for your API  
✅ **Result** = Fastest, cheapest, easiest production setup

---

## Step 1: Create Supabase Database

### 1.1 Create Project
1. Go to https://supabase.com
2. Create account (free)
3. Create new project → "Immigration AI"
4. Choose region closest to your users
5. Generate a strong database password

### 1.2 Get Connection String
```bash
# In Supabase dashboard → Settings → Database
# Your connection URL will look like:
# postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Copy this URL
```

### 1.3 Update .env
```bash
# backend/.env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NODE_ENV=production
```

### 1.4 Run Migrations
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy  # Creates all tables in Supabase
```

---

## Step 2: Deploy Backend to Hetzner

### 2.1 Create Hetzner VPS
1. Go to https://hetzner.com
2. Create account
3. Choose **CX21** (€4.87/month) or **CX31** (€11.78/month)
4. OS: Ubuntu 22.04
5. Location: Choose closest to your users (Helsinki/Falkenstein are good)

### 2.2 Initial Server Setup
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx (for reverse proxy)
sudo apt install nginx -y
```

### 2.3 Deploy Your Backend
```bash
# Clone your repo
cd /opt
git clone https://github.com/YOUR_USERNAME/immigration_ai.git
cd immigration_ai/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create .env file
nano .env
# Add all your environment variables

# Generate Prisma client
npx prisma generate

# Start with PM2
pm2 start dist/app.js --name immigration-backend
pm2 save
pm2 startup  # Makes it auto-start on reboot
```

### 2.4 Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/immigration-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4000/health;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Step 3: Deploy Frontend (Next.js)

### Option A: Cloudflare Pages (Recommended)
1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `.next`
4. Environment variables: Add all your `NEXT_PUBLIC_*` vars
5. Deploy automatically on push to main

### Option B: Hetzner VPS
```bash
cd /opt/immigration_ai
npm install
npm run build

# Use PM2 or serve with nginx
```

---

## Cost Breakdown

### Supabase Database
- **Free tier**: 500MB database, 2GB bandwidth/month
- **Paid**: €25/month for Production tier
- **Perfect for**: < 1000 active users/month

### Hetzner VPS
- **CX21**: €4.87/month (2GB RAM, 2 vCPU)
- **CX31**: €11.78/month (4GB RAM, 2 vCPU)
- **Perfect for**: Most applications

### Cloudflare
- **Free tier**: Unlimited bandwidth, CDN, DDoS protection
- **Paid**: Starting at $20/month
- **Perfect for**: Frontend hosting

### Total: €5-12/month
*(vs €15-30/month for other providers)*

---

## Environment Variables

### Backend (.env on Hetzner VPS)
```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-minimum-32-chars"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Frontend URL
FRONTEND_URL="https://yourdomain.com"

# Node Environment
NODE_ENV=production
PORT=4000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

---

## Security Checklist

✅ Use HTTPS (SSL certificates from Let's Encrypt)  
✅ Set up firewall (UFW on Ubuntu)  
✅ Enable rate limiting (already in your code)  
✅ Use environment variables for secrets  
✅ Enable Supabase RLS (Row Level Security) if needed  
✅ Back up database regularly (Supabase auto-backups daily)

---

## Monitoring

### Check Backend Status
```bash
pm2 status
pm2 logs immigration-backend
pm2 monit  # Real-time monitoring
```

### Database Monitoring
- Supabase Dashboard → Database → Observability
- View connection stats, query performance, storage

### Application Monitoring
- Consider adding Sentry for error tracking
- Use Supabase's built-in analytics

---

## Next Steps After Deployment

1. **Test all endpoints** - Run through your API tests
2. **Set up SSL** - Use Certbot for Let's Encrypt
3. **Configure backups** - Supabase does this automatically
4. **Set up monitoring** - Use PM2 or CloudWatch
5. **Enable logging** - Winston logs are already configured

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection from server
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### Backend Not Starting
```bash
pm2 logs immigration-backend  # Check logs
pm2 restart immigration-backend  # Restart
```

### Nginx Issues
```bash
sudo nginx -t  # Test config
sudo systemctl status nginx  # Check status
sudo tail -f /var/log/nginx/error.log  # View errors
```

---

## Benefits of This Setup

✅ **Fast**: Global CDN for frontend, optimized database  
✅ **Cheap**: €5-12/month total  
✅ **Reliable**: Supabase handles DB uptime, PM2 handles API  
✅ **Scalable**: Easy to upgrade Hetzner or Supabase plans  
✅ **Secure**: Built-in SSL, managed security  
✅ **Developer-Friendly**: No database maintenance needed  

---

## When to Upgrade

### Upgrade Supabase to Paid (€25/month) when:
- Database exceeds 500MB
- Need more bandwidth
- Want daily backups (you get this on paid plan)

### Upgrade Hetzner VPS when:
- Backend CPU consistently > 80%
- Memory usage spikes
- Need more storage

---

**🎉 You're ready to deploy!**


