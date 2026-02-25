# 🛠️ Local Development Setup Guide

## ⚠️ IMPORTANT: Production System Status

**Your production system is LIVE and should NOT be modified from this local copy!**

### 🌐 Production URLs (DO NOT MODIFY)
- **Frontend**: https://immigrationai.co.za (Vercel - auto-deploys from Git)
- **Backend API**: https://api.immigrationai.co.za (Hetzner server)
- **Hetzner Server**: 78.46.183.41
- **Backend Path on Server**: `/var/www/immigrationai/backend`
- **Process Manager**: PM2 (`immigration-backend`)
- **Database**: Supabase (PostgreSQL)

### 🎯 This Local Copy Purpose
This is your **local development environment** for:
- Testing changes before deploying
- Developing new features
- Debugging issues
- Running locally without affecting production

---

## 🔧 Safe Local Setup (Won't Affect Production)

### Step 1: Fix Permissions (Local Only)

The `node_modules` are owned by root. Fix this locally:

```bash
cd /home/immigrant/immigration_ai

# Fix frontend permissions
sudo chown -R $USER:$USER node_modules

# Fix backend permissions  
sudo chown -R $USER:$USER backend/node_modules
```

### Step 2: Install/Update Dependencies (Local Only)

```bash
# Frontend dependencies
cd /home/immigrant/immigration_ai
npm install

# Backend dependencies
cd /home/immigrant/immigration_ai/backend
npm install

# Generate Prisma client (for local database if needed)
npx prisma generate
```

### Step 3: Configure Local Environment

#### Frontend `.env.local` (For Local Development)

Create/update `.env.local` in the root directory:

```env
# Point to PRODUCTION API (default - safe for testing)
NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za

# OR point to LOCAL backend (if running local backend)
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional: Google Analytics (use test ID for local)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Stripe (use test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Note**: By default, point to production API so you can test against real data. Only change to `localhost:4000` if you're running a local backend.

#### Backend `.env` (For Local Backend - Optional)

Only needed if you want to run a local backend. Create `backend/.env`:

```env
# Local Development Settings
NODE_ENV=development
PORT=4000

# Database - Use a LOCAL database or separate Supabase project for testing
# DO NOT use production database!
DATABASE_URL=postgresql://user:password@localhost:5432/immigration_ai_dev

# JWT Secrets (generate new ones for local dev)
JWT_SECRET=local_dev_jwt_secret_minimum_32_characters_long
REFRESH_TOKEN_SECRET=local_dev_refresh_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI (use your key - safe for local)
OPENAI_API_KEY=sk-your-openai-key

# Frontend URL (local)
FRONTEND_URL=http://localhost:3000

# Optional: Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
```

**⚠️ CRITICAL**: Never use production database credentials in local `.env`!

---

## 🚀 Running Locally

### Option 1: Frontend Only (Connects to Production API)

This is the safest option - just run the frontend locally:

```bash
cd /home/immigrant/immigration_ai
npm run dev
```

Frontend will run on `http://localhost:3000` and connect to production API.

### Option 2: Full Local Stack (Frontend + Backend)

Only if you need to test backend changes:

```bash
# Terminal 1: Backend
cd /home/immigrant/immigration_ai/backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Frontend
cd /home/immigrant/immigration_ai
npm run dev
# Runs on http://localhost:3000
# Make sure .env.local has NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 📋 Development Workflow

### Making Changes Safely

1. **Make changes locally** in this directory
2. **Test locally** with `npm run dev`
3. **Commit to Git** when ready
4. **Push to repository** - Vercel will auto-deploy frontend
5. **Deploy backend manually** to Hetzner (see deployment section)

### Deploying to Production

#### Frontend (Auto-deploys via Vercel)
- Just push to Git - Vercel handles the rest
- Environment variables are set in Vercel dashboard

#### Backend (Manual deployment to Hetzner)

```bash
# 1. SSH into Hetzner server
ssh root@78.46.183.41

# 2. Navigate to backend
cd /var/www/immigrationai/backend

# 3. Pull latest changes (if using Git)
git pull origin main

# OR manually upload files:
# scp backend/src/path/to/file.ts root@78.46.183.41:/var/www/immigrationai/backend/src/path/to/

# 4. Install dependencies (if needed)
npm install

# 5. Build
npm run build

# 6. Restart PM2
pm2 restart immigration-backend

# 7. Check status
pm2 status
pm2 logs immigration-backend
```

---

## 🔍 Verifying Setup

### Check Local Frontend
```bash
# Start frontend
cd /home/immigrant/immigration_ai
npm run dev

# Visit http://localhost:3000
# Should load and connect to production API
```

### Check Production Backend
```bash
# Health check
curl https://api.immigrationai.co.za/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Check Production Frontend
```bash
# Visit https://immigrationai.co.za
# Should be live and working
```

---

## 🐛 Troubleshooting

### Permission Errors
```bash
sudo chown -R $USER:$USER node_modules backend/node_modules
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### Can't Connect to Production API
- Check internet connection
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check if production backend is up: `curl https://api.immigrationai.co.za/health`

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Key Files Reference

### Production Configuration
- **Hetzner Backend**: `/var/www/immigrationai/backend` on server `78.46.183.41`
- **Vercel Frontend**: Auto-deploys from Git
- **Domain**: `immigrationai.co.za` (frontend), `api.immigrationai.co.za` (backend)

### Local Configuration
- **Frontend Config**: `.env.local` (root directory)
- **Backend Config**: `backend/.env` (only if running local backend)
- **API Client**: `lib/api/client.ts` (uses `NEXT_PUBLIC_API_URL`)

### Documentation
- `HETZNER_DEPLOYMENT_SUCCESS.md` - Production deployment info
- `PRODUCTION_ARCHITECTURE.md` - System architecture
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `START_HERE.md` - Original setup guide

---

## ✅ Quick Checklist

- [ ] Fixed permissions on `node_modules`
- [ ] Installed frontend dependencies (`npm install`)
- [ ] Installed backend dependencies (`cd backend && npm install`)
- [ ] Created `.env.local` with `NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za`
- [ ] Can run frontend locally (`npm run dev`)
- [ ] Frontend connects to production API
- [ ] Production system still running (verified via health check)

---

## 🎯 Next Steps

1. **Fix permissions** (Step 1 above)
2. **Install dependencies** (Step 2 above)
3. **Configure `.env.local`** to point to production API
4. **Test locally** with `npm run dev`
5. **Make changes** and test before deploying

**Remember**: This local copy is for development only. Production is on Hetzner/Vercel and should not be modified directly from here!
