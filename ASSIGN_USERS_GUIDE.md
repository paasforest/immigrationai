# 📋 Assign Users to Marketing Test Plan

## 🚀 Quick Method (Recommended)

I've created a script that runs on Hetzner where the database is accessible.

### Step 1: Upload and Run Script on Hetzner

```bash
cd /home/immigrant/immigration_ai/backend
./assign-marketing-test-hetzner.sh
```

This will:
1. Upload the script to Hetzner
2. List all users in the database
3. Show you who can be assigned

### Step 2: Assign Users

**Assign specific user:**
```bash
./assign-marketing-test-hetzner.sh user@example.com
```

**Assign all users:**
```bash
./assign-marketing-test-hetzner.sh --all
```

**List marketing_test users:**
```bash
./assign-marketing-test-hetzner.sh --list
```

---

## 🔧 Alternative: Run Directly on Hetzner

SSH into Hetzner and run the script there:

```bash
# SSH into Hetzner
ssh root@78.46.183.41

# Navigate to backend
cd /var/www/immigrationai/backend

# Upload the script first (from your local machine)
# scp backend/assign-marketing-test.js root@78.46.183.41:/var/www/immigrationai/backend/

# Then run on Hetzner:
node assign-marketing-test.js                    # List all users
node assign-marketing-test.js user@example.com   # Assign specific user
node assign-marketing-test.js --all              # Assign all users
node assign-marketing-test.js --list             # List marketing_test users
```

---

## 📝 Direct SQL Method (If You Have Database Access)

If you have direct access to your Supabase/PostgreSQL database:

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

-- List all users
SELECT email, full_name, subscription_plan, subscription_status
FROM users 
ORDER BY created_at DESC;
```

---

## 🎯 Recommended Approach

1. **First, see who's in the database:**
   ```bash
   ./assign-marketing-test-hetzner.sh
   ```

2. **Then assign specific users:**
   ```bash
   ./assign-marketing-test-hetzner.sh user1@example.com
   ./assign-marketing-test-hetzner.sh user2@example.com
   ```

3. **Or assign all:**
   ```bash
   ./assign-marketing-test-hetzner.sh --all
   ```

4. **Verify assignment:**
   ```bash
   ./assign-marketing-test-hetzner.sh --list
   ```

---

**Run `./assign-marketing-test-hetzner.sh` to get started!** 🚀
