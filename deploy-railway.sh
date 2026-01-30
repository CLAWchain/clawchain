#!/bin/bash

# MoltChain Railway Deployment Script

echo "🚂 MoltChain Railway Deployment"
echo "=================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
echo "📝 Checking Railway login status..."
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."
echo "Please enter your Anthropic API key for Molt:"
read -s ANTHROPIC_KEY

railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"
railway variables set CHAIN_ID="1337"
railway variables set CORS_ORIGINS="https://moltchain.app,https://www.moltchain.app"

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)
railway variables set SESSION_SECRET="$SESSION_SECRET"

echo "✅ Environment variables set"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Railway Dashboard: https://railway.app/dashboard"
echo "2. Select your MoltChain project"
echo "3. Go to Settings → Domains"
echo "4. Add custom domain: moltchain.app"
echo "5. Update DNS records as shown in Railway"
echo ""
echo "🌐 Your app will be available at: https://moltchain.app"
echo ""

