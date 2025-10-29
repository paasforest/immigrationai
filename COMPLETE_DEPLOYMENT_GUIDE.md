# 🚀 Complete Deployment Guide - Immigration AI

## Architecture Overview

```
┌──────────────────────────┐
│   Vercel (Frontend)      │  → https://yourdomain.vercel.app
│   - Next.js App          │  Free tier: 100GB/month
│   - Global CDN           │
│   - Auto-deploys         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Hetzner (Backend API)  │  → https://api.yourdomain.com
│   - Express.js API       │  €5/month (CX21)
│   - PM2 Process Manager  │
│   - Nginx Reverse Proxy  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Supabase               │  → https://[PROJECT].supabase.co
│   - PostgreSQL Database  │  Free tier available
│   - Supabase Storage     │  (upgrade to €25/month)
│   - Auto Backups         │
└──────────────────────────┘
```

---

## ⚡ Quick Start (30 Minutes Total)

### Part 1: Supabase Setup (5 min)
**File**: See `SUPABASE_SETUP_GUIDE.md`
- Create Supabase project
- Get database connection string
- Create storage buckets
- Copy API keys

### Part 2: Hetzner Setup (15 min)
**File**: See `DEPLOYMENT_COMPLETE.md` or `backend/README_DEPLOYMENT.md`
- Deploy backend to Hetzner
- Configure environment variables
- Setup Nginx and SSL

### Part 3: Vercel Setup (5 min)
**File**: See `VERCEL_SETUP_GUIDE.md`
- Connect GitHub to Vercel
- Deploy frontend
- Add environment variables
- Configure custom domain (optional)

### Part 4: Integration (5 min)
- Update `FRONTEND_URL` in Hetzner
- Update `NEXT_PUBLIC_API_URL` in Vercel
- Test all connections
- Verify file uploads work

---

## 📋 Deployment Checklist

### ✅ Before Starting

- [ ] GitHub repository is public or give Vercel access
- [ ] Domain name purchased (optional but recommended)
- [ ] Hetzner account created (€5/month)
- [ ] Supabase account created (free tier)
- [ ] OpenAI API key ready
- [ ] All code is committed and pushed

### ✅ Supabase Setup

- [ ] Project created in Supabase
- [ ] Database connection string copied
- [ ] API keys (anon + service_role) copied
- [ ] Storage buckets created:
  - [ ] `user-uploads`
  - [ ] `documents`
  - [ ] `payment-proofs`
  - [ ] `temp-files`
- [ ] Database migrations run
- [ ] Storage policies configured

### ✅ Hetzner Backend Setup

- [ ] VPS created (CX21 or CX31)
- [ ] Server setup script run
- [ ] Repository cloned to `/opt/immigration_ai`
- [ ] `.env` file configured with all variables
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Build completed
- [ ] PM2 started and configured
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Health check returns 200 OK

### ✅ Vercel Frontend Setup

- [ ] Account created and connected to GitHub
- [ ] Project imported from GitHub
- [ ] Deployment successful
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] Other required variables
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active

### ✅ Integration Testing

- [ ] Frontend loads on Vercel URL
- [ ] Signup creates user in Supabase database
- [ ] Login generates JWT token
- [ ] Document generation calls backend API
- [ ] Backend API forwards to OpenAI
- [ ] File upload goes to Supabase Storage
- [ ] Images display correctly
- [ ] No console errors
- [ ] No API errors
- [ ] All routes work

### ✅ Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up
- [ ] Backup strategy documented
- [ ] Team access configured
- [ ] Documentation completed
- [ ] Performance tested
- [ ] Security verified

---

## 🔗 Quick Links to All Guides

1. **Supabase**: `SUPABASE_SETUP_GUIDE.md`
2. **Hetzner**: `DEPLOYMENT_COMPLETE.md` and `backend/README_DEPLOYMENT.md`
3. **Vercel**: `VERCEL_SETUP_GUIDE.md`
4. **Deployment Checklist**: This file
5. **Architecture**: `PRODUCTION_ARCHITECTURE.md`

