# Admin User Setup & Verification Guide

## 🚀 Quick Start - Run on Hetzner Server

### Step 1: SSH into Your Hetzner Server

```bash
ssh your-username@your-hetzner-ip
```

### Step 2: Navigate to Project Directory

```bash
cd /path/to/immigration_ai
# Common locations:
# cd ~/immigration_ai
# cd /var/www/immigration_ai
# cd /opt/immigration_ai
```

### Step 3A: Quick Method (Recommended)

Just run the backend admin creation script directly:

```bash
cd backend
node create-admin-user.js
```

This will:
- ✅ Create admin user: `admin@immigrationai.co.za`
- ✅ Auto-generate a secure password
- ✅ Show you the credentials
- ✅ Display all admin URLs

**⚠️ SAVE THE CREDENTIALS IMMEDIATELY!**

---

### Step 3B: Custom Email & Password

If you want your own email and password:

```bash
cd backend
node create-admin-user.js your@email.com YourPassword123
```

Replace with your actual email and password (minimum 8 characters).

---

## ✅ Verification Checklist

### 1. Verify Admin User Was Created

Check in database:

```bash
# Connect to PostgreSQL
sudo -u postgres psql immigration_ai

# Check admin users
SELECT email, role, subscription_plan, subscription_status, created_at 
FROM users 
WHERE role = 'admin';

# Exit
\q
```

**Expected output:**
```
email                      | role  | subscription_plan | subscription_status
--------------------------+-------+------------------+--------------------
admin@immigrationai.co.za | admin | enterprise       | active
```

---

### 2. Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# Or check if backend is responding
curl http://localhost:4000/api/health
```

**Expected:** Backend should be running and healthy.

---

### 3. Test Admin Login

**Browser Test:**

1. **Go to login page:**
   ```
   https://www.immigrationai.co.za/auth/login
   ```

2. **Enter credentials:**
   - Email: `admin@immigrationai.co.za` (or your custom email)
   - Password: [the password shown when you created the admin]

3. **Click "Sign In"**
   - Should redirect to dashboard
   - No "Access Denied" errors

**Expected:** Successfully logged in and redirected to dashboard.

---

### 4. Test Admin Dashboard Access

After logging in, visit these URLs:

**A. Main Admin Dashboard:**
```
https://www.immigrationai.co.za/admin
```

**Expected:**
- ✅ Page loads without errors
- ✅ Shows "Admin Dashboard" title
- ✅ Shows admin tools/features
- ✅ No "Access Denied" message

---

**B. UTM Analytics Dashboard:**
```
https://www.immigrationai.co.za/admin/utm-analytics
```

**Expected:**
- ✅ Page loads without errors
- ✅ Shows "UTM Analytics" title
- ✅ Shows overview stats (Total Signups, Traffic Sources, etc.)
- ✅ Shows "ProConnectSA Campaign Status" section
- ✅ Can see traffic sources table (may be empty if no signups yet)

---

**C. Payment Verification:**
```
https://www.immigrationai.co.za/admin/payments
```

**Expected:**
- ✅ Page loads without errors
- ✅ Shows payment verification interface
- ✅ Can view pending payments (if any)

---

### 5. Test ProConnectSA Traffic Monitoring

**Simulate ProConnectSA Traffic:**

1. **Open incognito window**

2. **Visit this URL:**
   ```
   https://www.immigrationai.co.za/?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=test
   ```

3. **Open browser console (F12)**
   - Should see: `🎯 New visitor tracked:`

4. **Go to admin UTM Analytics:**
   ```
   https://www.immigrationai.co.za/admin/utm-analytics
   ```

5. **After a test signup:**
   - ProConnectSA section should show activity
   - Traffic sources should list "proconnectsa"

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check .env file
cd /path/to/immigration_ai/backend
cat .env | grep DATABASE_URL

# Should show:
# DATABASE_URL="postgresql://..."
```

---

### Problem: "User already exists"

**If email already exists, update to admin:**
```bash
cd /path/to/immigration_ai/backend
node create-admin-user.js existing@email.com NewPassword123
```

Or via SQL:
```sql
UPDATE users 
SET role = 'admin', 
    subscription_plan = 'enterprise', 
    subscription_status = 'active' 
WHERE email = 'your@email.com';
```

---

### Problem: "Access Denied" after login

**Check user role:**
```bash
sudo -u postgres psql immigration_ai -c "SELECT email, role FROM users WHERE email = 'your@email.com';"
```

