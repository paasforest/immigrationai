# 🚀 Deploy Marketing Test Toggle

## Quick Deployment Steps

### 1. Upload Fixed Files to Hetzner

**From your local machine:**

```bash
cd /home/immigrant/immigration_ai

# Upload the updated authService files
scp backend/src/services/authService.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/services/authService.prisma.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
```

### 2. On Hetzner - Add Environment Variable

**SSH into Hetzner and run:**

```bash
cd /var/www/immigrationai/backend

# Edit .env file
nano .env

# Add this line at the end:
MARKETING_TEST_MODE=true

# Save: Ctrl+X, then Y, then Enter
```

### 3. Rebuild and Restart

```bash
# Still on Hetzner
rm -rf dist
npm run build
pm2 restart immigration-backend

# Check it's running
pm2 status
pm2 logs immigration-backend --lines 20
```

### 4. Test

1. Go to https://immigrationai.co.za
2. Sign up with a NEW email
3. Check: User should get `marketing_test` plan automatically

---

## To Disable Marketing Test Mode Later

Just change the .env file:

```bash
# On Hetzner
cd /var/www/immigrationai/backend
nano .env

# Change to:
MARKETING_TEST_MODE=false

# Restart
pm2 restart immigration-backend
```

**Done!** Normal sales resume. 🎉
