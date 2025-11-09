#!/bin/bash

# File Management Backend Server Startup Script
# This script starts the backend server needed for File Management feature

echo "🚀 Starting File Management Backend Server..."

cd /home/user/workspace/backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the server in the background
node server.js > /tmp/backend-file-server.log 2>&1 &
SERVER_PID=$!

echo "✅ Server started with PID: $SERVER_PID"
echo "📝 Logs: /tmp/backend-file-server.log"
echo "🌐 API Base URL: http://172.17.0.2:3001"
echo ""
echo "Endpoints:"
echo "  - GET  /api/files/list - List all files"
echo "  - GET  /api/files/download/:filename - Download a file"
echo "  - GET  /api/health - Server health check"
echo ""

# Wait a moment and check if server is running
sleep 2

if curl -s http://172.17.0.2:3001/api/health > /dev/null 2>&1; then
  echo "✅ Server is running successfully!"
else
  echo "❌ Server failed to start. Check logs at /tmp/backend-file-server.log"
  cat /tmp/backend-file-server.log
  exit 1
fi
