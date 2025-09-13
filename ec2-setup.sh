#!/bin/bash

# SaarthiEV EC2 Setup Script
# This script sets up the complete environment on a fresh Ubuntu EC2 instance

echo "🚀 Setting up SaarthiEV on EC2..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using MongoDB Atlas - no local MongoDB installation needed
echo "🗄️  MongoDB Atlas will be used for database..."
echo "✅ No local MongoDB installation required"

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx (optional - for reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/saarthi
sudo chown -R $USER:$USER /var/www/saarthi

echo ""
echo "✅ System setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/saarthi"
echo "2. Run the deployment script"
echo ""
