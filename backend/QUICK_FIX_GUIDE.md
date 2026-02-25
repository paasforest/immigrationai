# ⚡ Quick Fix Guide - Different Laptop Setup

## 🎯 Problem
- You're on a **different laptop** (not Hetzner server)
- `.env` file is **empty** (no DATABASE_URL)
- Need to configure database connection

---

## 🚀 Solution: Run This Script

```bash
cd ~/immigration_ai/backend
./fix-and-setup-env.sh
```

This script will:
1. ✅ Fix .env file ownership (if needed)
2. ✅ Ask where your database is (Hetzner, Local, Supabase)
3. ✅ Ask for connection details
4. ✅ Add DATABASE_URL to .env automatically

---

## 📍 Option 1: Connect to Hetzner Database (Recommended)

If your database is on Hetzner server:

1. **Get DATABASE_URL from Hetzner:**
   ```bash
   # SSH to your Hetzner server
   ssh user@your-hetzner-ip
   
   # Check DATABASE_URL
   cat /path/to/backend/.env | grep DATABASE_URL
   ```

2. **Copy that DATABASE_URL** to your local `.env` file

3. **Or use the script:**
   ```bash
   ./fix-and-setup-env.sh
   # Choose option 1 (Hetzner Server)
   # Enter the connection details
   ```

---

## 📍 Option 2: Set Up Local Database (For Development)

If you want a local database for development:

```bash
# 1. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres createdb immigration_ai

# 3. Set password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"

# 4. Run setup script
./fix-and-setup-env.sh
# Choose option 2 (Local PostgreSQL)
# Enter: localhost, 5432, immigration_ai, postgres, your_password
```

---

## 📍 Option 3: Use Supabase (Cloud Database)

1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings > Database
4. Run:
   ```bash
   ./fix-and-setup-env.sh
   # Choose option 3 (Supabase)
   # Paste connection string
   ```

---

## ✅ After Setup

1. **Verify DATABASE_URL is set:**
   ```bash
   grep DATABASE_URL .env
   ```

2. **Run migration:**
   ```bash
   ./run-migration.sh
   ```

---

## 🆘 Troubleshooting

### Permission Denied on .env
```bash
# Fix ownership
sudo chown $USER:$USER .env

# Or manually edit
nano .env
# Add: DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Can't Connect to Hetzner Database
- Check if PostgreSQL allows remote connections
- Check firewall rules
- Verify DATABASE_URL is correct

### Local Database Not Working
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if needed
sudo systemctl start postgresql
```

---

**Run `./fix-and-setup-env.sh` to get started!** 🚀
