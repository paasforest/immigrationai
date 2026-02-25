# 🚀 Run Migration on Hetzner Server

## 📍 Your Server
- **IP**: 78.46.183.41
- **Location**: Falkenstein

---

## ✅ Recommended: Run Migration on Server

**Best approach:** Run migration directly on Hetzner where database is local.

---

## 🚀 Quick Commands

### Step 1: SSH to Server
```bash
ssh root@78.46.183.41
```

### Step 2: Find Backend Directory
```bash
# Common locations:
cd /opt/immigration_ai/backend
# OR
cd /var/www/immigration_ai/backend
# OR
cd ~/immigration_ai/backend

# If not sure, search:
find / -name "schema.prisma" 2>/dev/null
```

### Step 3: Pull Latest Code
```bash
git pull origin main
```

### Step 4: Run Migration
```bash
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
```

### Step 5: Restart Backend
```bash
pm2 restart all
# OR
systemctl restart immigration-ai
# OR however you run your backend
```

---

## 🔍 Find Backend on Server

If you don't know where backend is:

```bash
# SSH to server
ssh root@78.46.183.41

# Search for backend
find / -name "package.json" 2>/dev/null | grep -E "(backend|immigration)"
find / -name "schema.prisma" 2>/dev/null

# Check PM2 processes (shows working directory)
pm2 list
pm2 describe <process-name>
```

---

## 📤 Alternative: Deploy Script

I've created `deploy-to-hetzner.sh` that:
1. Pushes code to Git
2. Pulls on Hetzner
3. Runs migration
4. Restarts backend

**Run from your laptop:**
```bash
cd ~/immigration_ai/backend
./deploy-to-hetzner.sh
```

---

## ✅ After Migration

1. **Verify tables created:**
   ```bash
   ssh root@78.46.183.41
   cd /path/to/backend
   npx prisma studio
   ```

2. **Test endpoints:**
   ```bash
   curl https://your-domain.com/api/organizations/me
   ```

---

**SSH to 78.46.183.41 and run the migration!** 🚀
