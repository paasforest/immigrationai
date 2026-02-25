# 📋 What I Need From You

## 🎯 Simple Answer

**I need ONE of these:**

### Option A: Run Migration on Hetzner (Recommended)
Just SSH to your server and run:
```bash
ssh root@78.46.183.41
find / -name "schema.prisma" 2>/dev/null
cd /path/that/returns
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
pm2 restart all
```

**That's it!** ✅

---

### Option B: Get DATABASE_URL from Hetzner

1. **SSH to Hetzner:**
   ```bash
   ssh root@78.46.183.41
   ```

2. **Find DATABASE_URL:**
   ```bash
   find / -name ".env" -path "*/backend/.env" 2>/dev/null | xargs grep DATABASE_URL
   ```

3. **Copy the DATABASE_URL line** and paste it here or add to your local `.env`

4. **Then run:**
   ```bash
   cd ~/immigration_ai/backend
   ./run-migration.sh
   ```

---

## 🤔 Which Do You Prefer?

**A)** Run on Hetzner (easiest - just SSH and run commands)  
**B)** Get DATABASE_URL and run locally

---

## 🚀 Or Use Automated Script

I created `ONE_COMMAND_FIX.sh` - it does everything automatically:

```bash
cd ~/immigration_ai/backend
./ONE_COMMAND_FIX.sh
```

**This will:**
- Find backend on Hetzner
- Pull latest code
- Run migration
- Restart backend

---

**Just tell me which option you want!** 🎯
