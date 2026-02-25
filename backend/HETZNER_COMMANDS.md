# 🚀 Run These Commands on Your Hetzner Server

## Your Backend Location
`/var/www/immigrationai/backend`

---

## Step-by-Step Commands

### Step 1: Navigate to Backend
```bash
cd /var/www/immigrationai/backend
```

### Step 2: Pull Latest Code (if using Git)
```bash
git pull origin main
```

### Step 3: Run Migration
```bash
npx prisma migrate dev --name add_multi_tenant_models
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Restart Backend
```bash
pm2 restart all
```

---

## ✅ All in One (Copy & Paste)

```bash
cd /var/www/immigrationai/backend && \
git pull origin main && \
npx prisma migrate dev --name add_multi_tenant_models && \
npx prisma generate && \
pm2 restart all
```

---

## 🔍 Verify Migration

After running, check if tables were created:
```bash
cd /var/www/immigrationai/backend
npx prisma studio
```

You should see these new tables:
- ✅ organizations
- ✅ cases
- ✅ case_documents
- ✅ tasks
- ✅ messages
- ✅ document_checklists
- ✅ checklist_items
- ✅ audit_logs

---

**Run the commands above on your Hetzner server!** 🚀
