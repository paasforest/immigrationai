# 🚀 Production Deployment Checklist

## Architecture Overview
- **Frontend**: Vercel (Next.js)
- **Backend API**: Hetzner VPS (Express.js)
- **Database + Storage**: Supabase (PostgreSQL + File Storage)

---

## Step 1: Supabase Setup ✅

### 1.1 Create Account & Project
```bash
□ Go to https://supabase.com
□ Sign up (free tier available)
□ Create new project "Immigration AI"
□ Choose region closest to your users (EU Central recommended)
□ Generate strong database password
```

### 1.2 Get Credentials
```bash
□ Copy DATABASE_URL from Settings → Database
□ Copy ANON_KEY and SERVICE_KEY from Settings → API
```

### 1.3 Create Storage Buckets
In Supabase Dashboard → Storage:

```bash
□ Create bucket: "user-uploads" (public = true)
□ Create bucket: "documents" (public = true)
□ Create bucket: "payment-proofs" (public = false)
□ Create bucket: "temp-files" (public = true)
```

### 1.4 Set Up Database
```bash
□ Update backend/.env with DATABASE_URL
□ Run: npx prisma migrate deploy
□ Verify: npx prisma studio (opens database GUI)
```

---

## Step 2: Hetzner Setup ✅

### 2.1 Create VPS
```bash
□ Go to https://hetzner.com
□ Sign up for account
□ Create new VPS (CX21 or CX31 recommended)
□ Location: Falkenstein, Germany
□ Ubuntu 22.04
□ SSH key: Add your public key
```

### 2.2 Initial Server Setup
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

□ sudo apt update && sudo apt upgrade -y
□ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
□ sudo apt install -y nodejs nginx
□ sudo npm install -g pm2
□ git --version (verify git is installed)
```

### 2.3 Deploy Backend
```bash
# On Hetzner server
□ cd /opt
□ git clone https://github.com/YOUR_REPO/immigration_ai.git
□ cd immigration_ai/backend
□ npm install
□ npm run build

# Create .env file
□ nano .env
# Add all environment variables (see below)
```

### 2.4 Backend .env File
```bash
# Copy this and fill in values:
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"

JWT_SECRET="generate-random-string-32-chars-minimum"
JWT_REFRESH_SECRET="generate-another-random-string-32-chars"

OPENAI_API_KEY="sk-your-openai-key"

FRONTEND_URL="https://yourdomain.vercel.app"
NODE_ENV=production
PORT=4000
```

### 2.5 Start Backend with PM2
```bash
□ npx prisma generate
□ pm2 start dist/app.js --name immigration-backend
□ pm2 save
□ pm2 startup
```

### 2.6 Configure Nginx
```bash
□ sudo nano /etc/nginx/sites-available/immigration-api
# Paste nginx config (see PRODUCTION_ARCHITECTURE.md)
□ sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/
□ sudo nginx -t
□ sudo systemctl restart nginx
```

### 2.7 Set Up SSL (Let's Encrypt)
```bash
□ sudo apt install certbot python3-certbot-nginx
□ sudo certbot --nginx -d api.yourdomain.com
□ Test auto-renewal: sudo certbot renew --dry-run
```

---

## Step 3: Vercel Setup ✅

### 3.1 Connect GitHub
```bash
□ Go to https://vercel.com
□ Sign in with GitHub
□ Click "Add New Project"
□ Select your repository
```

### 3.2 Configure Project
```bash
□ Framework Preset: Next.js (auto-detected)
□ Root Directory: ./
□ Build Command: npm run build
□ Output Directory: .next
□ Install Command: npm install
```

### 3.3 Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.vercel.app"
```

### 3.4 Deploy
```bash
□ Click "Deploy"
□ Wait for build to complete
□ Verify deployment URL
```

---

## Step 4: Domain & DNS ✅

### 4.1 Configure DNS Records
```bash
□ A Record: @ → Vercel IP (auto-configured)
□ CNAME: api → api.yourdomain.com
□ Verify SSL certificates active
```

