# 📋 Assign Users to Marketing Test Plan

## Quick Usage

### List All Users
```bash
cd /home/immigrant/immigration_ai/backend
node assign-marketing-test.js
```

### Assign Specific User
```bash
node assign-marketing-test.js user@example.com
```

### Assign All Users
```bash
node assign-marketing-test.js --all
```

### List Marketing Test Users
```bash
node assign-marketing-test.js --list
```

---

## Examples

### Example 1: Check Current Users
```bash
cd /home/immigrant/immigration_ai/backend
node assign-marketing-test.js
```

### Example 2: Assign One User
```bash
node assign-marketing-test.js testuser@example.com
```

### Example 3: Assign Multiple Users (one by one)
```bash
node assign-marketing-test.js user1@example.com
node assign-marketing-test.js user2@example.com
node assign-marketing-test.js user3@example.com
```

### Example 4: Assign All Users
```bash
node assign-marketing-test.js --all
```

### Example 5: Verify Assignment
```bash
node assign-marketing-test.js --list
```

---

## What It Does

1. **Connects to database** using Prisma
2. **Updates user's subscription plan** to `marketing_test`
3. **Sets subscription status** to `active`
4. **Shows confirmation** with updated user details

---

## Requirements

- Database connection configured in `backend/.env`
- `DATABASE_URL` must be set
- Prisma client must be generated (`npx prisma generate`)

---

## Alternative: Direct SQL (if script doesn't work)

If you have direct database access, you can run SQL:

```sql
-- Assign specific user
UPDATE users 
SET subscription_plan = 'marketing_test', 
    subscription_status = 'active'
WHERE email = 'user@example.com';

-- Assign all users
UPDATE users 
SET subscription_plan = 'marketing_test', 
    subscription_status = 'active';

-- Check marketing_test users
SELECT email, full_name, subscription_plan, subscription_status, created_at
FROM users 
WHERE subscription_plan = 'marketing_test'
ORDER BY created_at DESC;
```

---

**Run the script to assign users!** 🚀
