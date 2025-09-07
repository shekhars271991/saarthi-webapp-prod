#!/bin/bash

# SaarthiEV Deployment Script for EC2
# Run this script after cloning your repository

echo "🚀 Deploying SaarthiEV to production..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "saarthi-backend" ] && [ ! -d "saarthi-webapp" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Setup environment files
echo "🔧 Setting up environment files..."

# Backend environment
if [ ! -f "saarthi-backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp env.production.example saarthi-backend/.env
    echo "⚠️  Please edit saarthi-backend/.env with your actual values"
    echo "⚠️  Make sure to update MONGODB_URI and other variables"
fi

# Frontend environment
if [ ! -f "saarthi-webapp/.env.local" ]; then
    echo "📝 Creating frontend .env file..."
    cp env.production.example saarthi-webapp/.env.local
    echo "⚠️  Please edit saarthi-webapp/.env.local with your actual values"
    echo "⚠️  Make sure to update NEXT_PUBLIC_API_URL with your EC2 IP"
fi

# Validate backend environment
echo "🔍 Validating backend environment..."
if ! grep -q "MONGODB_URI=" saarthi-backend/.env; then
    echo "⚠️  Warning: MONGODB_URI not found in backend .env file"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd saarthi-backend
npm install --production
cd ..

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd saarthi-webapp
npm install
echo "🏗️  Building frontend for production..."
npm run build
cd ..

# Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start services with PM2
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

# Wait a moment for services to start
sleep 5

# Check service status
echo "🔍 Checking service status..."
pm2 status

# Save PM2 configuration
pm2 save
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your services should be running on:"
echo "   Backend API:  http://localhost:4000"
echo "   Frontend App: http://localhost:3000"
echo ""
echo "🔍 Check status with: pm2 status"
echo "📊 View logs with: pm2 logs"
echo "🔄 Restart with: pm2 restart ecosystem.config.js"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update your .env files with actual values"
echo "   2. Configure your EC2 security groups (ports 3000, 4000)"
echo "   3. Set up a domain name and SSL certificate"
echo ""
