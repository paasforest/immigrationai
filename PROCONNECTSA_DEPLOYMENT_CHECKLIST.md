# ProConnectSA Integration - Deployment Checklist

## 🎯 Quick Start Guide

This checklist helps you deploy and verify the ProConnectSA integration on **www.immigrationai.co.za**.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Set these on your production server:

```bash
# Required for Google Analytics tracking
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Should already exist
export NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za
```

**Where to set:**
- **Vercel**: Dashboard → Project → Settings → Environment Variables
- **Hetzner/VPS**: Add to `.bashrc` or `.env` file
- **PM2**: Add to `ecosystem.config.js`
- **Docker**: Add to `docker-compose.yml`

**How to get Google Analytics ID:**
1. Go to https://analytics.google.com
2. Create property for "Immigration AI"
3. Go to: Admin → Property → Data Streams → Web
4. Copy Measurement ID (format: G-XXXXXXXXXX)

---

## 🚀 Deployment Steps

### Step 1: Deploy Code

```bash
# SSH into production server
ssh your-server

# Navigate to project
cd /path/to/immigration_ai

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart services
pm2 restart all
# or for Docker:
# docker-compose up -d --build
```

### Step 2: Verify Deployment

Open these URLs and verify:

#### A. Check Admin Dashboard is Accessible
```
URL: https://www.immigrationai.co.za/admin
Expected: Admin login/dashboard loads
Status: [ ] ✅ Working
```

#### B. Check UTM Analytics Dashboard
```
URL: https://www.immigrationai.co.za/admin/utm-analytics
Expected: UTM analytics page loads with stats
Status: [ ] ✅ Working
```

#### C. Check Plan Pre-selection
```
URL: https://www.immigrationai.co.za/pricing?plan=professional
Expected: Professional plan highlighted with purple ring and "🎯 Recommended" badge
Status: [ ] ✅ Working
```

#### D. Check Google Analytics Loading
```
URL: https://www.immigrationai.co.za
Action: Open browser DevTools → Network tab
Expected: See request to googletagmanager.com/gtag/js
Status: [ ] ✅ Working
```

---

## 🧪 Testing Complete Integration

### Test 1: Plan Pre-selection

1. **Visit URL:**
   ```
   https://www.immigrationai.co.za/pricing?plan=entry
   ```

2. **Expected Results:**
   - Entry plan has purple ring around it
   - "🎯 Recommended" badge visible on Entry plan
   - Page auto-scrolls to Entry plan
   - Browser console shows: `📋 Pre-selected plan from URL: entry`

3. **Test Other Plans:**
   - `?plan=starter` → Starter plan highlighted
   - `?plan=professional` → Professional plan highlighted
   - `?plan=enterprise` → Enterprise plan highlighted

**Status:** [ ] ✅ Passed

---

### Test 2: UTM Tracking

1. **Clear tracking data first:**
   - Open browser DevTools → Console
   - Run: `localStorage.removeItem('immigration_ai_tracking')`

2. **Visit URL with UTM parameters:**
   ```
   https://www.immigrationai.co.za/?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner
   ```

3. **Expected Results:**
   - Browser console shows: `🎯 New visitor tracked:`
   - Console shows UTM parameters captured

4. **Verify tracking data stored:**
   - In console, run: `localStorage.getItem('immigration_ai_tracking')`
   - Should see JSON with all UTM parameters

**Status:** [ ] ✅ Passed

---

### Test 3: Admin Dashboard

1. **Login as Admin:**
   ```
   URL: https://www.immigrationai.co.za/admin
   ```

2. **Navigate to UTM Analytics:**
   ```
   URL: https://www.immigrationai.co.za/admin/utm-analytics
   ```

3. **Expected Results:**
   - Dashboard loads successfully
   - Shows "UTM Analytics" page
   - Displays overview stats (Total Signups, Traffic Sources, Active Campaigns)
   - Shows "ProConnectSA Campaign Status" section
   - If no data yet: Shows "No UTM tracking data yet" message

**Status:** [ ] ✅ Passed

---

### Test 4: Complete User Flow (ProConnectSA Simulation)

This test simulates a complete user journey from ProConnectSA to Immigration AI.

1. **Clear all tracking data:**
   ```javascript
   // In browser console:
   localStorage.removeItem('immigration_ai_tracking');
   sessionStorage.clear();
   ```

2. **Click ProConnectSA link (simulated):**
   ```
   https://www.immigrationai.co.za/pricing?plan=entry&utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner
   ```

