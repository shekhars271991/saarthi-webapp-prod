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

# Using MongoDB Atlas - no local MongoDB installation needed
echo "🗄️  Using MongoDB Atlas cloud database..."
echo "✅ MongoDB Atlas configured in environment variables"

# Check and install Node.js if needed
echo "🟢 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    
    # Install Node.js 18 using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "✅ Node.js installed"
else
    echo "✅ Node.js is already installed ($(node --version))"
fi

# Check and install PM2 if needed
echo "⚙️  Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 is already installed"
fi

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
    echo "⚠️  Make sure to set MongoDB Atlas connection string in .env file"
else
    echo "✅ MongoDB Atlas connection string found in .env file"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd saarthi-backend
npm install --production
cd ..

# Check if frontend is already built (from local build)
echo "🔍 Checking frontend build..."
if [ -d "saarthi-webapp/.next/standalone" ]; then
    echo "✅ Frontend already built locally, skipping build step"
else
    echo "📦 Installing frontend dependencies..."
    cd saarthi-webapp
    npm install
    echo "🏗️  Building frontend for production..."
    npm run build
    cd ..
fi

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
echo "   4. Ensure MongoDB Atlas cluster is accessible from your EC2 instance"
echo ""
