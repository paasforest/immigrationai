#!/bin/bash

# Setup .env file with DATABASE_URL
# Run this to configure your database connection

set -e

cd "$(dirname "$0")"

echo "🔧 Setting up .env file for database connection..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating new .env file..."
    touch .env
fi

# Check if DATABASE_URL already exists
if grep -q "DATABASE_URL" .env; then
    echo "⚠️  DATABASE_URL already exists in .env"
    echo ""
    echo "Current DATABASE_URL:"
    grep DATABASE_URL .env
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing DATABASE_URL"
        exit 0
    fi
    # Remove old DATABASE_URL line
    sed -i '/^DATABASE_URL=/d' .env
fi

echo ""
echo "📍 Where is your database located?"
echo ""
echo "1) Local PostgreSQL (localhost)"
echo "2) Hetzner Server (remote)"
echo "3) Supabase (cloud)"
echo "4) Other (manual entry)"
echo ""
read -p "Choose option (1-4): " db_option

case $db_option in
    1)
        echo ""
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
    2)
        echo ""
        echo "Enter your Hetzner database connection details:"
        read -p "Database host (IP or domain): " db_host
        read -p "Database port [5432]: " db_port
        db_port=${db_port:-5432}
        read -p "Database name: " db_name
        read -p "Database user: " db_user
        read -p "Database password: " -s db_password
        echo ""
        
        DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
        ;;
    3)
        echo ""
        echo "Enter your Supabase connection string:"
        echo "You can find this in Supabase Dashboard > Settings > Database > Connection string"
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

# Add DATABASE_URL to .env
echo "" >> .env
echo "# Database Connection" >> .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env

echo ""
echo "✅ DATABASE_URL added to .env file"
echo ""
echo "📋 Current DATABASE_URL:"
echo "   ${DATABASE_URL}"
echo ""
echo "🔒 Note: Password is hidden for security"
echo ""
echo "🚀 You can now run: ./run-migration.sh"
