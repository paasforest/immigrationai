# 🚀 Migration Instructions

## ⚠️ Important: Run on Hetzner Server

The migration needs to connect to your PostgreSQL database, so it must be run on your **Hetzner server** where `DATABASE_URL` is configured.

---

## Option 1: Run on Hetzner Server (Recommended)

### Step 1: SSH to your Hetzner server
```bash
ssh your-user@your-hetzner-server
```

### Step 2: Navigate to your backend directory
```bash
cd /path/to/your/backend
# Or wherever your backend code is deployed
```

### Step 3: Pull latest changes (if using Git)
```bash
git pull origin main
```

### Step 4: Run the migration script
```bash
./run-migration.sh
```

**OR manually:**
```bash
# Make sure DATABASE_URL is set in .env or environment
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
```

### Step 5: Verify migration
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

## Option 2: Run Locally (If DATABASE_URL points to Hetzner DB)

If your local `.env` has `DATABASE_URL` pointing to your Hetzner database:

```bash
cd backend
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
```

---

## ⚠️ Migration Warnings

### 1. **Subscription Model Change**
The `Subscription` model changed from `userId` to `organizationId`.

**If you have existing subscriptions:**
- You'll need a data migration script to:
  1. Create "personal" organizations for existing users
  2. Move subscriptions from `userId` to `organizationId`

**If you have NO users (clean database):**
- Migration will run cleanly ✅

### 2. **User Model Updates**
New columns added:
- `organization_id` (nullable - existing users will be NULL)
- `phone` (nullable)
- `avatar_url` (nullable)
- `is_active` (defaults to true)

**Existing users:** Will have `organizationId: null` until they create an organization.

---

## ✅ After Migration

1. **Restart your backend server:**
   ```bash
   pm2 restart all
   # Or however you run your server
   ```

2. **Test the endpoints:**
   ```bash
   # Create organization
   POST /api/organizations
   
   # Get organization
   GET /api/organizations/me
   ```

---

## 📝 Migration File Location

After running, you'll find the migration SQL in:
```
backend/prisma/migrations/[timestamp]_add_multi_tenant_models/migration.sql
```

**Review this file** to see exactly what changes will be made to your database.

---

## 🆘 Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
**Solution:** Set DATABASE_URL in your `.env` file or export it:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Error: "Migration failed"
**Solution:** 
1. Check database connection
2. Review migration SQL file
3. Check for existing data conflicts
4. If needed, rollback: `npx prisma migrate resolve --rolled-back [migration_name]`

### Error: "Relation already exists"
**Solution:** Some tables might already exist. Check your database schema first.

---

**Ready to migrate?** Run on your Hetzner server! 🚀
