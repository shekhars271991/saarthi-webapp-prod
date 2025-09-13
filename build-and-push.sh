#!/bin/bash

# SaarthiEV Local Build & Push Script
# This script builds the project locally and pushes to EC2

echo "🚀 Building SaarthiEV locally and pushing to EC2..."
echo ""

# Configuration - UPDATE THESE VALUES
EC2_IP="13.201.32.216"
EC2_USER="ubuntu"
PEM_FILE="saarthi.pem"  # Update with your actual .pem file path
EC2_PROJECT_PATH="/home/ubuntu/saarthi-webapp-prod"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file '$PEM_FILE' not found. Please update the PEM_FILE variable in this script."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "saarthi-backend" ] || [ ! -d "saarthi-webapp" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build frontend locally
echo "🏗️ Building frontend locally..."
cd saarthi-webapp

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build the frontend
echo "⚡ Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

cd ..

# Check if backend dependencies are installed
echo "🔍 Checking backend dependencies..."
cd saarthi-backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install --production
fi
cd ..

echo "📤 Pushing project files to EC2..."

# Push all project files including built .next folder
rsync -avz --progress -e "ssh -i $PEM_FILE" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env*' \
    --exclude 'logs' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'build-and-push.sh' \
    ./ $EC2_USER@$EC2_IP:$EC2_PROJECT_PATH/

echo ""
echo "✅ Build and push complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. SSH into your EC2: ssh -i $PEM_FILE $EC2_USER@$EC2_IP"
echo "   2. Go to project directory: cd $EC2_PROJECT_PATH"
echo "   3. Update environment files if needed"
echo "   4. Run deployment: ./deploy.sh"
echo ""
echo "📍 Your services will be available at:"
echo "   Backend API:  http://$EC2_IP:4000"
echo "   Frontend App: http://$EC2_IP:3000"
echo ""
