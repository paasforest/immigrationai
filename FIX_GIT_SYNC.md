# 🔄 Fix Git Sync Issue

## Problem
Remote repository has changes that you don't have locally. Need to pull first.

## Quick Fix

Run this script:
```bash
cd /home/immigrant/immigration_ai
./fix-and-deploy.sh
```

## Manual Fix (Step by Step)

### Step 1: Pull Remote Changes

```bash
cd /home/immigrant/immigration_ai

# Configure Git with PAT
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/paasforest/immigrationai.git

# Fetch remote changes
git fetch origin main

# Pull and merge
git pull origin main
```

### Step 2: If There Are Conflicts

If you see merge conflicts:

```bash
# Keep our marketing test changes
git checkout --ours app/dashboard/page.tsx
git checkout --ours backend/src/controllers/aiController.ts
git checkout --ours backend/src/services/limitEnforcement.ts

# Add the resolved files
git add app/dashboard/page.tsx backend/src/controllers/aiController.ts backend/src/services/limitEnforcement.ts

# Complete the merge
git commit -m "Merge: Keep marketing_test changes"
```

### Step 3: Push Again

```bash
# Stage our changes
git add app/dashboard/page.tsx backend/src/controllers/aiController.ts backend/src/services/limitEnforcement.ts MARKETING_TEST_IMPLEMENTATION.md MARKETING_ROLLOUT_STRATEGY.md

# Commit if needed
git commit -m "feat: Add marketing_test subscription plan" || echo "Already committed"

# Push
git push origin main
```

### Step 4: Deploy Backend

```bash
# Upload files
scp backend/src/services/limitEnforcement.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/controllers/aiController.ts root@78.46.183.41:/var/www/immigrationai/backend/src/controllers/

# Build and restart
ssh root@78.46.183.41 "cd /var/www/immigrationai/backend && npm run build && pm2 restart immigration-backend"
```

---

**Run `./fix-and-deploy.sh` to do all of this automatically!** 🚀
