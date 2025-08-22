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

# Verify browser installation
echo "✅ Verifying browser installation..."
npx playwright --version
ls -la /opt/render/.cache/ms-playwright/ || echo "Browser cache directory not found, this is normal during build"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "🎉 Build completed successfully!"
