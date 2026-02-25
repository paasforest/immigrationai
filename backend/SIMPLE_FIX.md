# 🔧 SIMPLE FIX - Step by Step

## What We Need to Do
Add DATABASE_URL to your local `.env` file so we can run the migration.

---

## Option 1: Get DATABASE_URL from Hetzner (Easiest)

### Step 1: SSH to Your Hetzner Server
```bash
ssh root@78.46.183.41
```

### Step 2: Find and Copy DATABASE_URL
```bash
# Find backend directory
find / -name ".env" -path "*/backend/.env" 2>/dev/null

# OR check common locations:
cat /opt/immigration_ai/backend/.env | grep DATABASE_URL
# OR
cat /var/www/immigration_ai/backend/.env | grep DATABASE_URL
# OR
cat ~/immigration_ai/backend/.env | grep DATABASE_URL
```

**Copy the DATABASE_URL line** - it looks like:
```
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### Step 3: Add to Your Local .env
```bash
# On your laptop
cd ~/immigration_ai/backend

# Edit .env file
nano .env
# OR
vim .env
```

**Paste the DATABASE_URL line you copied from Hetzner**

### Step 4: Run Migration
```bash
./run-migration.sh
```

---

## Option 2: Run Migration on Hetzner Directly (Best)

### Step 1: SSH to Server
```bash
ssh root@78.46.183.41
```

### Step 2: Find Backend
```bash
# Try these locations:
cd /opt/immigration_ai/backend
# OR
cd /var/www/immigration_ai/backend
# OR
cd ~/immigration_ai/backend

# If not found, search:
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
```

---

## What I Need From You

**Just tell me:**
1. Can you SSH to `78.46.183.41`? (yes/no)
2. Where is your backend code on Hetzner? (path)
3. Do you want to run migration on Hetzner or from your laptop?

**OR just run this on Hetzner:**
```bash
ssh root@78.46.183.41
find / -name "schema.prisma" 2>/dev/null
cd /path/that/returns
git pull origin main
npx prisma migrate dev --name add_multi_tenant_models
pm2 restart all
```

---

**Which option do you prefer?** 🚀