### 4.2 Update Environment Variables
```bash
□ Update FRONTEND_URL in Hetzner .env
□ Update NEXT_PUBLIC_API_URL in Vercel
□ Redeploy backend: pm2 restart immigration-backend
□ Redeploy frontend: Push to GitHub
```

---

## Step 5: Testing ✅

### 5.1 Test Backend API
```bash
□ curl https://api.yourdomain.com/health
□ Should return: {"status":"ok",...}

□ Test auth:
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 5.2 Test File Upload
```bash
□ Test profile image upload
□ Verify file appears in Supabase Storage
□ Check public URL is accessible
```

### 5.3 Test Frontend
```bash
□ Visit: https://yourdomain.vercel.app
□ Test signup/login
□ Test document generation
□ Test file uploads
□ Check all features work
```

---

## Step 6: Monitoring & Maintenance ✅

### 6.1 Set Up Monitoring
```bash
□ PM2: pm2 monit (real-time monitoring)
□ Logs: pm2 logs immigration-backend
□ Nginx logs: sudo tail -f /var/log/nginx/error.log
```

### 6.2 Backups
```bash
□ Supabase: Automatic daily backups (paid plan)
□ Database backup command: manual backup script
□ Document your backup strategy
```

### 6.3 Security
```bash
□ Set up UFW firewall on Hetzner
□ SSH keys only (disable password auth)
□ Rate limiting active (already in code)
□ Environment variables secured
□ SSL certificates active
```

---

## Post-Deployment ✅

### Immediate Tasks
```bash
□ Test all API endpoints
□ Test user signup/login flow
□ Test document generation
□ Test file uploads
□ Test payment flow (if applicable)
□ Verify emails are sending
□ Check analytics/monitoring
```

### First Week
```bash
□ Monitor error logs daily
□ Check performance metrics
□ Verify auto-scaling works
□ Monitor costs
□ Gather user feedback
```

### Ongoing
```bash
□ Weekly: Review logs
□ Monthly: Update dependencies
□ Quarterly: Security audit
□ As needed: Scale resources
```

---

## Rollback Plan

If something goes wrong:

### Backend
```bash
# SSH into Hetzner
ssh root@YOUR_SERVER_IP
cd /opt/immigration_ai/backend
git checkout PREVIOUS_COMMIT
pm2 restart immigration-backend
```

### Frontend
```bash
# In Vercel dashboard
□ Go to Deployments
□ Find previous successful deployment
□ Click "..." → "Promote to Production"
```

---

## Cost Monitoring

Track your spending:

### Monthly Budget
```bash
Vercel: Free tier = €0
Hetzner: CX21 = €5/month
Supabase: Free tier = €0
Total: €5/month

If you exceed:
- Supabase free limits → Upgrade to €25/month
- More traffic → Upgrade Hetzner to CX31 (€12/month)
```

### When to Scale
```bash
□ Vercel: >100GB bandwidth/month → Upgrade to Pro
□ Hetzner: CPU >80% consistently → Upgrade VPS
□ Supabase: Database >500MB → Upgrade plan
```

---

## Support & Resources

### Documentation
```bash
□ Supabase: https://supabase.com/docs
□ Vercel: https://vercel.com/docs
□ Hetzner: https://docs.hetzner.com
□ Your code: Already well-documented! 😊
```

### When Things Break
```bash
1. Check PM2 logs: pm2 logs
2. Check Nginx logs: sudo tail /var/log/nginx/error.log
3. Check database: Supabase Dashboard → Database
4. Check backend health: curl https://api.domain.com/health
5. Contact support if needed
```

---

## 🎉 Success Criteria

You're ready when:
```bash
✅ Backend API responds to /health
✅ Users can signup/login
✅ Documents can be generated
✅ Files can be uploaded to Supabase
✅ Frontend displays correctly
✅ SSL certificates active
✅ Monitoring in place
✅ Backups configured
✅ DNS properly configured
```

---

**You've got this! 🚀**

For detailed setup instructions, see `PRODUCTION_ARCHITECTURE.md`


