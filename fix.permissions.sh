#!/bin/bash
set -e

echo "=== Fixing file permissions ==="

# Make sure script is executable
chmod +x "$0"

# Fix permissions for shell scripts
find . -name "*.sh" -type f -exec chmod +x {} \;

# Fix permissions for backend scripts
if [ -d "backend" ]; then
  echo "Fixing backend script permissions..."
  find backend -name "*.sh" -type f -exec chmod +x {} \;
fi

# Fix permissions for Node.js scripts (if they have shebang)
find . -name "*.js" -type f -exec grep -l "^#!/" {} \; | xargs -r chmod +x

# Fix common permission issues
echo "Setting directory permissions..."
find . -type d -exec chmod 755 {} \;

echo "Setting file permissions..."
find . -type f -exec chmod 644 {} \;

# Make specific important files executable
[ -f "deploy-backend.sh" ] && chmod +x deploy-backend.sh
[ -f "backend/fix-typescript-errors.sh" ] && chmod +x backend/fix-typescript-errors.sh
[ -f "backend/fix-and-setup-env.sh" ] && chmod +x backend/fix-and-setup-env.sh

echo "✅ Permissions fixed!"
