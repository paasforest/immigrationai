#!/bin/bash

# Fix .env file ownership and set up DATABASE_URL
# Run this first to fix permissions, then configure database

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing .env file and setting up DATABASE_URL..."
echo ""

# Fix ownership (if needed)
if [ -f .env ]; then
    echo "📝 Fixing .env file ownership..."
    sudo chown $USER:$USER .env 2>/dev/null || {
        echo "⚠️  Could not change ownership. You may need to run:"
        echo "   sudo chown $USER:$USER .env"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
fi

# Check if DATABASE_URL exists
if [ -f .env ] && grep -q "^DATABASE_URL" .env; then
    echo "⚠️  DATABASE_URL already exists"
    grep "^DATABASE_URL" .env
    echo ""
    read -p "Replace it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old DATABASE_URL
        sed -i '/^DATABASE_URL=/d' .env
    else
        echo "Keeping existing DATABASE_URL"
        exit 0
    fi
fi

echo ""
echo "📍 Where is your database located?"
echo ""
echo "1) Hetzner Server (production - remote)"
echo "2) Local PostgreSQL (localhost)"
echo "3) Supabase (cloud)"
echo "4) Enter connection string manually"
echo ""
read -p "Choose option (1-4): " db_option

case $db_option in
    1)
        echo ""
        echo "Enter your Hetzner database connection details:"
        echo "(You can find these on your Hetzner server in backend/.env)"
        read -p "Database host (IP or domain): " db_host
        read -p "Database port [5432]: " db_port
        db_port=${db_port:-5432}
        read -p "Database name: " db_name
        read -p "Database user: " db_user
        read -p "Database password: " -s db_password
        echo ""
        DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
        ;;
    2)
        echo ""
        echo "Local PostgreSQL setup:"
        read -p "Database name [immigration_ai]: " db_name
        db_name=${db_name:-immigration_ai}
        read -p "Database user [postgres]: " db_user
        db_user=${db_user:-postgres}
        read -p "Database password: " -s db_password
        echo ""
        read -p "Database host [localhost]: " db_host
        db_host=${db_host:-localhost}
        read -p "Database port [5432]: " db_port
        db_port=${db_port:-5432}
        DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
        ;;
    3)
        echo ""
        echo "Enter your Supabase connection string:"
        echo "(Found in Supabase Dashboard > Settings > Database > Connection string)"
        read -p "Connection string: " DATABASE_URL
        ;;
    4)
        echo ""
        read -p "Enter full DATABASE_URL: " DATABASE_URL
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

# Ensure .env file exists and is writable
if [ ! -f .env ]; then
    touch .env
    chmod 644 .env
fi

# Add DATABASE_URL to .env
echo "" >> .env
echo "# Database Connection" >> .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env

echo ""
echo "✅ DATABASE_URL added to .env file!"
echo ""
echo "📋 Added:"
echo "   DATABASE_URL=\"${DATABASE_URL}\""
echo ""
echo "🔒 Password is hidden for security"
echo ""
echo "✅ Setup complete! You can now run:"
echo "   ./run-migration.sh"
