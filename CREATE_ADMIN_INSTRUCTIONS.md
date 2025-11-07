# How to Create an Admin User for Immigration AI

This guide shows you how to create an admin user account to monitor ProConnectSA traffic and manage the platform.

---

## 🚀 Quick Start (Recommended)

### Option 1: Auto-Generate Credentials (Easiest)

SSH into your Hetzner server and run:

```bash
cd /path/to/immigration_ai/backend
node create-admin-user.js
```

This will:
- ✅ Automatically generate a secure password
- ✅ Create admin user: `admin@immigrationai.co.za`
- ✅ Display the credentials
- ✅ Show you the login URLs

**The credentials will be displayed on screen. Save them immediately!**

---

### Option 2: Custom Email and Password

If you want to use your own email and password:

```bash
cd /path/to/immigration_ai/backend
node create-admin-user.js your@email.com YourPassword123
```

Replace:
- `your@email.com` - Your email address
- `YourPassword123` - Your chosen password (minimum 8 characters)

---

## 📋 Step-by-Step Instructions

### Step 1: SSH into Hetzner Server

```bash
ssh your-username@your-server-ip
```

### Step 2: Navigate to Backend Directory

```bash
cd /path/to/immigration_ai/backend
```

If you're not sure where it is, try:
```bash
cd ~/immigration_ai/backend
# or
cd /var/www/immigration_ai/backend
# or
find ~ -name "immigration_ai" -type d
```

### Step 3: Run the Script

**Quick mode (auto-generates everything):**
```bash
node create-admin-user.js
```

**Custom credentials:**
```bash
node create-admin-user.js admin@example.com MySecurePassword123
```

### Step 4: Save the Credentials

The script will display something like this:

```
╔══════════════════════════════════════════════════════════════════════╗
║                      NEW ADMIN USER CREATED                          ║
╚══════════════════════════════════════════════════════════════════════╝

👤 Name:     Immigration AI Admin
📧 Email:    admin@immigrationai.co.za
🔑 Password: abc123xyz789
👑 Role:     admin
💎 Plan:     enterprise
✨ Status:   active
```

**⚠️ IMPORTANT:** Copy these credentials immediately and store them securely!

### Step 5: Login to Admin Dashboard

1. Go to: https://www.immigrationai.co.za/auth/login
2. Enter your admin email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Step 6: Access Admin Features

Once logged in, you can access:

- **Admin Dashboard**: https://www.immigrationai.co.za/admin
- **UTM Analytics**: https://www.immigrationai.co.za/admin/utm-analytics
- **Payment Verification**: https://www.immigrationai.co.za/admin/payments

---

## 🎯 What You Can Do as Admin

### 1. Monitor ProConnectSA Traffic

Go to: **Admin → UTM Analytics**

You'll see:
- ✅ Total signups from ProConnectSA
- ✅ Traffic sources breakdown
- ✅ Campaign performance
- ✅ Conversion rates
- ✅ Last activity timestamps

### 2. Track All Marketing Campaigns

See attribution for:
- ProConnectSA referrals
- Direct traffic
- Social media campaigns
- Email campaigns
- Any other UTM-tagged sources

### 3. Verify Payments

Go to: **Admin → Payments**

- Approve or reject pending payments
- View payment history
- Manage user subscriptions

### 4. View User Analytics

- See all registered users
- Track subscription plans
- Monitor platform usage
- View conversion funnels

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

**Problem:** The script can't connect to PostgreSQL.

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in .env file:
   ```bash
   cd /path/to/immigration_ai/backend
   cat .env | grep DATABASE_URL
   ```

3. Make sure the format is correct:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/immigration_ai"
   ```

---

### Error: "This email is already in use"

**Problem:** A user with this email already exists.

**Solution 1 - Update existing user to admin:**
```bash
node create-admin-user.js existing@email.com NewPassword123
```
This will make the existing user an admin.

**Solution 2 - Use different email:**
```bash
node create-admin-user.js different@email.com MyPassword123
```

**Solution 3 - Make existing user admin via SQL:**
```bash
# Connect to database
psql -d immigration_ai

# Run this SQL
UPDATE users SET role = 'admin', subscription_plan = 'enterprise', subscription_status = 'active' WHERE email = 'your@email.com';

