# ⚠️ Migration Warnings Explained

## ✅ Safe Changes (Type Casting)

These are **SAFE** - PostgreSQL will automatically convert:
- `session_id`: Text → VarChar(100) ✅
- `landing_page`: Text → VarChar(500) ✅
- `ip_address`: Text → VarChar(45) ✅

**No data loss** - just changing storage type.

---

## ⚠️ Potential Issues (Unique Constraints)

These might fail if you have duplicate values:

1. **`marketing_sessions.session_id` unique constraint**
   - Will fail if there are duplicate `session_id` values
   - Need to clean up duplicates first

2. **`subscriptions.organization_id` unique constraint**
   - Will fail if there are duplicate `organization_id` values
   - Need to clean up duplicates first

---

## 🚀 What to Do

### Answer "y" to proceed

The type changes are safe. If unique constraints fail, we'll fix duplicates.

**Type:**
```
y
```

**Press Enter**

---

## 🔧 If It Fails on Unique Constraints

We'll need to clean up duplicates first:

```bash
# Check for duplicates in marketing_sessions
psql -U postgres -d immigrationai -c "SELECT session_id, COUNT(*) FROM marketing_sessions GROUP BY session_id HAVING COUNT(*) > 1;"

# Check for duplicates in subscriptions
psql -U postgres -d immigrationai -c "SELECT organization_id, COUNT(*) FROM subscriptions GROUP BY organization_id HAVING COUNT(*) > 1;"
```

Then remove duplicates before retrying.

---

**Answer "y" and proceed!** ✅
