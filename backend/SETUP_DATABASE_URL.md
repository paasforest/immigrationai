# 🔧 Setup DATABASE_URL - Quick Fix

## ⚠️ Issue: DATABASE_URL Not Set

Your `.env` file doesn't have `DATABASE_URL` configured. Let's fix it!

---

## 🚀 Quick Setup (Interactive)

Run this script to set up DATABASE_URL interactively:

```bash
cd ~/immigration_ai/backend
./setup-env.sh
```

This will ask you:
- Where is your database? (Local, Hetzner, Supabase, etc.)
- Connection details (host, port, user, password, database name)

---

## 📝 Manual Setup

Or manually edit `.env` file:

```bash
cd ~/immigration_ai/backend
nano .env
# Or
vim .env
```

Add this line (replace with your actual database):

### Option 1: Local PostgreSQL
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/immigration_ai"
```

### Option 2: Hetzner Server (Remote)
```bash
DATABASE_URL="postgresql://user:password@your-hetzner-ip:5432/immigration_ai"
```

### Option 3: Supabase
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## 🔍 Find Your Database Connection

### If database is on Hetzner:
1. SSH to your Hetzner server
2. Check your backend `.env` file there:
   ```bash
   cat /path/to/backend/.env | grep DATABASE_URL
   ```
3. Copy that DATABASE_URL to your local `.env`

### If database is local:
- Default: `postgresql://postgres:password@localhost:5432/immigration_ai`
- Adjust user/password/database name as needed

---

## ✅ After Setting DATABASE_URL

1. **Verify it's set:**
   ```bash
   grep DATABASE_URL .env
   ```

2. **Run migration:**
   ```bash
   ./run-migration.sh
   ```

---

## 🆘 Still Having Issues?

### Test Database Connection:
```bash
# Install psql if needed
sudo apt-get install postgresql-client

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"
```

### Check if PostgreSQL is running (for local):
```bash
sudo systemctl status postgresql
```

---

**Run `./setup-env.sh` to configure interactively!** 🚀
