#!/bin/bash
# Create admin user on Hetzner server (where database is reachable)
# Usage: ./create-admin-remote.sh [email] [password]
# Example: ./create-admin-remote.sh Admin@immigrationai.co.za 'Admin123!'

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HETZNER_IP="78.46.183.41"
HETZNER_USER="root"
EMAIL="${1:-Admin@immigrationai.co.za}"
PASSWORD="${2:-Admin123!}"

echo ""
echo "🚀 Creating admin user on Hetzner server ($HETZNER_IP)..."
echo "   Email: $EMAIL"
echo ""

# Allow manual override: BACKEND_PATH=/var/www/immigrationai/backend ./create-admin-remote.sh ...
if [ -n "$BACKEND_PATH" ]; then
  :
else
# Find backend directory on server (where .env with DATABASE_URL exists)
BACKEND_PATH=$(ssh ${HETZNER_USER}@${HETZNER_IP} "find /opt /var/www /root /home -name 'schema.prisma' -path '*/prisma/*' -type f 2>/dev/null | head -1 | xargs dirname | xargs dirname" 2>/dev/null || true)

if [ -z "$BACKEND_PATH" ]; then
  BACKEND_PATH=$(ssh ${HETZNER_USER}@${HETZNER_IP} "find /opt /var/www /root /home -name 'create-admin-user.js' -type f 2>/dev/null | head -1 | xargs dirname" 2>/dev/null || true)
fi

if [ -z "$BACKEND_PATH" ]; then
  # Known deployment paths from project docs
  for path in /var/www/immigrationai/backend /var/www/immigration_ai/backend /opt/immigration_ai/backend /root/immigration_ai/backend; do
    if ssh ${HETZNER_USER}@${HETZNER_IP} "test -d ${path} && (test -f ${path}/prisma/schema.prisma || test -f ${path}/create-admin-user.js)" 2>/dev/null; then
      BACKEND_PATH="$path"
      break
    fi
  done
fi

fi

if [ -z "$BACKEND_PATH" ]; then
    echo "❌ Could not find backend on server."
    echo ""
    echo "   Run: ssh ${HETZNER_USER}@${HETZNER_IP}"
    echo "   Then: find / -name 'schema.prisma' 2>/dev/null"
    echo ""
    echo "   Or: BACKEND_PATH=/var/www/immigrationai/backend ./create-admin-remote.sh $EMAIL 'password'"
    exit 1
fi

echo "✅ Found backend at: $BACKEND_PATH"
echo ""

# Copy create-admin-user.js to server if not present (ensures we have latest)
scp -q "${SCRIPT_DIR}/create-admin-user.js" ${HETZNER_USER}@${HETZNER_IP}:${BACKEND_PATH}/create-admin-user.js 2>/dev/null || true

echo "🔐 Running create-admin-user.js..."
echo ""

ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${BACKEND_PATH} && node create-admin-user.js '${EMAIL}' '${PASSWORD}'"

echo ""
echo "✅ Done! Log in at https://immigrationai.co.za/auth/login"
echo ""
