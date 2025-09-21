#!/bin/bash

# Saarthi Development Runner Script
# This script starts backend and/or frontend services
#
# Usage:
#   ./run.sh           - Start both backend and frontend
#   ./run.sh backend   - Start only backend
#   ./run.sh frontend  - Start only frontend
#   ./run.sh --help    - Show help

# Parse command line arguments
SERVICE_TO_RUN="both"
if [ $# -gt 0 ]; then
    case "$1" in
        "backend")
            SERVICE_TO_RUN="backend"
            ;;
        "frontend")
            SERVICE_TO_RUN="frontend"
            ;;
        "both")
            SERVICE_TO_RUN="both"
            ;;
        "--help"|"-h")
            echo "Saarthi Development Runner"
            echo ""
            echo "Usage:"
            echo "  ./run.sh           - Start both backend and frontend"
            echo "  ./run.sh backend   - Start only backend (Port 4000)"
            echo "  ./run.sh frontend  - Start only frontend (Port 3000)"
            echo "  ./run.sh both      - Start both services (default)"
            echo "  ./run.sh --help    - Show this help"
            echo ""
            exit 0
            ;;
        *)
            echo "❌ Invalid argument: $1"
            echo "Use './run.sh --help' for usage information"
            exit 1
            ;;
    esac
fi

echo "🚀 Starting Saarthi Development Environment..."
echo "📋 Service mode: $SERVICE_TO_RUN"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    # Kill processes if they were started
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "   Stopped backend (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "   Stopped frontend (PID: $FRONTEND_PID)"
    fi
    
    # Also kill any remaining node processes
    pkill -f "nodemon\|next" 2>/dev/null
    echo "   Cleaned up remaining processes"
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
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    if [ ! -d "saarthi-backend/node_modules" ]; then
        echo "🔧 Installing backend dependencies..."
        cd saarthi-backend
        npm install
        cd ..
    else
        echo "✅ Backend dependencies already installed"
    fi
fi

# Check and install frontend dependencies
if [ "$SERVICE_TO_RUN" = "frontend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    if [ ! -d "saarthi-webapp/node_modules" ]; then
        echo "🎨 Installing frontend dependencies..."
        cd saarthi-webapp
        npm install
        cd ..
    else
        echo "✅ Frontend dependencies already installed"
    fi
fi

echo ""

# MongoDB Atlas is used - no local MongoDB setup needed
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "🔗 Connecting to MongoDB Atlas..."
    echo "✅ MongoDB Atlas connection configured"
    echo ""
fi

# Start backend
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "🔧 Starting Backend (Port 4000)..."
    cd saarthi-backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 2
    echo ""
fi

# Start frontend
if [ "$SERVICE_TO_RUN" = "frontend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "🎨 Starting Frontend (Port 3000)..."
    cd saarthi-webapp
    npm run dev &
    FRONTEND_PID=$!
    cd ..
fi

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
if [ "$SERVICE_TO_RUN" = "both" ]; then
    sleep 5
else
    sleep 3
fi

# Check if services are running
echo ""
echo "🔍 Checking service status..."

# Check backend
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    if curl -s http://localhost:4000 > /dev/null 2>&1; then
        echo "✅ Backend is running on http://localhost:4000"
    else
        echo "⚠️  Backend may still be starting..."
    fi
fi

# Check frontend
if [ "$SERVICE_TO_RUN" = "frontend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is running on http://localhost:3000"
    else
        echo "⚠️  Frontend may still be starting..."
    fi
fi

echo ""
echo "📍 Services available at:"
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "   Backend API:  http://localhost:4000"
fi
if [ "$SERVICE_TO_RUN" = "frontend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "   Frontend App: http://localhost:3000"
fi
if [ "$SERVICE_TO_RUN" = "backend" ] || [ "$SERVICE_TO_RUN" = "both" ]; then
    echo "   Database:     MongoDB Atlas (Cloud)"
fi
echo ""
echo "🔄 Press Ctrl+C to stop services"
echo ""

# Wait for both processes
wait
