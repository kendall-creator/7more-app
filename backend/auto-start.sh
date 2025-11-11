#!/bin/bash

# Auto-start script for backend email server
# This script checks if the backend server is running and starts it if needed

BACKEND_DIR="/home/user/workspace/backend"
LOG_FILE="/tmp/backend-server.log"

# Check if server is already running
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Backend server is already running"
    exit 0
fi

# Start the server
echo "🚀 Starting backend email server..."
cd "$BACKEND_DIR" && node server.js > "$LOG_FILE" 2>&1 &

# Wait a moment for startup
sleep 2

# Verify it started
if curl -s http://172.17.0.1:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend server started successfully"
    echo "📋 View logs: cat $LOG_FILE"
else
    echo "❌ Failed to start backend server"
    echo "📋 Check logs: cat $LOG_FILE"
    exit 1
fi
