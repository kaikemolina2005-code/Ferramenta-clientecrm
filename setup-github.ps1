# GitHub + Vercel Setup Script for Windows PowerShell
# Run: .\setup-github.ps1

Write-Host "`n🚀 ADVGD CRM - GitHub + Vercel Setup`n" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ Git detected: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Install from: https://git-scm.com/download`n" -ForegroundColor Red
    exit 1
}

# Get the root directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$gitDir = Join-Path $rootDir ".git"

# Check if git is already initialized
if (-not (Test-Path $gitDir)) {
    Write-Host "📝 Initializing Git repository...`n" -ForegroundColor Yellow
    
    try {
        Set-Location $rootDir
        git init
        git add .
        git commit -m "Initial commit: ADVGD CRM - Production Ready"
        Write-Host "`n✅ Git repository initialized`n" -ForegroundColor Green
    } catch {
        Write-Host "`n⚠️  Git initialization encountered an issue`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Git repository already initialized`n" -ForegroundColor Green
}

Write-Host "📋 Next steps:`n" -ForegroundColor Cyan

Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Create repository: advgd-crm-frontend" -ForegroundColor White
Write-Host "3. Copy the repository URL`n" -ForegroundColor White

Write-Host "4. Run these commands:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/advgd-crm-frontend.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main`n" -ForegroundColor Gray

Write-Host "5. Then go to: https://vercel.com" -ForegroundColor White
Write-Host "6. Connect with GitHub and import the repository`n" -ForegroundColor White

Write-Host "✨ That's it! You're ready to deploy!`n" -ForegroundColor Cyan

# Offer to open GitHub
$response = Read-Host "Would you like to open GitHub now? (Y/n)"
if ($response -ne "n" -and $response -ne "N") {
    Start-Process "https://github.com/new"
}
