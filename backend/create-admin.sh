#!/bin/bash
# Create admin user - tries local first, then remote (Hetzner)
# Usage: ./create-admin.sh [email] [password]

set -e

cd "$(dirname "$0")"

EMAIL="${1:-Admin@immigrationai.co.za}"
PASSWORD="${2:-Admin123!}"

echo ""
echo "🔐 Immigration AI - Create Admin User"
echo "   Email: $EMAIL"
echo ""

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Validate DATABASE_URL format (needs user:pass@host/db)
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" =~ postgresql://[^:]+:[^@]+@[^/]+/[^?]+ ]]; then
  echo "✅ DATABASE_URL looks valid"
  echo ""
  node create-admin-user.js "$EMAIL" "$PASSWORD"
  exit $?
fi

# DATABASE_URL missing or invalid
echo "⚠️  DATABASE_URL is missing or invalid in .env"
echo ""
echo "   Current: ${DATABASE_URL:-'(not set)'}"
echo ""
echo "   You have two options:"
echo ""
echo "   OPTION 1 - Run on Hetzner server (recommended if DB is there):"
echo "   ./create-admin-remote.sh $EMAIL 'your-password'"
echo ""
echo "   OPTION 2 - Use local PostgreSQL:"
echo "   1. Install: sudo apt install postgresql"
echo "   2. Create DB: sudo -u postgres createdb immigration_ai"
echo "   3. Add to .env:"
echo "      DATABASE_URL=\"postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/immigration_ai?schema=public\""
echo "   4. Run: node create-admin-user.js $EMAIL 'your-password'"
echo ""
echo "   OPTION 3 - Get DATABASE_URL from Hetzner server:"
echo "   ssh root@78.46.183.41 'cat /var/www/*/backend/.env 2>/dev/null | grep DATABASE_URL || cat /opt/*/backend/.env 2>/dev/null | grep DATABASE_URL'"
echo "   Copy the output to your local .env file"
echo ""
exit 1