**If role is not 'admin', fix it:**
```bash
sudo -u postgres psql immigration_ai -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
```

**Then:**
- Clear browser cache (Ctrl+Shift+Delete)
- Logout and login again
- Or try in incognito mode

---

### Problem: "Admin pages not loading"

**Check backend logs:**
```bash
pm2 logs backend --lines 50

# Or
tail -f /path/to/immigration_ai/backend/backend.log
```

**Look for errors like:**
- Database connection errors
- Authentication errors
- Route errors

**Restart backend if needed:**
```bash
pm2 restart backend
```

---

## 📊 Expected Admin Dashboard Features

### Main Admin Dashboard (`/admin`)

Should show:
- ✅ Welcome message
- ✅ Admin tools grid with cards:
  - Payment Verification
  - UTM Analytics
  - User Management (coming soon)
  - Document Analytics (coming soon)
  - Revenue Analytics (coming soon)
- ✅ Quick stats (Admin Role: Active, Platform Status: Online)
- ✅ Quick action buttons

---

### UTM Analytics Dashboard (`/admin/utm-analytics`)

Should show:
- ✅ **Overview Stats:**
  - Total Signups (count)
  - Traffic Sources (count)
  - Active Campaigns (count)

- ✅ **ProConnectSA Campaign Status:**
  - "✅ Campaign Active & Tracking" (if there's data)
  - OR "⚠️ No ProConnectSA Traffic Yet" (if no data)

- ✅ **Traffic by Source:**
  - List of all traffic sources
  - Signups per source
  - ProConnectSA highlighted in purple

- ✅ **Traffic by Campaign:**
  - Campaign performance
  - Signups per campaign

- ✅ **Setup Instructions:**
  - How to use UTM tracking
  - Example URLs
  - What gets tracked

---

### Payment Verification (`/admin/payments`)

Should show:
- ✅ Pending payments list
- ✅ Payment details
- ✅ Approve/Reject buttons
- ✅ Payment history

---

## 🎯 Success Criteria

✅ **Admin user created successfully**
- Can query database and see admin user
- Role is 'admin'
- Subscription plan is 'enterprise'

✅ **Can login to dashboard**
- Login page works
- Redirects to dashboard after login
- No authentication errors

✅ **Admin pages accessible**
- `/admin` loads
- `/admin/utm-analytics` loads
- `/admin/payments` loads
- No "Access Denied" errors

✅ **UTM tracking working**
- Can see ProConnectSA section in analytics
- Can track test traffic with UTM parameters
- Dashboard shows attribution data

✅ **Ready to monitor ProConnectSA traffic**
- All systems operational
- Admin has full access
- Can view conversions and analytics

---

## 📋 Quick Command Reference

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

### Check Admin Users
```bash
sudo -u postgres psql immigration_ai -c "SELECT email, role, subscription_plan FROM users WHERE role = 'admin';"
```

### Make User Admin
```bash
sudo -u postgres psql immigration_ai -c "UPDATE users SET role = 'admin', subscription_plan = 'enterprise' WHERE email = 'your@email.com';"
```

### Check Backend Status
```bash
pm2 status
pm2 logs backend --lines 20
```

### Restart Backend
```bash
pm2 restart backend
```

---

## 🔐 Security Notes

After creating admin:
1. ✅ Save credentials in password manager
2. ✅ Don't share admin access
3. ✅ Use strong passwords
4. ✅ Change password regularly
5. ✅ Monitor admin activity

---

## 📞 Final Verification Steps

Run through this checklist:

- [ ] SSH'd into Hetzner server
- [ ] Navigated to immigration_ai/backend
- [ ] Ran `node create-admin-user.js`
- [ ] Saved credentials securely
- [ ] Verified user in database (role = admin)
- [ ] Successfully logged in at /auth/login
- [ ] Can access /admin dashboard
- [ ] Can access /admin/utm-analytics
- [ ] Can access /admin/payments
- [ ] UTM tracking is showing in analytics
- [ ] ProConnectSA section visible
- [ ] Ready to monitor traffic!

---

## ✅ You're Ready!

Once all checks pass, you can:
- 🎯 Monitor ProConnectSA traffic in real-time
- 📊 Track conversion rates and attribution
- 💰 Verify and manage payments
- 👥 Manage user accounts
- 📈 View detailed analytics

**Admin Dashboard:** https://www.immigrationai.co.za/admin  
**UTM Analytics:** https://www.immigrationai.co.za/admin/utm-analytics

