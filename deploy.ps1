# PowerShell deployment script for HR Connect Dashboard

Write-Host "🚀 Deploying HR Connect Dashboard to GitHub..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "🔗 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub.com and create a new repository named 'hr-connect-dashboard'"
Write-Host "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
Write-Host ""
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/hr-connect-dashboard.git" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Enable GitHub Pages in your repository settings"
Write-Host "4. Your dashboard will be available at: https://YOUR_USERNAME.github.io/hr-connect-dashboard/"
Write-Host ""
Write-Host "✅ Repository is ready for GitHub hosting!" -ForegroundColor Green