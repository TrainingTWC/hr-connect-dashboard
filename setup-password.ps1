# Quick setup script for HR Connect Dashboard Password Protection
# Run this in PowerShell

Write-Host "🔒 Setting up HR Connect Dashboard Password Protection..." -ForegroundColor Cyan
Write-Host ""

# Check if config directory exists
if (-not (Test-Path "config")) {
    Write-Host "❌ Config directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if auth config exists
if (-not (Test-Path "config/auth.ts")) {
    Write-Host "❌ Authentication config file not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Password protection is already set up!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Configuration:" -ForegroundColor Yellow
Write-Host "   - Password: Check config/auth.ts file"
Write-Host "   - Session: 24 hours (configurable)"
Write-Host "   - Storage: Browser localStorage"
Write-Host ""
Write-Host "🔧 To customize:" -ForegroundColor Yellow
Write-Host "   1. Edit config/auth.ts to change password"
Write-Host "   2. Run: npm run build"
Write-Host "   3. Deploy updated files"
Write-Host ""
Write-Host "📖 For detailed instructions, see PASSWORD_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to use! Users will now see a login screen." -ForegroundColor Green