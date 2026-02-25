# 📋 Copy Fixed Schema to Hetzner

## ✅ What I Fixed

I added the missing models to `schema.prisma`:
- ✅ `EligibilityCheck` model
- ✅ `MarketingSession` model
- ✅ `PendingPayment` model
- ✅ `accountNumber` already exists in User model

---

## 🚀 Next Steps

### Option 1: Copy Schema File to Hetzner (Recommended)

**On your laptop:**
```bash
# Make sure you're in the backend directory
cd ~/immigration_ai/backend

# Copy schema to Hetzner
scp prisma/schema.prisma root@78.46.183.41:/var/www/immigrationai/backend/prisma/schema.prisma
```

**Then on Hetzner:**
```bash
cd /var/www/immigrationai/backend
npx prisma db push
npx prisma generate
pm2 restart all
```

---

### Option 2: Manual Copy

1. **On your laptop**, open:
   ```bash
   nano ~/immigration_ai/backend/prisma/schema.prisma
   ```

2. **Copy the entire file content**

3. **On Hetzner server**, edit:
   ```bash
   ssh root@78.46.183.41
   cd /var/www/immigrationai/backend
   nano prisma/schema.prisma
   ```

4. **Paste the complete schema**

5. **Save and run:**
   ```bash
   npx prisma db push
   npx prisma generate
   pm2 restart all
   ```

---

## ✅ After Copying

Run on Hetzner:
```bash
cd /var/www/immigrationai/backend
npx prisma db push
npx prisma generate
pm2 restart all
```

This will now work safely - no data loss! ✅

---

**Copy the schema file to Hetzner, then run `npx prisma db push`!** 🚀
