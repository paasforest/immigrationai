# 🚀 Run Deployment Now

## Quick Deploy

I've created a complete deployment script with your PAT. **Run this command:**

```bash
cd /home/immigrant/immigration_ai
sudo ./deploy-now.sh
```

**Or if sudo doesn't work, try:**
```bash
cd /home/immigrant/immigration_ai
./deploy-now.sh
```

## What It Does

1. ✅ Fixes git permissions
2. ✅ Configures Git with your PAT
3. ✅ Stages marketing test files
4. ✅ Commits changes
5. ✅ Pushes to GitHub (triggers Vercel auto-deploy)
6. ✅ Uploads backend files to Hetzner
7. ✅ Builds and restarts backend

## If You Get Permission Errors

If you see permission errors, run:

```bash
# Fix git permissions
sudo chown -R $USER:$USER /home/immigrant/immigration_ai/.git

# Then run deployment
./deploy-now.sh
```

## Manual Alternative (If Script Fails)

### Step 1: Commit & Push

```bash
cd /home/immigrant/immigration_ai

# Fix permissions first
sudo chown -R $USER:$USER .git

# Configure Git with PAT
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/paasforest/immigrationai.git

# Stage and commit
git add app/dashboard/page.tsx backend/src/controllers/aiController.ts backend/src/services/limitEnforcement.ts MARKETING_TEST_IMPLEMENTATION.md MARKETING_ROLLOUT_STRATEGY.md
git commit -m "feat: Add marketing_test subscription plan with 5 core features"
git push origin main
```

### Step 2: Deploy Backend

```bash
# Upload files
scp backend/src/services/limitEnforcement.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/controllers/aiController.ts root@78.46.183.41:/var/www/immigrationai/backend/src/controllers/

# Build and restart
ssh root@78.46.183.41 "cd /var/www/immigrationai/backend && npm run build && pm2 restart immigration-backend"
```

---

**The script is ready! Run `./deploy-now.sh` to deploy everything!** 🚀
