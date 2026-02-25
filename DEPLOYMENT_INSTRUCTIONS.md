# 🚀 Deployment Instructions - Marketing Test Feature

## ⚠️ Important: Manual Steps Required

Due to permission restrictions, you'll need to run these commands manually.

---

## Step 1: Commit and Push to Git (Frontend Auto-Deploys)

Run these commands in your terminal:

```bash
cd /home/immigrant/immigration_ai

# Stage the marketing test files
git add app/dashboard/page.tsx \
        backend/src/controllers/aiController.ts \
        backend/src/services/limitEnforcement.ts \
        MARKETING_TEST_IMPLEMENTATION.md \
        MARKETING_ROLLOUT_STRATEGY.md

# Commit
git commit -m "feat: Add marketing_test subscription plan with 5 core features

- Add marketing_test plan with 5 core features enabled
- Update dashboard to show only enabled features
- Add feature access check to AI Chat endpoint"

# Push (triggers Vercel auto-deploy)
git push origin main
```

**Result**: Frontend will automatically deploy on Vercel in ~2-3 minutes.

---

## Step 2: Deploy Backend to Hetzner

### Option A: Use the Deployment Script

```bash
cd /home/immigrant/immigration_ai
chmod +x deploy-marketing-test.sh
./deploy-marketing-test.sh
```

### Option B: Manual Deployment

```bash
# Upload backend files
scp backend/src/services/limitEnforcement.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/controllers/aiController.ts root@78.46.183.41:/var/www/immigrationai/backend/src/controllers/

# SSH into Hetzner and rebuild
ssh root@78.46.183.41

# Once on Hetzner server:
cd /var/www/immigrationai/backend
npm install
npm run build
pm2 restart immigration-backend
pm2 logs immigration-backend --lines 20
```

---

## Step 3: Verify Deployment

### Check Frontend (Vercel)
1. Visit https://immigrationai.co.za
2. Check if dashboard loads correctly
3. Login and verify features are showing

### Check Backend (Hetzner)
```bash
# Health check
curl https://api.immigrationai.co.za/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Check PM2 Status
```bash
ssh root@78.46.183.41
pm2 status
pm2 logs immigration-backend --lines 50
```

---

## Step 4: Assign Test Users to Marketing Test Plan

Once deployed, assign users to the `marketing_test` plan:

### Via SQL (if you have database access):

```sql
-- For a specific user
UPDATE users 
SET subscription_plan = 'marketing_test', 
    subscription_status = 'active'
WHERE email = 'testuser@example.com';

-- For multiple users
UPDATE users 
SET subscription_plan = 'marketing_test', 
    subscription_status = 'active'
WHERE id IN ('user-id-1', 'user-id-2');
```

### Via Admin Panel (if available):
- Go to `/admin/users`
- Edit user
- Set subscription plan to `marketing_test`
- Set status to `active`

---

## Step 5: Test the Implementation

1. **Login as marketing_test user**
2. **Check dashboard** - Should see only 5 features:
   - SOP Generator
   - SOP Reviewer
   - Visa Eligibility
   - AI Chat Assistant
   - Document Checklist
3. **Test each feature** - Should work normally
4. **Try accessing disabled feature** - Should be blocked with message

---

## 🔍 Troubleshooting

### Frontend Not Updating
- Check Vercel dashboard: https://vercel.com
- Wait 2-3 minutes for auto-deploy
- Clear browser cache

### Backend Not Working
```bash
# Check PM2 status
ssh root@78.46.183.41
pm2 status
pm2 logs immigration-backend

# Restart if needed
pm2 restart immigration-backend
```

### Features Still Showing
- Clear browser cache
- Check user's subscription_plan in database
- Verify backend was rebuilt: `ls -la /var/www/immigrationai/backend/dist/`

---

## ✅ Deployment Checklist

- [ ] Committed changes to Git
- [ ] Pushed to main branch
- [ ] Frontend auto-deployed on Vercel
- [ ] Backend files uploaded to Hetzner
- [ ] Backend rebuilt (`npm run build`)
- [ ] PM2 restarted
- [ ] Health check passes
- [ ] Test users assigned to marketing_test plan
- [ ] Features tested and working

---

## 📞 Quick Commands Reference

```bash
# Git operations
git add app/dashboard/page.tsx backend/src/controllers/aiController.ts backend/src/services/limitEnforcement.ts
git commit -m "feat: Add marketing_test plan"
git push origin main

# Hetzner deployment
scp backend/src/services/limitEnforcement.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/controllers/aiController.ts root@78.46.183.41:/var/www/immigrationai/backend/src/controllers/
ssh root@78.46.183.41 "cd /var/www/immigrationai/backend && npm run build && pm2 restart immigration-backend"

# Check status
curl https://api.immigrationai.co.za/health
```

---

**Ready to deploy!** 🚀