3. **Verify landing page:**
   - ✅ Pricing page loads
   - ✅ Entry plan highlighted with purple ring
   - ✅ "🎯 Recommended" badge visible
   - ✅ Console shows: `📋 Pre-selected plan from URL: entry`
   - ✅ Console shows: `🎯 New visitor tracked:`

4. **Click "Get Payment Details" on Entry plan**
   - Should redirect to payment/signup flow

5. **(Optional) Complete signup:**
   - Create test account
   - After signup, check admin dashboard
   - Should see conversion attributed to ProConnectSA

**Status:** [ ] ✅ Passed

---

### Test 5: Google Analytics

**Only if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set**

1. **Check GA script loads:**
   - Visit: https://www.immigrationai.co.za
   - Open DevTools → Network tab
   - Filter: "gtag"
   - Should see: `gtag/js?id=G-XXXXXXXXXX` with status 200

2. **Check GA is working:**
   - Open DevTools → Console
   - Run: `typeof gtag`
   - Should return: `"function"`

3. **Check GA Real-time (in Google Analytics dashboard):**
   - Go to: https://analytics.google.com
   - Navigate to: Reports → Real-time
   - Visit your site
   - Should see yourself in real-time view

4. **Check UTM Campaign tracking (after 24-48 hours):**
   - In Google Analytics: Acquisition → Traffic Acquisition
   - Look for campaign: "immigration_integration"
   - Look for source: "proconnectsa"

**Status:** [ ] ✅ Passed (or N/A if GA not configured)

---

## 🔍 Admin Dashboard Verification

### Accessing Admin Dashboard on Production

```
URL: https://www.immigrationai.co.za/admin
```

**Required:**
- Admin user account
- `isAdmin: true` in database user record

### Admin Pages to Verify:

1. **Main Admin Dashboard**
   - URL: `/admin`
   - Should show: Welcome message, admin tools grid
   - **Status:** [ ] ✅ Accessible

2. **UTM Analytics Dashboard**
   - URL: `/admin/utm-analytics`
   - Should show: Overview stats, ProConnectSA section, traffic sources
   - **Status:** [ ] ✅ Accessible

3. **Payment Verification**
   - URL: `/admin/payments`
   - Should show: Payment verification interface
   - **Status:** [ ] ✅ Accessible

### Expected Admin Dashboard Features:

- [ ] Total Signups counter
- [ ] Traffic Sources counter
- [ ] Active Campaigns counter
- [ ] ProConnectSA Campaign Status section
- [ ] Traffic by Source table
- [ ] Traffic by Campaign table
- [ ] Setup instructions section
- [ ] Refresh button works
- [ ] "Back to Admin Home" link works

---

## 📊 Data Verification

### After First ProConnectSA Signup:

1. **Check Admin Dashboard:**
   - URL: `/admin/utm-analytics`
   - ProConnectSA section should show: "✅ Campaign Active & Tracking"
   - Should show signup count from ProConnectSA

2. **Check Google Analytics (if configured):**
   - Wait 24-48 hours for data
   - Go to: Acquisition → Traffic Acquisition → Campaigns
   - Look for: `immigration_integration` campaign
   - Filter by: `proconnectsa` source

3. **Check Database (backend):**
   - Query users table
   - Check `utmSource` field = 'proconnectsa'
   - Check `utmCampaign` field = 'immigration_integration'

---

## 🚨 Troubleshooting

### Issue: Admin dashboard not accessible

**Symptoms:**
- 403 Forbidden error
- "Access Denied: Admin privileges required"

**Solution:**
1. Check user account has `isAdmin: true` in database
2. Check auth token is valid
3. Check backend API is running
4. Check `/api/admin/*` routes are accessible

**Fix:**
```sql
-- Run this SQL to make user admin:
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
```

---

### Issue: Plan not pre-selecting

**Symptoms:**
- No purple ring on plan
- No "🎯 Recommended" badge
- No auto-scroll

**Solution:**
1. Check URL has `plan` parameter
2. Verify plan name is lowercase: starter, entry, professional, or enterprise
3. Check browser console for: `📋 Pre-selected plan from URL:`
4. Clear cache and try again

---

### Issue: UTM tracking not working

**Symptoms:**
- No console message about tracking
- localStorage empty
- Admin dashboard shows no data

**Solution:**
1. Clear localStorage and sessionStorage
2. Visit UTM link again
3. Check browser console for errors
4. Verify URL has UTM parameters
5. Check `initializeTracking()` is called in layout.tsx

