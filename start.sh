#!/bin/bash

# PetCare Application Startup Script

echo "🐾 Starting PetCare Application..."
echo ""

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
fi

# Check if database exists
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw petcare_db 2>/dev/null; then
    echo "⚠️  Database 'petcare_db' not found. Please run:"
    echo "   sudo -u postgres psql -c \"CREATE DATABASE petcare_db;\""
    echo "   npm run db:setup"
    exit 1
fi

# Kill any existing processes on ports 3001 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill 2>/dev/null || true
lsof -ti:5173 | xargs kill 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 1

echo ""
echo "🚀 Starting Backend (port 3001) and Frontend (port 5173)..."
echo ""
echo "📍 Backend API: http://localhost:3001"
echo "📍 Frontend UI: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers with concurrently
npm run dev
