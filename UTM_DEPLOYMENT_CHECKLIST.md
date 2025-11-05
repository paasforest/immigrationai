# ✅ UTM Tracking - Deployment Checklist

## Quick 3-Step Deployment

### ☐ Step 1: Run Database Migration (5 minutes)

```bash
# SSH to your Hetzner server
ssh root@your-hetzner-ip

# Navigate to backend directory
cd /root/immigration_ai/backend

# Run the migration
psql $DATABASE_URL < prisma/migrations/add_utm_tracking.sql

# Verify table was created
psql $DATABASE_URL -c "\d user_tracking"

# Should see the table structure
```

**Expected output:**
```
CREATE TABLE
```

---

### ☐ Step 2: Restart Backend (2 minutes)

```bash
# Still on Hetzner server
cd /root/immigration_ai/backend

# Pull latest code (already pushed)
git pull origin main

# Restart PM2
pm2 restart immigration-backend

# Check status
pm2 status

# Should show "online"
```

**Expected output:**
```
immigration-backend │ online │ 0
```

---

### ☐ Step 3: Update ProConnectSA Links (10 minutes)

Open `PROCONNECTSA_LINKS.md` and copy the URLs you need.

**Priority Links (do these first):**

1. **Homepage Hero Section:**
   ```
   https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner
   ```

2. **Navigation Menu:**
   ```
   https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=nav_menu
   ```

3. **Footer Link:**
   ```
   https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=footer_link
   ```

Replace existing ImmigrationAI links on ProConnectSA with these tracked versions.

---

## 🧪 Testing (5 minutes)

### Test 1: Tracking Capture

1. Open **incognito/private browser**
2. Visit:
   ```
   https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=test&utm_content=manual_test
   ```
3. Open browser console (F12)
4. Should see: `📊 New visitor tracked:`

✅ **Pass:** Tracking captured  
❌ **Fail:** Check browser console for errors

---

### Test 2: Signup Tracking

1. Stay in same browser (tracking persists)
2. Go to `/auth/signup`
3. Create test account: `test+utm@yourdomain.com`
4. Should see: `📊 Signup attributed to: proconnectsa` in console

✅ **Pass:** Tracking saved  
❌ **Fail:** Check backend logs

---

### Test 3: Database Verification

```sql
-- Check if tracking was saved
SELECT 
  u.email,
  ut.utm_source,
  ut.utm_campaign,
  ut.utm_content,
  ut.created_at
FROM user_tracking ut
JOIN users u ON u.id = ut.user_id
WHERE u.email LIKE 'test+utm%'
ORDER BY ut.created_at DESC
LIMIT 1;
```

✅ **Pass:** Shows your test signup with UTM data  
❌ **Fail:** Tracking not saved - check backend logs

---

## 📊 Ongoing Monitoring

### Daily Check (First Week)

```sql
-- How many signups today from ProConnectSA?
SELECT COUNT(*) 
FROM user_tracking 
WHERE utm_source = 'proconnectsa' 
AND created_at >= CURRENT_DATE;
```

### Weekly Check

```sql
-- Which ProConnectSA links are working best?
SELECT 
  utm_content,
  COUNT(*) as signups
FROM user_tracking
WHERE utm_source = 'proconnectsa'
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY utm_content
ORDER BY signups DESC;
```

### Monthly Check

```sql
-- Monthly conversion rate
SELECT 
  COUNT(*) as total_signups,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
  ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) || '%' as conversion_rate
FROM user_tracking
WHERE utm_source = 'proconnectsa'
AND created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 🚨 Troubleshooting

### Problem: Table doesn't exist

```bash
# Check if migration ran
psql $DATABASE_URL -c "\dt" | grep user_tracking

# If not found, run migration again
psql $DATABASE_URL < prisma/migrations/add_utm_tracking.sql
```

---

### Problem: No tracking data captured

**Check 1:** Browser console
- Open F12
- Refresh page with UTM params
- Should see: `📊 New visitor tracked:`

**Check 2:** localStorage
- F12 → Application tab → Local Storage
- Look for: `immigration_ai_tracking`
- Should have UTM data

**Check 3:** Backend logs
```bash
pm2 logs immigration-backend --lines 50 | grep "Tracking"
```

---

### Problem: Signup not saving tracking

**Check 1:** Backend receives data
```bash
pm2 logs immigration-backend | grep "Tracking"
# Should see: "📊 Tracking saved for new user"
```

**Check 2:** Database connection
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
# Should return a number (confirms DB works)
```

---

## ✅ Deployment Complete Checklist

- ☐ Database migration ran successfully
- ☐ Backend restarted and online
- ☐ ProConnectSA links updated with UTM parameters
- ☐ Test signup completed successfully
- ☐ Database shows test tracking data
- ☐ Monitoring queries work
- ☐ ProConnectSA team informed of new tracking

---

## 🎯 Success Metrics (After 30 Days)

Track these KPIs:

1. **Total Signups from ProConnectSA**
   ```sql
   SELECT COUNT(*) FROM user_tracking WHERE utm_source = 'proconnectsa';
   ```

2. **Best Performing Link**
   ```sql
   SELECT utm_content, COUNT(*) FROM user_tracking 
   WHERE utm_source = 'proconnectsa' 
   GROUP BY utm_content ORDER BY COUNT(*) DESC LIMIT 1;
   ```

3. **Conversion Rate**
   ```sql
   SELECT 
     ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) || '%'
   FROM user_tracking WHERE utm_source = 'proconnectsa';
   ```

4. **Monthly Revenue Attribution**
   ```sql
   SELECT 
     COUNT(CASE WHEN converted THEN 1 END) as paying_customers,
     COUNT(CASE WHEN converted THEN 1 END) * 699 as monthly_revenue_rands
   FROM user_tracking WHERE utm_source = 'proconnectsa';
   ```

---

## 📞 Support

**Documentation:**
- Full guide: `UTM_TRACKING_IMPLEMENTATION.md`
- Link reference: `PROCONNECTSA_LINKS.md`
- This checklist: `UTM_DEPLOYMENT_CHECKLIST.md`

**Common Commands:**
```bash
# Check backend logs
pm2 logs immigration-backend

# Check database
psql $DATABASE_URL

# Restart backend
pm2 restart immigration-backend

# View table structure
psql $DATABASE_URL -c "\d user_tracking"
```

---

**Last Updated:** November 3, 2025  
**Estimated Time:** 20 minutes total  
**Status:** Ready to deploy

