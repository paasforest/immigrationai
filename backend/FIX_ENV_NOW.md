# 🔧 Fix .env File - Quick Solution

## ⚠️ Problem
Your `.env` file is **empty** and needs `DATABASE_URL` configured.

---

## 🚀 Quick Fix (Choose One)

### Option 1: Interactive Setup (Easiest)
```bash
cd ~/immigration_ai/backend
./add-database-url.sh
```

This will ask you:
- Where is your database? (Hetzner, Local, Supabase, etc.)
- Connection details
- Then automatically add DATABASE_URL to .env

---

### Option 2: Manual Setup

**If your database is on Hetzner server:**
```bash
cd ~/immigration_ai/backend

# Edit .env file
nano .env
# Or
vim .env
```

Add this line (replace with your actual Hetzner database):
```bash
DATABASE_URL="postgresql://user:password@your-hetzner-ip:5432/immigration_ai"
```

**To get your Hetzner DATABASE_URL:**
1. SSH to your Hetzner server
2. Check the .env file there:
   ```bash
   cat /path/to/backend/.env | grep DATABASE_URL
   ```
3. Copy that exact DATABASE_URL to your local .env

---

### Option 3: Local Database (For Development)

If you want to set up a local database:

```bash
# Install PostgreSQL (if not installed)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb immigration_ai

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"

# Add to .env
echo 'DATABASE_URL="postgresql://postgres:your_password@localhost:5432/immigration_ai"' >> .env
```

---

## ✅ After Adding DATABASE_URL

1. **Verify it's set:**
   ```bash
   grep DATABASE_URL .env
   ```

2. **Run migration:**
   ```bash
   ./run-migration.sh
   ```

---

## 🆘 Still Issues?

### Fix .env file ownership (if permission denied):
```bash
sudo chown $USER:$USER .env
```

### Test database connection:
```bash
# Install psql client
sudo apt-get install postgresql-client

# Test (replace with your DATABASE_URL)
psql "postgresql://user:password@host:5432/database" -c "SELECT 1;"
```

---

**Run `./add-database-url.sh` to set it up interactively!** 🚀