# Exit
\q
```

---

### Error: "Password must be at least 8 characters"

**Problem:** Password is too short.

**Solution:**
Use a password with at least 8 characters:
```bash
node create-admin-user.js admin@example.com LongerPassword123
```

---

### Error: "Module not found: bcryptjs"

**Problem:** Missing dependencies.

**Solution:**
```bash
cd /path/to/immigration_ai/backend
npm install
```

---

### Can't Login to Admin Dashboard

**Problem:** Created admin user but getting "Access Denied".

**Solution:**

1. **Verify user is admin in database:**
   ```bash
   psql -d immigration_ai -c "SELECT email, role, subscription_plan FROM users WHERE email = 'your@email.com';"
   ```
   
   Should show:
   - role: `admin`
   - subscription_plan: `enterprise`

2. **If role is not 'admin', fix it:**
   ```bash
   psql -d immigration_ai -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
   ```

3. **Clear browser cache and try again:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or try in incognito mode

---

## 🔐 Security Best Practices

### After Creating Admin Account:

1. **Change the password** after first login
2. **Use a strong password** (mix of letters, numbers, symbols)
3. **Don't share** admin credentials
4. **Store credentials** in a password manager
5. **Enable 2FA** (if available)

### Recommended Password Format:

Good passwords:
- `MySecure#Pass2024!`
- `Immigration@Admin$123`
- `ProConnect#Track2024!`

Avoid:
- ❌ `password123`
- ❌ `admin`
- ❌ `12345678`

---

## 📊 Verifying Admin Access

### Test 1: Check Database

```bash
psql -d immigration_ai -c "SELECT id, email, role, subscription_plan FROM users WHERE role = 'admin';"
```

Should show your admin user.

### Test 2: Login to Dashboard

1. Go to: https://www.immigrationai.co.za/auth/login
2. Enter admin credentials
3. Should redirect to dashboard

### Test 3: Access Admin Pages

Try these URLs (after logging in):
- https://www.immigrationai.co.za/admin
- https://www.immigrationai.co.za/admin/utm-analytics
- https://www.immigrationai.co.za/admin/payments

All should load without "Access Denied" errors.

---

## 🎓 Quick Reference

### Create Admin (Quick Mode)
```bash
cd /path/to/immigration_ai/backend
node create-admin-user.js
```

### Create Admin (Custom)
```bash
cd /path/to/immigration_ai/backend
node create-admin-user.js your@email.com YourPassword123
```

### Make Existing User Admin (SQL)
```sql
UPDATE users 
SET role = 'admin', 
    subscription_plan = 'enterprise', 
    subscription_status = 'active' 
WHERE email = 'existing@email.com';
```

### Check Admin Users (SQL)
```sql
SELECT email, role, subscription_plan, created_at 
FROM users 
WHERE role = 'admin';
```

### Admin URLs
- Login: https://www.immigrationai.co.za/auth/login
- Dashboard: https://www.immigrationai.co.za/admin
- UTM Analytics: https://www.immigrationai.co.za/admin/utm-analytics
- Payments: https://www.immigrationai.co.za/admin/payments

---

## 📞 Need Help?

If you encounter issues:

1. **Check backend logs:**
   ```bash
   pm2 logs backend
   # or
   tail -f /path/to/immigration_ai/backend/backend.log
   ```

2. **Verify database connection:**
   ```bash
   cd /path/to/immigration_ai/backend
   node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.count().then(c => console.log('Connected! Users:', c)).catch(e => console.error('Error:', e));"
   ```

3. **Check if backend is running:**
   ```bash
   pm2 status
   # or
   curl http://localhost:4000/api/health
   ```

---

## ✅ Success Checklist

- [ ] SSH'd into Hetzner server
- [ ] Navigated to backend directory
- [ ] Ran create-admin-user.js script
- [ ] Saved admin credentials securely
- [ ] Successfully logged into admin dashboard
- [ ] Can access /admin/utm-analytics page
- [ ] Can see ProConnectSA tracking section
- [ ] Ready to monitor traffic!

---

**You're all set!** 🎉

Log in to your admin account and start monitoring ProConnectSA traffic and conversions.