**Debug:**
```javascript
// In browser console:
localStorage.getItem('immigration_ai_tracking')
// Should return JSON with UTM params
```

---

### Issue: Google Analytics not loading

**Symptoms:**
- No gtag.js request in Network tab
- Console warning: "⚠️ Google Analytics not configured"

**Solution:**
1. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
2. Format must be: `G-XXXXXXXXXX` (capital G, dash, then alphanumeric)
3. Redeploy after setting environment variable
4. Clear cache and hard refresh (Ctrl+Shift+R)

---

### Issue: Admin dashboard shows "No data"

**Symptoms:**
- UTM analytics page loads but shows no traffic sources
- ProConnectSA section shows: "⚠️ No ProConnectSA Traffic Yet"

**Solution:**
This is normal if no one has signed up via UTM links yet.

**To test:**
1. Visit: `https://www.immigrationai.co.za/?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration`
2. Sign up for an account
3. Check admin dashboard again
4. Should now show ProConnectSA traffic

---

## 📋 Production Environment Checklist

### Server Configuration:

- [ ] Node.js version 18+ installed
- [ ] npm packages installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] Environment variables set
- [ ] Backend API running
- [ ] Database connected
- [ ] SSL certificate valid (HTTPS)
- [ ] PM2 or Docker running
- [ ] Logs accessible

### DNS & Domain:

- [ ] www.immigrationai.co.za resolves correctly
- [ ] SSL/HTTPS working
- [ ] No mixed content warnings
- [ ] Google Analytics domain verified (if using GA)

### Database:

- [ ] Users table has UTM fields
- [ ] At least one admin user exists
- [ ] Backend can read/write UTM data

---

## ✅ Final Verification Checklist

Before marking as complete, verify all of these:

### Core Features:
- [ ] Pricing page loads at: `/pricing`
- [ ] Plan pre-selection works with: `?plan=professional`
- [ ] UTM parameters captured from URL
- [ ] UTM data stored in localStorage
- [ ] Signup page tracks UTM attribution

### Admin Dashboard:
- [ ] Admin dashboard accessible at: `/admin`
- [ ] UTM analytics page loads at: `/admin/utm-analytics`
- [ ] Dashboard shows overview stats
- [ ] ProConnectSA section visible
- [ ] Refresh button works

### Google Analytics (if configured):
- [ ] GA script loads (check Network tab)
- [ ] gtag function available (check Console)
- [ ] Real-time view shows visits
- [ ] UTM parameters tracked

### ProConnectSA Integration:
- [ ] All 9 ProConnectSA links work correctly
- [ ] Plan pre-selection from ProConnectSA links
- [ ] UTM attribution from ProConnectSA
- [ ] Conversions tracked in admin dashboard

### Testing:
- [ ] Test URL: `?plan=entry&utm_source=proconnectsa` works
- [ ] Test signup flow with UTM attribution
- [ ] Admin dashboard shows test conversion
- [ ] No console errors

---

## 🎉 Success Criteria

**Integration is COMPLETE when:**

1. ✅ User clicks ProConnectSA link → lands on Immigration AI with pre-selected plan
2. ✅ Plan is highlighted with purple ring and "🎯 Recommended" badge
3. ✅ User signs up → attribution saved to database
4. ✅ Admin dashboard shows ProConnectSA conversion
5. ✅ Google Analytics tracks the campaign (if configured)

---

## 📞 Support Resources

**Documentation:**
- `PROCONNECTSA_INTEGRATION_COMPLETE.md` - Complete implementation guide
- `PROCONNECTSA_DEPLOYMENT_CHECKLIST.md` - This file

**Deployment Script:**
- `deploy-proconnectsa-integration.sh` - Automated deployment

**Debug Tips:**
- All tracking logs use emoji prefixes (🎯, 📊, 📋, etc.)
- Check browser console for real-time debug messages
- Test in incognito mode to rule out cache issues
- Allow 24-48 hours for Google Analytics data

**Admin Access:**
- Admin dashboard: `https://www.immigrationai.co.za/admin`
- UTM analytics: `https://www.immigrationai.co.za/admin/utm-analytics`
- Make user admin: Update `isAdmin` field in database

---

## 🚀 Quick Deploy Command

Run this on your production server:

```bash
cd /home/paas/immigration_ai
bash deploy-proconnectsa-integration.sh
```

This script will:
1. Check environment variables
2. Install dependencies
3. Build application
4. Verify implementation
5. Provide testing instructions
6. Optionally restart services

---

**Last Updated:** $(date)  
**Status:** Ready for Production Deployment  
**Version:** 1.0

