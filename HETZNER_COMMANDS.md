# 🖥️ Commands to Run on Hetzner Server

You're now logged into Hetzner. Run these commands:

## Step 1: Navigate to Backend Directory

```bash
cd /var/www/immigrationai/backend
```

## Step 2: Upload the Script (from your local machine)

**On your local machine, run:**
```bash
cd /home/immigrant/immigration_ai/backend
scp assign-marketing-test.js root@78.46.183.41:/var/www/immigrationai/backend/
```

## Step 3: Run the Script on Hetzner

**On Hetzner server, run:**

### List All Users
```bash
cd /var/www/immigrationai/backend
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

## Alternative: Direct SQL (If Script Not Available)

If the script isn't uploaded yet, you can use direct SQL:

```bash
cd /var/www/immigrationai/backend

# Connect to database using Prisma Studio or direct SQL
# Or use psql if you have the connection string

# Example with psql (if DATABASE_URL is in .env):
source .env
psql $DATABASE_URL -c "UPDATE users SET subscription_plan = 'marketing_test', subscription_status = 'active' WHERE email = 'user@example.com';"
```

---

## Quick SQL Commands

If you have direct database access:

```sql
-- List all users
SELECT email, full_name, subscription_plan, subscription_status 
FROM users 
ORDER BY created_at DESC;

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
SELECT email, full_name, subscription_plan, subscription_status
FROM users 
WHERE subscription_plan = 'marketing_test';
```

---

**You're on the server now - run the commands above!** 🚀
