# 🔧 Next Steps - Fix Schema Then Migrate

## Step 1: Check Schema on Server

Run this on your Hetzner server:
```bash
cd /var/www/immigrationai/backend
cat prisma/schema.prisma | grep "^model" | sort
```

This shows what models are in the schema.

---

## Step 2: Check What Models Exist in Database

```bash
cd /var/www/immigrationai/backend
psql -U postgres -d immigrationai -c "\dt" | grep -E "(eligibility|marketing|pending)"
```

Or use Prisma Studio:
```bash
npx prisma studio
```

---

## Step 3: The Problem

The schema.prisma on server is missing:
- `EligibilityCheck` model
- `MarketingSession` model  
- `PendingPayment` model

And might be missing `accountNumber` in User model.

---

## Step 4: Solution Options

### Option A: Copy Complete Schema from Local
If you have the complete schema locally, copy it to server.

### Option B: Add Missing Models to Server Schema
Add the missing models to the schema.prisma on server.

### Option C: Use Migration Instead of db push
Create a proper migration that preserves existing data.

---

## Step 5: Quick Fix - Check Local Schema

On your laptop, check if we have all models:
```bash
cd ~/immigration_ai/backend
grep "^model" prisma/schema.prisma | sort
```

---

**Run Step 1 on your Hetzner server first!** 🔍
