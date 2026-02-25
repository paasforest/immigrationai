# Deploy Routing Engine Fix to Hetzner

## ✅ Changes Pushed to GitHub
The fix for independent professionals has been committed and pushed to GitHub.

## 🚀 Deploy to Hetzner Server

### Option 1: Using the Deployment Script (Recommended)

1. **SSH into Hetzner server:**
   ```bash
   ssh root@78.46.183.41
   # or
   ssh immigrant@78.46.183.41
   ```

2. **Navigate to project directory:**
   ```bash
   cd /root/immigration_ai
   # or
   cd /home/immigrant/immigration_ai
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Run deployment script:**
   ```bash
   cd backend
   chmod +x ../deploy-routing-fix.sh
   ../deploy-routing-fix.sh
   ```

### Option 2: Manual Deployment

1. **SSH into Hetzner:**
   ```bash
   ssh root@78.46.183.41
   ```

2. **Navigate to backend:**
   ```bash
   cd /root/immigration_ai/backend
   # or wherever your backend is located
   ```

3. **Pull latest code:**
   ```bash
   cd ..
   git pull origin main
   cd backend
   ```

4. **Verify the fix is present:**
   ```bash
   grep -n "ensurePersonalOrganization" src/services/routingEngine.ts
   ```
   You should see the function definition.

5. **Install dependencies (if needed):**
   ```bash
   npm install --production
   ```

6. **Restart PM2:**
   ```bash
   pm2 restart all
   # or
   pm2 restart backend
   # or whatever your PM2 process name is
   ```

7. **Check PM2 status:**
   ```bash
   pm2 list
   pm2 logs --lines 50
   ```

## 🧪 Testing the Fix

After deployment, test that independent professionals can accept leads:

1. **Create a test lead** (if you have the intake system set up)
2. **Have an independent professional accept the lead**
3. **Verify:**
   - A personal organization is created automatically
   - The case is created successfully
   - The professional's `organizationId` is set
   - The professional's role is set to `org_admin`

## 📋 What Was Fixed

- **Problem:** Independent professionals without `organizationId` couldn't create cases
- **Solution:** Automatically create a personal organization when an independent professional accepts their first lead
- **File Changed:** `backend/src/services/routingEngine.ts`
- **New Function:** `ensurePersonalOrganization()` - Creates personal org with trial subscription

## 🔍 Verify Deployment

Check the logs to ensure the backend restarted successfully:
```bash
pm2 logs --lines 100
```

Look for any errors related to `routingEngine.ts` or `ensurePersonalOrganization`.

## ❓ Troubleshooting

### If git pull fails:
```bash
# Check git status
git status

# If there are conflicts, stash changes
git stash
git pull origin main
git stash pop
```

### If PM2 restart fails:
```bash
# Check what processes are running
pm2 list

# Stop all processes
pm2 stop all

# Start backend manually to see errors
cd backend
npm start
```

### If the file doesn't have the fix:
```bash
# Manually check the file
cat src/services/routingEngine.ts | grep -A 5 "ensurePersonalOrganization"
```

If the function is missing, the git pull may have failed. Try pulling again or manually copy the file.
