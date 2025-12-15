#!/bin/bash

# Quick setup script for GitHub sync

echo "🔧 GitHub Sync Quick Setup"
echo ""
echo "This will help you set up automatic syncing from Vibecode → GitHub → Vercel"
echo ""

# Check if token is already set
if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ GITHUB_TOKEN is already set!"
    echo ""
    echo "Testing sync to GitHub..."
    ./sync-to-github.sh
    exit 0
fi

echo "❌ GITHUB_TOKEN not found"
echo ""
echo "📋 Quick Setup Steps:"
echo ""
echo "1️⃣  Create GitHub Token:"
echo "   → Open: https://github.com/settings/tokens"
echo "   → Click: Generate new token (classic)"
echo "   → Check: 'repo' scope"
echo "   → Copy the token (starts with ghp_)"
echo ""
echo "2️⃣  Add to Vibecode:"
echo "   → Open the ENV tab in your Vibecode app"
echo "   → Add variable: GITHUB_TOKEN"
echo "   → Paste your token"
echo "   → Save"
echo ""
echo "3️⃣  Test the sync:"
echo "   → Run: ./sync-to-github.sh"
echo ""
echo "Once set up, every commit will automatically sync to GitHub!"
echo ""
