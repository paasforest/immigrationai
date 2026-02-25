# 🚀 Hetzner Server Migration Guide

## 📍 Your Server Details
- **Server**: ubuntu-4gb-fsn1-1
- **IP**: 78.46.183.41
- **Location**: Falkenstein
- **Type**: CX23

---

## 🎯 Option 1: Run Migration on Hetzner Server (Recommended)

**Best approach:** Run the migration directly on your Hetzner server where the database is.

### Step 1: SSH to Hetzner Server
```bash
ssh root@78.46.183.41
# Or if you have a user account:
ssh your-user@78.46.183.41
```

### Step 2: Navigate to Backend Directory
```bash
# Find where your backend code is deployed
cd /path/to/your/backend
# Common locations:
# - /opt/immigration_ai/backend
# - /var/www/immigration_ai/backend
# - ~/immigration_ai/backend
```

### Step 3: Pull Latest Code (if using Git)
```bash
git pull origin main
```

### Step 4: Run Migration
```bash
# The DATABASE_URL should already be in .env on the server
./run-migration.sh

# OR manually:
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
```

### Step 5: Restart Backend
```bash
pm2 restart all
# Or however you run your backend
```

---

## 🎯 Option 2: Run Migration from Local Laptop

If you want to run migration from your laptop connecting to Hetzner database:

### Step 1: Get DATABASE_URL from Hetzner Server
```bash
# SSH to server
ssh root@78.46.183.41

# Find backend directory
find / -name "backend" -type d 2>/dev/null | grep -E "(immigration|backend)"

# Check .env file
cat /path/to/backend/.env | grep DATABASE_URL
```

### Step 2: Add DATABASE_URL to Local .env
```bash
cd ~/immigration_ai/backend

# Edit .env
nano .env
# Or use the setup script:
./fix-and-setup-env.sh
```

**Add the DATABASE_URL you got from Hetzner:**
```bash
DATABASE_URL="postgresql://user:password@78.46.183.41:5432/database"
```

**⚠️ Important:** Make sure PostgreSQL on Hetzner allows remote connections!

### Step 3: Run Migration Locally
```bash
./run-migration.sh
```

---

## 🔧 Option 3: Quick Setup Script for Hetzner

I can create a deployment script that:
1. Pushes code to Hetzner
2. Runs migration
3. Restarts services

Would you like me to create this?

---

## 📝 Quick Commands Summary

### On Hetzner Server:
```bash
# 1. SSH
ssh root@78.46.183.41

# 2. Find backend
cd /path/to/backend  # Adjust path

# 3. Pull code (if Git)
git pull origin main

# 4. Run migration
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate

# 5. Restart
pm2 restart all
```

---

## 🔍 Find Your Backend on Hetzner

If you're not sure where the backend is deployed:

```bash
# SSH to server
ssh root@78.46.183.41

# Search for backend files
find / -name "package.json" 2>/dev/null | grep backend
find / -name "schema.prisma" 2>/dev/null
find / -name "app.ts" 2>/dev/null | grep backend

# Check PM2 processes
pm2 list
pm2 info <process-name>  # Shows working directory

# Check running Node processes
ps aux | grep node
```

---

## ✅ Recommended Approach

**Run migration on Hetzner server directly:**
- ✅ Database is local (faster)
- ✅ No network/firewall issues
- ✅ Production environment
- ✅ DATABASE_URL already configured

---

**Ready to connect?** SSH to `78.46.183.41` and run the migration! 🚀
