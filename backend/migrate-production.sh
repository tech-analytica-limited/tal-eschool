#!/bin/bash

# Database Migration Script for Production
# Run this from your local machine before deploying

echo "🚀 TAL-Eschool Database Migration Script"
echo "=========================================="
echo ""

# Production database URL
export DATABASE_URL="postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public"

echo "📦 Database: 31.97.190.200:37860"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from backend directory"
    exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations completed successfully"
echo ""

# Seed database
echo "🌱 Seeding demo data..."
npx prisma db seed

if [ $? -ne 0 ]; then
    echo "❌ Seeding failed!"
    exit 1
fi

echo "✅ Database seeded successfully"
echo ""
echo "🎉 Database is ready for deployment!"
echo ""
echo "Test accounts created:"
echo "  Super Admin: superadmin@xyz.com / Admin@123"
echo "  School Admin: admin@abc.com / Admin@123"
echo "  Teacher: teacher1@abc.com / Teacher@123"
