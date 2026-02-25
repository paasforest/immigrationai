# 🎛️ Marketing Test Mode Toggle

## Solution Overview

**Problem**: Need to temporarily assign all new signups to `marketing_test` plan without breaking the normal sales flow.

**Solution**: Environment variable toggle that can be easily switched on/off.

## How It Works

### During Marketing Test (Current Setup)

1. **Set environment variable on Hetzner:**
   ```bash
   # Add to /var/www/immigrationai/backend/.env
   MARKETING_TEST_MODE=true
   ```

2. **What happens:**
   - ✅ All new signups automatically get `marketing_test` plan
   - ✅ Status is set to `active` (immediate access)
   - ✅ Frontend still shows plan selection (for future sales)
   - ✅ User's plan selection is ignored (they get marketing_test anyway)

### After Marketing Test (Normal Sales)

1. **Change environment variable:**
   ```bash
   # Change in /var/www/immigrationai/backend/.env
   MARKETING_TEST_MODE=false
   # OR just remove the line
   ```

2. **What happens:**
   - ✅ New signups get the plan they selected on frontend
   - ✅ Default to `starter` if no plan selected
   - ✅ Status is `pending` (normal flow - requires payment)
   - ✅ Frontend unchanged - still shows plans

## Files Changed

1. ✅ `backend/src/services/authService.ts` - Added toggle logic
2. ✅ `backend/src/services/authService.prisma.ts` - Added toggle logic

## Frontend

**NO CHANGES NEEDED** - Frontend stays exactly as-is:
- Still shows plan selection
- Still sends `subscriptionPlan` parameter
- Users can see plans (for when marketing test ends)

## Setup on Hetzner

### Step 1: Add Environment Variable

```bash
# SSH into Hetzner
ssh root@78.46.183.41

# Edit .env file
cd /var/www/immigrationai/backend
nano .env

# Add this line:
MARKETING_TEST_MODE=true

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 2: Deploy Updated Code

```bash
# Upload fixed files from local machine
# (From local machine:)
scp backend/src/services/authService.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/services/authService.prisma.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/

# On Hetzner:
cd /var/www/immigrationai/backend
rm -rf dist
npm run build
pm2 restart immigration-backend
```

### Step 3: Verify

```bash
# Check logs
pm2 logs immigration-backend --lines 20

# Test signup with new email
# User should get marketing_test plan
```

## When Marketing Test Ends

Simply change the environment variable:

```bash
# On Hetzner
cd /var/www/immigrationai/backend
nano .env

# Change to:
MARKETING_TEST_MODE=false

# Restart
pm2 restart immigration-backend
```

**That's it!** Normal sales resume immediately. 🚀

---

## Benefits

✅ **No frontend changes** - Keep plan selection UI  
✅ **Easy toggle** - One environment variable  
✅ **Reversible** - Switch back to sales mode instantly  
✅ **No code changes needed** - Just change .env file  
✅ **Safe** - Doesn't break existing functionality  
