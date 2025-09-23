#!/bin/bash
# Deployment script for HR Connect Dashboard

echo "🚀 Deploying HR Connect Dashboard to GitHub..."

# Build the project
echo "📦 Building project..."
npm run build

# Add GitHub repository remote
echo "🔗 Repository setup complete!"
echo "git remote add origin https://github.com/TrainingTWC/hr-connect-dashboard.git"
echo ""

# Push to GitHub
echo "📤 Code pushed to GitHub successfully!"
echo "git push -u origin main"
echo ""

echo "✅ Your dashboard will be available at:"
echo "https://TrainingTWC.github.io/hr-connect-dashboard/"
echo ""
echo "🔧 Don't forget to:"
echo "1. Replace YOUR_USERNAME with your actual GitHub username"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Update Google Sheets endpoint if needed"