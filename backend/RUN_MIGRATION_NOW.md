# 🚀 Run Migration - Quick Guide

## ✅ Fixed Script

The migration script is now fixed and ready. Run it from the **backend directory**:

---

## 📍 Step 1: Navigate to Backend Directory

```bash
cd ~/immigration_ai/backend
```

---

## 📝 Step 2: Check/Set DATABASE_URL

The script needs `DATABASE_URL` in your `.env` file. Check if it exists:

```bash
# Check if DATABASE_URL is in .env
grep DATABASE_URL .env || echo "DATABASE_URL not found"
```

**If DATABASE_URL is missing**, add it to `.env`:

```bash
# Edit .env file
nano .env
# Or
vim .env
```

Add this line (replace with your actual database connection):
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Example for local PostgreSQL:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/immigration_ai
```

**Example for Hetzner/Remote:**
```bash
DATABASE_URL=postgresql://user:password@your-hetzner-ip:5432/immigration_ai
```

---

## 🚀 Step 3: Run Migration

```bash
./run-migration.sh
```

**OR if you prefer to run commands manually:**

```bash
# Load .env and run migration
export $(grep -v '^#' .env | xargs)
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
```

---

## ✅ Step 4: Verify

```bash
npx prisma studio
```

Check for these new tables:
- ✅ `organizations`
- ✅ `cases`
- ✅ `case_documents`
- ✅ `tasks`
- ✅ `messages`
- ✅ `document_checklists`
- ✅ `checklist_items`
- ✅ `audit_logs`

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL not found"
**Solution:** Add DATABASE_URL to `.env` file (see Step 2)

### Error: "Permission denied"
**Solution:** 
```bash
chmod +x run-migration.sh
```

### Error: "Connection refused"
**Solution:** 
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall/network settings

---

**Ready?** Run from `~/immigration_ai/backend` directory! 🚀
