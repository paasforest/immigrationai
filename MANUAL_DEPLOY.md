# Manual Deployment to Hetzner

If automated deployment doesn't work, run these commands manually:

## Step 1: Push to GitHub (if not done)

```bash
cd /home/immigrant/immigration_ai
git push origin main
```

## Step 2: SSH into Hetzner

```bash
ssh root@78.46.183.41
```

## Step 3: Run Deployment Commands on Hetzner

Once SSH'd into Hetzner, run:

```bash
cd /var/www/immigrationai/backend

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed marketplace services
npm run seed:services

# Build TypeScript
npm run build

# Restart PM2
pm2 restart immigration-backend
```

## Step 4: Verify

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs immigration-backend --lines 50

# Test API
curl http://localhost:4000/api/intake/services
```

## Troubleshooting

### If git pull fails:
```bash
git fetch origin
git reset --hard origin/main
```

### If migration fails:
```bash
npx prisma migrate status
npx prisma migrate deploy
```

### If build fails:
```bash
npm run build 2>&1 | head -30
# Check for TypeScript errors
```

### If PM2 won't restart:
```bash
pm2 delete immigration-backend
pm2 start dist/app.js --name immigration-backend
pm2 save
```
