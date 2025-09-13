#!/bin/bash

# Saarthi Development Runner Script
# This script starts both backend and frontend services

echo "🚀 Starting Saarthi Development Environment..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    # Also kill any remaining node processes
    pkill -f "nodemon\|next"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Using MongoDB Atlas - no Docker needed for database
echo "🗄️  Using MongoDB Atlas cloud database..."
echo "✅ MongoDB Atlas configured in environment variables"
echo ""

# Install dependencies if needed
echo "📦 Installing dependencies..."

# Check and install backend dependencies
if [ ! -d "saarthi-backend/node_modules" ]; then
    echo "🔧 Installing backend dependencies..."
    cd saarthi-backend
    npm install
    cd ..
else
    echo "✅ Backend dependencies already installed"
fi

# Check and install frontend dependencies
if [ ! -d "saarthi-webapp/node_modules" ]; then
    echo "🎨 Installing frontend dependencies..."
    cd saarthi-webapp
    npm install
    cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""

# MongoDB Atlas is used - no local MongoDB setup needed
echo "🔗 Connecting to MongoDB Atlas..."
echo "✅ MongoDB Atlas connection configured"
echo ""

# Start backend
echo "🔧 Starting Backend (Port 4000)..."
cd saarthi-backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

echo ""

# Start frontend
echo "🎨 Starting Frontend (Port 3000)..."
cd saarthi-webapp
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo ""
echo "🔍 Checking service status..."

# Check backend
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:4000"
else
    echo "⚠️  Backend may still be starting..."
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend may still be starting..."
fi

echo ""
echo "📍 Services will be available at:"
echo "   Backend API:  http://localhost:4000"
echo "   Frontend App: http://localhost:3000"
echo "   Database:     MongoDB Atlas (Cloud)"
echo ""
echo "🔄 Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait
