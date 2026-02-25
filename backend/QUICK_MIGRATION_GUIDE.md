# ⚡ Quick Migration Guide

## 🎯 Run This on Your Hetzner Server

The migration needs to connect to your PostgreSQL database, so run it where `DATABASE_URL` is configured.

---

## 🚀 Quick Commands

### On Your Hetzner Server:

```bash
# 1. Navigate to backend directory
cd /path/to/your/backend

# 2. Pull latest code (if using Git)
git pull origin main

# 3. Run migration
npx prisma migrate dev --name add_multi_tenant_models

# 4. Generate Prisma Client
npx prisma generate

# 5. Verify (optional)
npx prisma studio
```

---

## ✅ What the Migration Does

### Creates New Tables:
- `organizations` - Multi-tenant organizations
- `cases` - Immigration cases
- `case_documents` - File uploads (separate from AI-generated documents)
- `tasks` - Task management
- `messages` - Communication between professionals and applicants
- `document_checklists` - Case-specific checklists
- `checklist_items` - Checklist requirements
- `audit_logs` - Activity tracking

### Updates Existing Tables:
- `users` - Adds: `organization_id`, `phone`, `avatar_url`, `is_active`
- `subscriptions` - Changes: `user_id` → `organization_id`

---

## ⚠️ Important Notes

1. **If you have existing users:**
   - They'll have `organizationId: null` initially
   - They can create an organization via `POST /api/organizations`

2. **If you have existing subscriptions:**
   - You'll need a data migration to move them to organizations
   - Or they'll need to be recreated

3. **No data loss:**
   - All existing data is preserved
   - New columns are nullable
   - Existing `Document` model unchanged

---

## 🔍 Verify Migration Success

After migration, check Prisma Studio:
```bash
npx prisma studio
```

You should see all the new tables listed above.

---

## 📝 Next Steps After Migration

1. **Restart backend:**
   ```bash
   pm2 restart all
   ```

2. **Test endpoints:**
   - `POST /api/organizations` - Create organization
   - `GET /api/organizations/me` - Get organization

---

**Ready to run?** Execute on your Hetzner server! 🚀
