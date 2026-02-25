# 🚀 Deploy Signup Fix - Step by Step

## You're in Two Places:
- **Local machine**: `/home/immigrant/immigration_ai/backend`
- **Hetzner server**: `/var/www/immigrationai/backend`

## Step 1: Deploy Signup Fix (From Local Machine)

**On your LOCAL machine terminal, run:**

```bash
cd /home/immigrant/immigration_ai

# Upload the signup fix files to Hetzner
scp backend/src/services/authService.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/services/authService.prisma.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
```

## Step 2: Build and Restart (On Hetzner Server)

**On your HETZNER server terminal (where you are now), run:**

```bash
cd /var/www/immigrationai/backend

# Build TypeScript
npm run build

# Restart backend
pm2 restart immigration-backend

# Check status
pm2 status

# Check logs
pm2 logs immigration-backend --lines 20
```

## Step 3: Test Signup

1. Go to https://immigrationai.co.za
2. Sign up with a NEW email
3. Check if user automatically gets `marketing_test` plan
4. Verify dashboard shows only 5 features

---

**Start with Step 1 on your local machine!** 🚀
