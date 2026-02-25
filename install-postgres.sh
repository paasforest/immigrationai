#!/bin/bash

echo "🚀 Immigration AI - PostgreSQL Setup Script"
echo "============================================"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if container already exists
    if docker ps -a | grep -q immigration-db; then
        echo "⚠️  PostgreSQL container already exists"
        echo ""
        read -p "Do you want to remove and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker stop immigration-db 2>/dev/null
            docker rm immigration-db 2>/dev/null
            echo "✅ Old container removed"
        else
            echo "Keeping existing container. Starting it..."
            docker start immigration-db
            echo "✅ Container started"
            exit 0
        fi
    fi
    
    echo ""
    echo "🐳 Starting PostgreSQL in Docker..."
    docker run --name immigration-db \
      -e POSTGRES_USER=immigration_user \
      -e POSTGRES_PASSWORD=dev_password_123 \
      -e POSTGRES_DB=immigration_ai \
      -p 5432:5432 \
      -d postgres:15
    
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL container started successfully!"
        echo ""
        echo "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: immigration_ai"
        echo "  User: immigration_user"
        echo "  Password: dev_password_123"
        echo ""
        echo "DATABASE_URL=\"postgresql://immigration_user:dev_password_123@localhost:5432/immigration_ai\""
        echo ""
        echo "📝 Next steps:"
        echo "1. Copy the DATABASE_URL above to backend/.env"
        echo "2. Run: cd backend && npx prisma db push"
        echo "3. Run: npm run dev"
        exit 0
    else
        echo "❌ Failed to start PostgreSQL container"
        exit 1
    fi
    
else
    echo "❌ Docker is not installed"
    echo ""
    echo "Choose an option:"
    echo ""
    echo "1. Install Docker (recommended - fastest setup):"
    echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "   sudo sh get-docker.sh"
    echo "   Then run this script again"
    echo ""
    echo "2. Install PostgreSQL locally:"
    echo "   sudo apt update"
    echo "   sudo apt install postgresql postgresql-contrib"
    echo "   sudo systemctl start postgresql"
    echo "   sudo -u postgres psql -c \"CREATE DATABASE immigration_ai;\""
    echo "   sudo -u postgres psql -c \"CREATE USER immigration_user WITH PASSWORD 'dev_password_123';\""
    echo "   sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE immigration_ai TO immigration_user;\""
    echo ""
    exit 1
fi


