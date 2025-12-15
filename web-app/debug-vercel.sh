#!/bin/bash
# Vercel Debug Script - Run this during build to diagnose issues

echo "=== Vercel Build Diagnostics ==="
echo ""
echo "📍 Current Directory:"
pwd
echo ""
echo "📦 Node/NPM Versions:"
node --version
npm --version
echo ""
echo "📂 Files in current directory:"
ls -la
echo ""
echo "🔍 Checking for package.json:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    cat package.json | grep -A 10 '"dependencies"'
else
    echo "❌ package.json NOT found"
fi
echo ""
echo "🔍 Checking for node_modules/firebase:"
if [ -d "node_modules/firebase" ]; then
    echo "✅ Firebase installed"
    ls node_modules/firebase/ | head -10
else
    echo "❌ Firebase NOT installed"
fi
echo ""
echo "🔍 Checking firebase sub-packages:"
for pkg in app auth database; do
    if [ -d "node_modules/firebase/$pkg" ]; then
        echo "✅ firebase/$pkg exists"
    else
        echo "❌ firebase/$pkg MISSING"
    fi
done
