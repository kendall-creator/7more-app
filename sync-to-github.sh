#!/bin/bash

# GitHub Sync Script for Vibecode → GitHub
# This script pushes commits from Vibecode's git to GitHub

set -e

echo "🔄 Syncing to GitHub..."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "To set up GitHub sync:"
    echo "1. Create a GitHub Personal Access Token:"
    echo "   - Go to https://github.com/settings/tokens"
    echo "   - Click 'Generate new token (classic)'"
    echo "   - Give it 'repo' scope"
    echo "   - Copy the token"
    echo ""
    echo "2. Add GITHUB_TOKEN to your Vibecode environment"
    echo "   - Use the ENV tab in Vibecode"
    echo "   - Add: GITHUB_TOKEN=your_token_here"
    echo ""
    exit 1
fi

# Update the GitHub remote URL with token
git remote set-url github "https://${GITHUB_TOKEN}@github.com/kendall-creator/7more-app.git"

# Fetch latest from GitHub
echo "📥 Fetching from GitHub..."
git fetch github main --quiet || true

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push github main; then
    echo "✅ Successfully synced to GitHub!"
    echo "🚀 Vercel deployment should trigger shortly"
else
    echo "⚠️  Push failed. This might happen if:"
    echo "   - The token doesn't have 'repo' permissions"
    echo "   - The repository doesn't exist"
    echo "   - There are conflicts to resolve"
    exit 1
fi
