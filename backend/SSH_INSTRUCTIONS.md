# 📋 Step-by-Step Instructions (You're on Hetzner Now)

## Step 1: Navigate to Backend Directory

```bash
cd /var/www/immigrationai/backend
```

---

## Step 2: Backup Current Schema (Safety First)

```bash
cp prisma/schema.prisma prisma/schema.prisma.backup
```

---

## Step 3: Open Schema File for Editing

```bash
nano prisma/schema.prisma
```

---

## Step 4: Replace Entire Content

1. **Select all:** Press `Ctrl+A` (selects all text)
2. **Delete:** Press `Delete` or `Backspace`
3. **Get the fixed schema from your laptop:**
   - Open a NEW terminal on your laptop
   - Run: `cat ~/immigration_ai/backend/prisma/schema.prisma`
   - Copy the ENTIRE output
4. **Paste into nano:** Right-click or `Shift+Insert`
5. **Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Run Migration

```bash
npx prisma db push
npx prisma generate
pm2 restart all
```

---

## ✅ Quick Alternative: Get Schema from Laptop

**On your laptop (in a NEW terminal):**
```bash
cd ~/immigration_ai/backend
cat prisma/schema.prisma | ssh root@78.46.183.41 "cd /var/www/immigrationai/backend && cat > prisma/schema.prisma"
```

**Then on Hetzner:**
```bash
npx prisma db push
npx prisma generate
pm2 restart all
```

---

**Run these commands on Hetzner now!** 🚀
