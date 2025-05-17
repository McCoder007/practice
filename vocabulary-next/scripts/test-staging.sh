#!/bin/bash

# Script to test the staging build locally
echo "🔶 Starting local staging test..."

# Generate vocabulary JSON files
echo "🔄 Generating vocabulary JSON files..."
npm run generate:vocabulary

# Set environment variables for staging
export NEXT_PUBLIC_DEPLOY_ENV=staging

# Build with staging configuration
echo "🏗️ Building with staging configuration..."
npm run build -- --no-lint

# Serve the build
echo "🚀 Starting local server to test staging build..."
echo "📑 Open http://localhost:3000/practice/staging/ in your browser"
npx serve out -l 3000

# Note: The paths may not match exactly with GitHub Pages deployment 
# due to the difference in URL structure 