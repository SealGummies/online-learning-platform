#!/bin/bash

# Setup script for Online Learning Platform
# This script helps new developers quickly set up their development environment

echo "🚀 Setting up Online Learning Platform Development Environment"
echo "============================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14+) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Setting up environment variables..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  IMPORTANT: Please edit backend/.env with your actual configuration:"
    echo "   - Database connection string (MongoDB URI)"
    echo "   - JWT secret key"
    echo "   - Other settings as needed"
    echo ""
    echo "📖 For detailed configuration instructions, see backend/README.md"
else
    echo "✅ .env file already exists"
fi

# Test database connection
echo "🔗 Testing database connection..."
if npm run test-db 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed - please check your MongoDB setup"
    echo "   Local MongoDB: Make sure MongoDB is running locally"
    echo "   MongoDB Atlas: Check your connection string in .env"
fi

# Seed database
echo "🌱 Seeding database with sample data..."
if npm run seed 2>/dev/null; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Database seeding failed - please check your database connection"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3761 to access the API"
echo ""
echo "📚 For more information, see README.md"