---

## 💰 Cost Breakdown

### Free Tier (Start Here)
- **Vercel**: €0/month (100GB bandwidth)
- **Supabase**: €0/month (500MB DB, 1GB storage)
- **Hetzner**: €5/month (CX21, 2GB RAM)
- **Total**: €5/month

### Growth (When You Scale)
- **Vercel Pro**: $20/month (more bandwidth)
- **Supabase Pro**: €25/month (bigger limits)
- **Hetzner CX31**: €12/month (4GB RAM)
- **Total**: ~€45-50/month

### Scale Further
- **Vercel Enterprise**: Custom pricing
- **Supabase Team**: €50/month
- **Hetzner CX41**: €23/month
- **Total**: Custom pricing

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Frontend accessible at `https://yourdomain.com` or Vercel URL
✅ Backend API accessible at `https://api.yourdomain.com`
✅ Health check returns `{"status":"ok"}`
✅ Users can signup and login
✅ SOP generation works with OpenAI
✅ File uploads go to Supabase Storage
✅ Images display correctly
✅ Database connection stable
✅ SSL certificates active on all domains
✅ No errors in browser console
✅ No errors in backend logs
✅ PM2 shows backend as "online"
✅ All monitoring working

---

## 🐛 Common Issues & Solutions

### Issue: Backend API not responding
**Solution**: Check PM2 status, verify port, check firewall

### Issue: Database connection fails
**Solution**: Verify DATABASE_URL, check Supabase status

### Issue: File upload fails
**Solution**: Check Supabase service key, verify bucket exists

### Issue: Frontend can't connect to backend
**Solution**: Verify NEXT_PUBLIC_API_URL, check CORS settings

### Issue: SSL certificate issues
**Solution**: Run certbot again, check DNS records

---

## 📊 Monitoring Each Service

### Hetzner (Backend)
```bash
ssh root@YOUR_SERVER
pm2 status          # Check status
pm2 logs           # View logs
curl localhost:4000/health  # Health check
```

### Supabase
- Dashboard → Database → View metrics
- Dashboard → Storage → Check usage
- Dashboard → API → View requests

### Vercel
- Dashboard → Deployments → View status
- Dashboard → Analytics → View traffic
- Dashboard → Functions → Check logs

---

## 🔄 Updating Your Deployment

### Update Code
```bash
# On Hetzner
cd /opt/immigration_ai/backend
git pull origin main
./deploy.sh

# Vercel auto-deploys from GitHub!
```

### Update Environment Variables
```bash
# Hetzner
nano /opt/immigration_ai/backend/.env
pm2 restart immigration-backend

# Vercel: Dashboard → Settings → Environment Variables → Redeploy
```

### Rollback Deployment
```bash
# Vercel: Deployments → Find previous version → Promote to Production
# Hetzner: git checkout PREVIOUS_COMMIT && pm2 restart
```

---

## 📞 Getting Help

### Documentation
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Hetzner: https://docs.hetzner.com
- PM2: https://pm2.keymetrics.io/docs

### Support
- Vercel: forum.vercel.com
- Supabase: supabase.com/support
- Hetzner: hcloud.hetzner.com/support

### Your Code
- All guides in repository
- README in each folder
- Comments in code
- Example configs included

---

## 🎉 You're Ready!

Everything is prepared for deployment:

✅ **Hetzner**: Automated scripts ready
✅ **Supabase**: Setup guides complete
✅ **Vercel**: Deployment guide ready
✅ **Integration**: Connection details documented
✅ **Monitoring**: All services monitored
✅ **Security**: Best practices applied

**Total setup time: ~30 minutes**
**Monthly cost: €5/month**
**Fully production-ready!** 🚀

---

## Next Steps

1. Follow Supabase guide first (5 min)
2. Deploy to Hetzner (15 min)
3. Deploy to Vercel (5 min)
4. Connect all services (5 min)
5. Test everything
6. Go live! 🎉

**All files are ready in your repository!** 📁


