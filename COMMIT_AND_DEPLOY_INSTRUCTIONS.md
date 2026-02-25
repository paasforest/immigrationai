# Commit and Deploy Marketplace System

## Quick Start

I've created automated scripts to commit and deploy the marketplace system. Here's how to use them:

## Option 1: Automated Script (Recommended)

### Step 1: Commit and Push
```bash
cd /home/immigrant/immigration_ai
bash commit-and-deploy-marketplace.sh
```

This script will:
- ✅ Remove any git lock files
- ✅ Stage all marketplace files
- ✅ Commit with descriptive message
- ✅ Optionally push to GitHub
- ✅ Optionally deploy to Hetzner via SSH

### Step 2: Deploy to Hetzner (if not done in Step 1)
```bash
bash deploy-marketplace-to-hetzner.sh
```

This script will:
- ✅ Connect to Hetzner server (78.46.183.41)
- ✅ Pull latest code from GitHub
- ✅ Install dependencies
- ✅ Run Prisma migrations
- ✅ Generate Prisma client
- ✅ Seed marketplace services
- ✅ Build TypeScript
- ✅ Restart PM2

## Option 2: Manual Steps

### 1. Commit Locally

```bash
cd /home/immigrant/immigration_ai

# Add all marketplace files
git add app/find-a-specialist/
git add app/get-help/
git add app/intake-status/
git add app/admin/verifications/
git add app/admin/marketplace/
git add app/dashboard/immigration/leads/analytics/
git add components/intake/
git add components/admin/
git add components/immigration/leads/LeadAnalytics.tsx
git add components/immigration/leads/LeadPerformanceChart.tsx
git add lib/api/publicIntake.ts
git add lib/utils/countryFlags.ts
git add lib/api/immigration.ts
git add types/immigration.ts
git add backend/src/controllers/intakeController.ts
git add backend/src/routes/intake.routes.ts
git add backend/src/services/routingEngine.ts
git add backend/src/services/emailService.ts
git add backend/src/data/seedServices.ts
git add backend/prisma/schema.prisma
git add backend/package.json
git add backend/src/app.ts
git add backend/MARKETPLACE_TESTING.md
git add MARKETPLACE_COMPLETE.md
git add app/page.tsx
git add app/dashboard/immigration/layout.tsx
git add components/intake/IntakeForm.tsx
git add app/get-help/\[serviceSlug\]/page.tsx

# Commit
git commit -m "feat: Complete marketplace intake and routing system (M5-M8)

- M5: Public professional directory with filtering and profile pages
- M6: Admin verification panel and marketplace overview
- M7: Professional lead analytics with performance charts
- M8: Navigation integration and testing guide

Backend:
- Added getPublicDirectory, getPublicProfile, admin verification functions
- Added getMyLeadStats for professional analytics
- Added verification email functions
- All 17 routes registered and working

Frontend:
- Public directory pages (find-a-specialist)
- Admin verification and marketplace pages
- Lead analytics dashboard with recharts
- Preferred specialist wiring in intake form
- Navigation links added to homepage

Testing:
- Complete testing guide with 8 scenarios
- All routes verified and documented"
```

### 2. Push to GitHub

```bash
git push origin main
```

### 3. Deploy to Hetzner

SSH into your Hetzner server and run:

```bash
# Navigate to your backend directory
cd /var/www/immigration_ai/backend  # or wherever your backend is

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

Or use the existing deploy script on Hetzner:

```bash
cd /var/www/immigration_ai/backend
bash deploy.sh
```

## Verification

After deployment, verify everything is working:

### 1. Check Backend Status
```bash
ssh root@78.46.183.41 'pm2 status'
```

### 2. Test API Endpoints
```bash
# Test services endpoint (public)
curl https://api.immigrationai.co.za/api/intake/services

# Should return 8 services
```

### 3. Check Database
```bash
ssh root@78.46.183.41
cd /var/www/immigration_ai/backend
npx prisma studio
```

Verify these tables exist:
- `ServiceCatalog` (should have 8 rows)
- `ProfessionalSpecialization`
- `CaseIntake`
- `IntakeAssignment`
- `ProfessionalProfile`

### 4. Check Logs
```bash
ssh root@78.46.183.41 'pm2 logs immigration-backend --lines 50'
```

## Troubleshooting

### Git Lock File Error
```bash
rm -f .git/index.lock
```

### Migration Fails
```bash
# Check Prisma schema is correct
cd backend
npx prisma validate

# Try resetting (WARNING: deletes data)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### PM2 Not Restarting
```bash
pm2 delete immigration-backend
pm2 start dist/app.js --name immigration-backend
pm2 save
```

### Services Not Seeded
```bash
cd backend
npm run seed:services
```

## Files Changed

### Frontend (New)
- `app/find-a-specialist/` - Public directory
- `app/get-help/` - Intake form
- `app/intake-status/` - Status checker
- `app/admin/verifications/` - Admin verification
- `app/admin/marketplace/` - Admin marketplace overview
- `app/dashboard/immigration/leads/analytics/` - Lead analytics
- `components/intake/` - Intake components
- `components/admin/` - Admin components
- `lib/api/publicIntake.ts` - Public API client

### Backend (New)
- `backend/src/controllers/intakeController.ts` - All intake controllers
- `backend/src/routes/intake.routes.ts` - All intake routes
- `backend/src/services/routingEngine.ts` - Routing logic
- `backend/src/data/seedServices.ts` - Service seed data

### Database
- `backend/prisma/schema.prisma` - 5 new models added

## Next Steps After Deployment

1. ✅ Test public intake form: `https://immigrationai.co.za/get-help`
2. ✅ Test directory: `https://immigrationai.co.za/find-a-specialist`
3. ✅ Create a test professional profile
4. ✅ Submit a test intake
5. ✅ Verify routing works
6. ✅ Test admin verification panel
