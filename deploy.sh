#!/bin/bash

# SaarthiEV Docker Deployment Script for EC2
# Run this script on EC2 after uploading files with createbuilds.sh

echo "🚀 Deploying SaarthiEV with Docker on EC2..."
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml not found. Please run this script from the project root directory"
    exit 1
fi

# Check if Docker is installed and running
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "⚠️  Please log out and log back in for Docker permissions to take effect"
    echo "⚠️  Then run this script again"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "🔧 Starting Docker..."
    sudo systemctl start docker
fi

echo "✅ Docker is ready"

# Check if environment file exists
if [ ! -f ".env.docker" ]; then
    echo "📝 Creating Docker environment file..."
    cat > .env.docker << 'ENVEOF'
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
ENVEOF
    echo "⚠️  Please edit .env.docker with your actual values"
    echo "⚠️  Run: nano .env.docker"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.docker down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📊 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your services should be running on:"
echo "   Backend API:  http://localhost:4000"
echo "   Frontend App: http://localhost:3000"
echo "   MongoDB:      localhost:27017"
echo ""
echo "🔍 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
echo ""
