#!/bin/bash

# Run Prisma Migration for Multi-Tenant Models
# Run this on your Hetzner server where DATABASE_URL is configured

set -e

# Navigate to backend directory (where script is located)
cd "$(dirname "$0")"

echo "🔧 Running Prisma Migration for Multi-Tenant Models..."

# Load .env file if it exists (handle comments and empty lines)
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    set -a
    source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /')
    set +a
    echo "✅ .env file loaded"
else
    echo "⚠️  No .env file found"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please add DATABASE_URL to your .env file:"
    echo "  DATABASE_URL=postgresql://user:password@host:5432/database"
    echo ""
    echo "Or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@host:5432/database'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

echo "📦 Step 1: Running Prisma migration..."
npx prisma migrate dev --name add_multi_tenant_models

echo "✅ Step 2: Generating Prisma Client..."
npx prisma generate

echo "✅ Migration complete!"
echo ""
echo "📊 Verify in Prisma Studio:"
echo "  npx prisma studio"
echo ""
echo "Expected new tables:"
echo "  - organizations"
echo "  - cases"
echo "  - case_documents"
echo "  - tasks"
echo "  - messages"
echo "  - document_checklists"
echo "  - checklist_items"
echo "  - audit_logs"
echo ""
echo "Updated tables:"
echo "  - users (added: organization_id, phone, avatar_url, is_active)"
echo "  - subscriptions (changed: user_id → organization_id)"
