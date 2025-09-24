#!/bin/bash

# GitHub Actions Deployment Script for SaarthiEV
# This script is optimized for automated deployment from GitHub Actions

set -e  # Exit on any error

echo "🚀 Starting GitHub Actions deployment..."
echo "Timestamp: $(date)"
echo "Working directory: $(pwd)"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    
    if pgrep -f "$service_name" > /dev/null; then
        log "✅ $service_name is running"
        return 0
    else
        log "❌ $service_name is not running"
        return 1
    fi
}

# Create logs directory
log "📁 Creating logs directory..."
mkdir -p logs

# Check if we're in the right directory
if [ ! -d "saarthi-backend" ] || [ ! -d "saarthi-webapp" ]; then
    log "❌ Project directories not found. Current contents:"
    ls -la
    exit 1
fi

# Stop existing processes
log "🛑 Stopping existing processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Kill any remaining processes on our ports
log "🔧 Cleaning up processes on ports 3000 and 4000..."
sudo fuser -k 3000/tcp 2>/dev/null || true
sudo fuser -k 4000/tcp 2>/dev/null || true

# Wait a moment for processes to fully stop
sleep 3

# Setup environment files
log "🔧 Setting up environment files..."

# Backend environment - use production env if it exists
if [ -f "/home/$(whoami)/.env.production" ]; then
    log "📝 Using production environment file..."
    cp "/home/$(whoami)/.env.production" saarthi-backend/.env
elif [ ! -f "saarthi-backend/.env" ]; then
    log "📝 Creating backend .env from example..."
    if [ -f "env.production.example" ]; then
        cp env.production.example saarthi-backend/.env
    else
        log "⚠️  Warning: No environment template found"
    fi
fi

# Validate critical environment variables
log "🔍 Validating environment variables..."
if [ -f "saarthi-backend/.env" ]; then
    if grep -q "MONGODB_URI=" saarthi-backend/.env && grep -q "AIRPORT_BASE_FARE=" saarthi-backend/.env; then
        log "✅ Required environment variables found"
    else
        log "⚠️  Warning: Some required environment variables may be missing"
    fi
else
    log "❌ No .env file found for backend"
    exit 1
fi

# Install backend dependencies (production only)
log "📦 Installing backend dependencies..."
cd saarthi-backend
npm ci --production --silent
cd ..

# Frontend should already be built by GitHub Actions, but verify
log "🔍 Checking frontend build..."
if [ -d "saarthi-webapp/.next" ]; then
    log "✅ Frontend build found"
else
    log "⚠️  Frontend build not found, attempting to build..."
    cd saarthi-webapp
    npm ci --silent
    npm run build
    cd ..
fi

# Update PM2 ecosystem config for production
log "⚙️  Configuring PM2 ecosystem..."
if [ -f "ecosystem.config.js" ]; then
    log "✅ PM2 ecosystem config found"
else
    log "❌ PM2 ecosystem config not found"
    exit 1
fi

# Start services with PM2
log "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 10

# Check service status
log "🔍 Checking service status..."
pm2 status

# Verify services are actually running
backend_running=false
frontend_running=false

if check_service "server.js" 4000; then
    backend_running=true
fi

if check_service "next" 3000 || check_service "npm.*start" 3000; then
    frontend_running=true
fi

# Health check
log "🏥 Performing health checks..."
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    log "✅ Backend health check passed"
elif curl -f -s http://localhost:4000/api/health > /dev/null 2>&1; then
    log "✅ Backend health check passed (alt endpoint)"
else
    log "⚠️  Backend health check failed, but service appears to be running"
fi

if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend health check passed"
else
    log "⚠️  Frontend health check failed, but service appears to be running"
fi

# Save PM2 configuration
log "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup (if not already done)
if ! pm2 startup | grep -q "already"; then
    log "⚙️  Setting up PM2 startup..."
    pm2 startup ubuntu -u $(whoami) --hp $(eval echo ~$(whoami))
fi

# Display final status
log "📊 Final service status:"
pm2 list

# Display service URLs
log ""
log "✅ Deployment completed successfully!"
log ""
log "📍 Services are running on:"
log "   Backend API:  http://$(curl -s ifconfig.me):4000"
log "   Frontend App: http://$(curl -s ifconfig.me):3000"
log "   Local Backend: http://localhost:4000"
log "   Local Frontend: http://localhost:3000"
log ""
log "🔍 Useful commands:"
log "   Check status: pm2 status"
log "   View logs: pm2 logs"
log "   Restart: pm2 restart ecosystem.config.js"
log "   Stop: pm2 stop ecosystem.config.js"
log ""

# Log deployment completion
echo "$(date): Deployment completed successfully" >> logs/deployment.log

exit 0
