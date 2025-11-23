# 🚀 Deploy Backend to Hetzner - Quick Guide

## 📋 What We're Deploying

Backend changes for Document Checklist Generator:
- ✅ Force refresh option (`refresh=true` parameter)
- ✅ Last updated timestamp tracking
- ✅ Enhanced AI prompt for current information

---

## 🔧 Deployment Steps

### Option 1: Using SSH (Recommended)

**Step 1: SSH into your Hetzner server**
```bash
ssh root@YOUR_HETZNER_IP
# Or if you use a different user:
ssh YOUR_USER@YOUR_HETZNER_IP
```

**Step 2: Navigate to backend directory**
```bash
cd /opt/immigration_ai/backend
# OR if your code is in a different location:
cd ~/immigration_ai/backend
```

**Step 3: Pull latest code**
```bash
git pull origin main
```

**Step 4: Run deployment script**
```bash
./deploy.sh
```

**Step 5: Verify deployment**
```bash
pm2 status
pm2 logs immigration-backend --lines 50
```

---

### Option 2: Manual Deployment (If deploy.sh doesn't work)

```bash
# SSH into server
ssh root@YOUR_HETZNER_IP

# Navigate to backend
cd /opt/immigration_ai/backend

# Pull latest code
git pull origin main

# Install dependencies (if new packages added)
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

# Restart PM2
pm2 restart immigration-backend

# Check status
pm2 status
```

---

## 🔍 Troubleshooting

### If git pull fails:
```bash
# Check if you're in the right directory
pwd
# Should show: /opt/immigration_ai/backend

# Check git remote
git remote -v
# Should show your GitHub repo

# If not, check where your code is:
find /opt -name "immigration_ai" -type d 2>/dev/null
find /home -name "immigration_ai" -type d 2>/dev/null
```

### If PM2 process not found:
```bash
# List all PM2 processes
pm2 list

# If immigration-backend doesn't exist, start it:
pm2 start dist/app.js --name immigration-backend
pm2 save
```

### If build fails:
```bash
# Check Node version
node --version
# Should be 18+ or 20

# Check if dependencies are installed
ls node_modules

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

### If backend doesn't start:
```bash
# Check logs
pm2 logs immigration-backend --lines 100

# Check if port is in use
netstat -tulpn | grep 4000
# Or
lsof -i :4000

# Check .env file exists
ls -la .env
```

---

## ✅ Verification

After deployment, verify it's working:

1. **Check PM2 status:**
   ```bash
   pm2 status
   ```
   Should show `immigration-backend` as `online`

2. **Check logs:**
   ```bash
   pm2 logs immigration-backend --lines 20
   ```
   Should show no errors

3. **Test API endpoint:**
   ```bash
   curl http://localhost:4000/api/health
   # Or if you have domain:
   curl https://api.yourdomain.com/api/health
   ```

4. **Test checklist endpoint:**
   ```bash
   curl "http://localhost:4000/api/checklists?country=canada&visa_type=study_permit"
   ```

---

## 📝 Quick Command Reference

```bash
# Full deployment (one command after SSH)
cd /opt/immigration_ai/backend && git pull origin main && ./deploy.sh

# Just restart (if no code changes, just env changes)
pm2 restart immigration-backend

# View logs in real-time
pm2 logs immigration-backend

# Stop backend
pm2 stop immigration-backend

# Start backend
pm2 start immigration-backend

# Delete and recreate
pm2 delete immigration-backend
pm2 start dist/app.js --name immigration-backend
pm2 save
```

---

## 🆘 Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs immigration-backend`
2. Check if .env file exists and has correct values
3. Verify database connection is working
4. Check if port 4000 is available

---

**Ready to deploy? Run the commands above on your Hetzner server!**

