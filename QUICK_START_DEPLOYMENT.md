# 🚀 Quick Start: Deploy to Production in 30 Minutes

## What We're Building
- **Frontend** on Vercel (deploys from GitHub automatically)
- **Backend API** on Hetzner VPS (runs with PM2)
- **Database + Images** on Supabase (managed PostgreSQL + Storage)

---

## Step 1: Supabase (5 minutes)

### Create Project
1. Go to https://supabase.com → Sign up
2. Click "New Project"
3. Name: "Immigration AI"
4. Region: **Falkenstein** (EU Central)
5. Database Password: Generate strong password (save it!)
6. Click "Create new project"

### Create Storage Buckets
Wait 2 minutes for project to initialize, then:

1. Go to **Storage** → Create bucket
2. Create these 4 buckets (all **Public** except payment-proofs):

| Bucket Name | Public? | Purpose |
|-------------|--------|---------|
| `user-uploads` | ✅ Yes | Profile images, user files |
| `documents` | ✅ Yes | SOPs, letters, documents |
| `payment-proofs` | ❌ No | Payment screenshots (private) |
| `temp-files` | ✅ Yes | Temporary files |

### Get Connection String
1. Go to **Settings** → **Database**
2. Scroll down to **Connection String** → **URI**
3. Copy the URL that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

4. Go to **Settings** → **API**
5. Copy **anon key** and **service_role key**

---

## Step 2: Hetzner (10 minutes)

### Create VPS
1. Go to https://hetzner.com → Sign up
2. Click "New Server"
3. Choose **CX21** (€4.87/month) - 2GB RAM is plenty
4. Location: **Falkenstein** (Germany) - closest to Supabase
5. Image: **Ubuntu 22.04**
6. SSH Key: Add your public key (or create new one)
7. Name: "immigration-api"
8. Click "Create & Buy Now"

### SSH Into Server
```bash
# Copy the IP address from Hetzner dashboard
ssh root@YOUR_SERVER_IP
```

### Install Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y

# Install git (if not present)
sudo apt install git -y
```

### Deploy Backend
```bash
# Navigate to /opt
cd /opt

# Clone your repo (replace with your GitHub URL)
git clone https://github.com/YOUR_USERNAME/immigration_ai.git

# Go to backend
cd immigration_ai/backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Configure Environment
```bash
# Create .env file
nano .env

# Paste this (replace with your actual values):
```

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Supabase Storage
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_KEY="your-service-key-here"

# JWT Secrets (generate random strings)
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# OpenAI API Key
OPENAI_API_KEY="sk-your-openai-api-key"

# Frontend URL (we'll update after Vercel deploy)
FRONTEND_URL="http://localhost:3000"

NODE_ENV=production
PORT=4000
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Generate Prisma Client
```bash
npx prisma generate
```

### Start with PM2
```bash
pm2 start dist/app.js --name immigration-backend
pm2 save
pm2 startup
```

### Configure Nginx
```bash
# Create config file
sudo nano /etc/nginx/sites-available/immigration-api
```

Paste this (replace `api.yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
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
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Install SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

Test it:
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok",...}
```

---

## Step 3: Vercel (5 minutes)

### Deploy Frontend
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects Next.js - click "Deploy"
6. Wait 2 minutes for deployment

### Configure Environment Variables
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

3. Go to **Deployments** tab
4. Click the three dots on latest deployment → **Redeploy**

### Update Backend FRONTEND_URL
Go back to your Hetzner server:
```bash
ssh root@YOUR_SERVER_IP
cd /opt/immigration_ai/backend
nano .env

# Update FRONTEND_URL with your Vercel URL
FRONTEND_URL="https://yourproject.vercel.app"

# Restart backend
pm2 restart immigration-backend
```

---

## Step 4: Test Everything (10 minutes)

### Test Backend
```bash
# Health check
curl https://api.yourdomain.com/health

# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

### Test Frontend
1. Visit your Vercel deployment URL
2. Try signing up
3. Try logging in
4. Generate a SOP
5. Upload an image
6. Check Supabase Storage - file should appear

### Test File Upload
```bash
# From your local machine
curl -X POST https://api.yourdomain.com/api/upload/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## Done! 🎉

Your app is now live at:
- **Frontend**: https://yourproject.vercel.app
- **Backend API**: https://api.yourdomain.com
- **Database**: Supabase Dashboard
- **Storage**: Supabase Storage → Uploads bucket

---

## Monitoring

### Check Backend Status
```bash
ssh root@YOUR_SERVER_IP
pm2 status              # See running processes
pm2 logs immigration-backend  # View logs
pm2 monit               # Real-time monitoring
```

### Check Supabase
- Go to Supabase Dashboard
- Database → Tables - see your data
- Storage → Buckets - see uploaded files

### Check Vercel
- Go to Vercel Dashboard
- Deployments - see build history
- Analytics - see traffic

---

## Next Steps

1. **Set up custom domain** for Vercel
2. **Enable database backups** in Supabase
3. **Set up error monitoring** (Sentry is free)
4. **Configure alerts** in PM2
5. **Write documentation** for your team

---

## Troubleshooting

### Backend not starting?
```bash
pm2 logs immigration-backend  # Check logs
npm run build                 # Rebuild
```

### Database connection error?
```bash
# Test connection from Hetzner
psql "YOUR_DATABASE_URL"
```

### Nginx error?
```bash
sudo nginx -t                 # Test config
sudo systemctl status nginx  # Check status
```

### File upload fails?
```bash
# Check Supabase bucket exists
# Check service key is correct
# Check file size < 10MB
```

---

## Cost Summary

- **Vercel**: Free (up to 100GB bandwidth)
- **Hetzner**: €4.87/month (CX21)
- **Supabase**: Free (up to 500MB database, 1GB storage)
- **Total**: €5/month! 🎉

**You're running a production app for less than a coffee!** ☕


