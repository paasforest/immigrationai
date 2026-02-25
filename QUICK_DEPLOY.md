# Quick Deploy Instructions

## Backend Path Found
**Path:** `/var/www/immigrationai/backend`

## Deploy Now

Run the deployment script and enter the path when prompted:

```bash
bash deploy-marketplace-to-hetzner.sh
```

When it asks:
```
Enter backend path: 
```

**Type:** `/var/www/immigrationai/backend`

Then press Enter.

The script will:
1. Connect to Hetzner (78.46.183.41)
2. Pull latest code from GitHub
3. Install dependencies
4. Run Prisma migrations
5. Generate Prisma client
6. Seed marketplace services
7. Build TypeScript
8. Restart PM2

## Alternative: One-Line Deploy

If you want to skip the interactive prompt, you can modify the script or run this directly:

```bash
ssh root@78.46.183.41 << 'EOF'
cd /var/www/immigrationai/backend
git pull origin main
npm install --production
npx prisma migrate deploy
npx prisma generate
npm run seed:services
npm run build
pm2 restart immigration-backend
EOF
```
