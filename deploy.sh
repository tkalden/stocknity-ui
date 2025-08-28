#!/bin/bash

# Stocknity UI Deployment Script
echo "🚀 Starting Stocknity UI deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the stocknity-ui directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for TypeScript errors
echo "🔍 Checking TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
fi

# Build the project
echo "🏗️ Building the project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📝 Don't forget to set environment variables in your Vercel dashboard:"
echo "   REACT_APP_API_BASE_URL=https://stock-portfolio-theta.vercel.app/api"
