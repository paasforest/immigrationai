# 🖥️ You're on Hetzner Server - Run These Commands

## Step 1: Check if Files Were Updated

```bash
# Check file dates (should be today Feb 20)
ls -la src/services/authService*.ts
```

If files still show November dates, the upload didn't work. You need to upload again from local machine.

## Step 2: If Files Are Old - Upload Again

**On your LOCAL machine terminal, run:**
```bash
cd /home/immigrant/immigration_ai
scp backend/src/services/authService.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
scp backend/src/services/authService.prisma.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
```

## Step 3: On Hetzner - Verify Files Updated

```bash
# Check dates again (should be today)
ls -la src/services/authService*.ts

# Check file content to verify marketing_test is there
grep -n "marketing_test" src/services/authService.ts
```

You should see `'marketing_test'` in the file.

## Step 4: Build and Restart

```bash
# Build TypeScript (warnings are OK)
npm run build

# Restart backend
pm2 restart immigration-backend

# Check status
pm2 status

# Check logs
pm2 logs immigration-backend --lines 20
```

---

**First check if files were updated, then build/restart!** 🚀
