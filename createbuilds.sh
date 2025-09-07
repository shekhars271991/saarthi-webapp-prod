#!/bin/bash

# SaarthiEV Docker Build & Upload Script
# This script builds Docker images locally and uploads to EC2

echo "🚀 Building SaarthiEV Docker images and uploading to EC2..."
echo ""

# Configuration - UPDATE THESE VALUES
EC2_IP="13.127.245.117"
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

echo "📤 Uploading project files to EC2..."

# Upload entire project (Docker will build on EC2)
rsync -avz --progress -e "ssh -i $PEM_FILE" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude '*.log' \
    ./ $EC2_USER@$EC2_IP:$EC2_PROJECT_PATH/

echo ""
echo "✅ Upload complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. SSH into your EC2: ssh -i $PEM_FILE $EC2_USER@$EC2_IP"
echo "   2. Go to project directory: cd $EC2_PROJECT_PATH"
echo "   3. Update environment: nano .env.docker"
echo "   4. Run deployment: ./deploy.sh"
echo ""
echo "📍 Your services will be available at:"
echo "   Backend API:  http://$EC2_IP:4000"
echo "   Frontend App: http://$EC2_IP:3000"
echo ""
