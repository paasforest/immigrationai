#!/bin/bash

# Quick script to add DATABASE_URL to .env file
# Run this to configure your database connection

cd "$(dirname "$0")"

echo "🔧 Adding DATABASE_URL to .env file..."
echo ""

# Check if DATABASE_URL already exists
if [ -f .env ] && grep -q "DATABASE_URL" .env; then
    echo "⚠️  DATABASE_URL already exists in .env"
    echo ""
    echo "Current value:"
    grep DATABASE_URL .env
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing DATABASE_URL"
        exit 0
    fi
    # Remove old DATABASE_URL line
    sed -i '/^DATABASE_URL=/d' .env
fi

echo ""
echo "📍 Where is your database?"
echo ""
echo "1) Hetzner Server (production database)"
echo "2) Local PostgreSQL (localhost)"
echo "3) Supabase (cloud)"
echo "4) Enter manually"
echo ""
read -p "Choose (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Enter your Hetzner database connection:"
        read -p "Host (IP or domain): " host
        read -p "Port [5432]: " port
        port=${port:-5432}
        read -p "Database name: " dbname
        read -p "Username: " username
        read -p "Password: " -s password
        echo ""
        DATABASE_URL="postgresql://${username}:${password}@${host}:${port}/${dbname}"
        ;;
    2)
        echo ""
        echo "Local PostgreSQL setup:"
        read -p "Database name [immigration_ai]: " dbname
        dbname=${dbname:-immigration_ai}
        read -p "Username [postgres]: " username
        username=${username:-postgres}
        read -p "Password: " -s password
        echo ""
        read -p "Host [localhost]: " host
        host=${host:-localhost}
        read -p "Port [5432]: " port
        port=${port:-5432}
        DATABASE_URL="postgresql://${username}:${password}@${host}:${port}/${dbname}"
        ;;
    3)
        echo ""
        echo "Enter your Supabase connection string:"
        echo "(Found in Supabase Dashboard > Settings > Database)"
        read -p "Connection string: " DATABASE_URL
        ;;
    4)
        echo ""
        read -p "Enter full DATABASE_URL: " DATABASE_URL
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Ensure .env file exists
if [ ! -f .env ]; then
    touch .env
fi

# Add DATABASE_URL to .env
echo "" >> .env
echo "# Database Connection" >> .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env

echo ""
echo "✅ DATABASE_URL added to .env"
echo ""
echo "📋 Added: DATABASE_URL=\"${DATABASE_URL}\""
echo ""
echo "🔒 Password is hidden for security"
echo ""
echo "🚀 Now you can run: ./run-migration.sh"
