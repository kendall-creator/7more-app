#!/bin/bash

# Secure Email Backend Startup Script

echo "🚀 Starting 7more Secure Email Backend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with your Gmail SMTP credentials."
    echo "See .env.example for required variables."
    exit 1
fi

# Start the server
echo "✅ Starting email backend server..."
echo ""
node server.js
