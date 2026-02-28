#!/bin/bash
# ============================================================
# ImmigrationAI — Production Deploy & Seed Script
# Run this on the Hetzner server after pulling new code.
# ============================================================
# Usage:
#   chmod +x scripts/deploy-and-seed.sh
#   ./scripts/deploy-and-seed.sh
#
# What it does:
#   1. Pulls latest code from origin/main
#   2. Installs dependencies
#   3. Generates Prisma client
#   4. Runs pending database migrations
#   5. Seeds the Visa Requirements (upsert — safe to re-run)
#   6. Seeds the Service Catalog
#   7. Builds TypeScript
#   8. Restarts PM2

set -e  # Exit on any error

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  ImmigrationAI — Production Deploy & Seed         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# ── 1. Pull latest code ────────────────────────────────────
echo "📥  Pulling latest code..."
git pull origin main

# ── 2. Install dependencies ────────────────────────────────
echo "📦  Installing backend dependencies..."
cd backend
npm install --production=false

echo "📦  Installing frontend dependencies..."
cd ..
npm install

# ── 3. Prisma generate + migrate ──────────────────────────
echo "🔧  Generating Prisma client..."
cd backend
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# ── 4. Seed Visa Requirements ──────────────────────────────
echo "🌱  Seeding Visa Requirements (30 routes)..."
npx ts-node --project tsconfig.json prisma/seed-visa-requirements.ts

# ── 5. Seed Service Catalog ────────────────────────────────
echo "🌱  Seeding Service Catalog..."
npx ts-node --project tsconfig.json src/data/seedServices.ts

# ── 6. Build backend TypeScript ────────────────────────────
echo "🔨  Building backend TypeScript..."
npm run build

# ── 7. Build frontend (Next.js) ────────────────────────────
echo "🔨  Building frontend..."
cd ..
npm run build

# ── 8. Restart PM2 ────────────────────────────────────────
echo "♻️  Restarting PM2..."
pm2 restart all --update-env

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  ✅  Deploy + Seed complete!                       ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
pm2 status
