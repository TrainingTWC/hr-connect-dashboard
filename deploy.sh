#!/bin/bash
# Deployment script for HR Connect Dashboard

echo "🚀 Deploying HR Connect Dashboard to GitHub..."

# Build the project
echo "📦 Building project..."
npm run build

# Add GitHub repository remote (replace YOUR_USERNAME with actual username)
echo "🔗 Please add your GitHub repository remote:"
echo "git remote add origin https://github.com/YOUR_USERNAME/hr-connect-dashboard.git"
echo ""

# Push to GitHub
echo "📤 Ready to push to GitHub:"
echo "git push -u origin main"
echo ""

echo "✅ After pushing, your dashboard will be available at:"
echo "https://YOUR_USERNAME.github.io/hr-connect-dashboard/"
echo ""
echo "🔧 Don't forget to:"
echo "1. Replace YOUR_USERNAME with your actual GitHub username"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Update Google Sheets endpoint if needed"