#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting ShopAudit build process..."

# Install Node.js dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Playwright browsers with dependencies
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps chromium

# Force reinstall if needed
echo "🔄 Ensuring browser installation..."
npx playwright install chromium --force

# Verify browser installation
echo "✅ Verifying browser installation..."
npx playwright --version

# Check browser paths
echo "🔍 Checking browser paths..."
find /opt/render/.cache/ms-playwright/ -name "*chromium*" -type f 2>/dev/null || echo "No chromium found in cache"
find /root/.cache/ms-playwright/ -name "*chromium*" -type f 2>/dev/null || echo "No chromium found in root cache"
find /home/render/.cache/ms-playwright/ -name "*chromium*" -type f 2>/dev/null || echo "No chromium found in home cache"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "🎉 Build completed successfully!"
