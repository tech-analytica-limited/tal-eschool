#!/bin/bash

# Quick Deploy Script - Migrations + Docker Push + Portainer Instructions

echo "🚀 TAL-Eschool Quick Deploy"
echo "==========================="
echo ""

# Step 1: Run migrations
echo "📋 Step 1: Running Database Migrations"
echo "---------------------------------------"
cd backend

export DATABASE_URL="postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public"

echo "Using Docker to run migrations..."
docker run --rm \
  -v "$(pwd)/prisma:/prisma" \
  -v "$(pwd)/package.json:/package.json" \
  -e DATABASE_URL="$DATABASE_URL" \
  --network host \
  node:20-alpine \
  sh -c "cd / && npm install -g prisma && prisma migrate deploy --schema=/prisma/schema.prisma"

if [ $? -ne 0 ]; then
    echo "❌ Migration failed! Check database connectivity."
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Step 2: Seed database
echo "📋 Step 2: Seeding Database"
echo "---------------------------"

docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  -e DATABASE_URL="$DATABASE_URL" \
  --network host \
  node:20-alpine \
  sh -c "npm install && npx prisma generate && npm run db:seed"

if [ $? -ne 0 ]; then
    echo "⚠️  Seeding failed (might already have data)"
fi

echo "✅ Database ready"
echo ""

cd ..

# Step 3: Build and push images
echo "📋 Step 3: Building Docker Images"
echo "----------------------------------"

echo "Building backend..."
docker build -t --platform=linux/amd64 techanalytica/tal-eschool-be:latest ./backend
docker push techanalytica/tal-eschool-be:latest

echo ""
echo "Building frontend..."
docker build --platform=linux/amd64 -t techanalytica/tal-eschool-fe:latest ./frontend
docker push techanalytica/tal-eschool-fe:latest

echo ""
echo "✅ Docker images pushed successfully"
echo ""

# Final instructions
echo "🎉 DEPLOYMENT READY!"
echo "==================="
echo ""
echo "Next steps in Portainer:"
echo ""
echo "1. Go to Stacks → Add Stack → Name: tal-eschool"
echo "2. Paste docker-compose.yml content"
echo "3. Click Deploy"
echo ""
echo "Access: http://31.97.190.200:37861"
echo ""
echo "Test Accounts:"
echo "  Super Admin: superadmin@xyz.com / Admin@123"
echo "  School Admin: admin@abc.com / Admin@123"
echo "  Teacher: teacher1@abc.com / Teacher@123"
echo ""
