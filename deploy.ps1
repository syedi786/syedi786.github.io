# One-command deploy — pushes the site to https://syedi786.github.io
# Usage: right-click > Run with PowerShell, or `./deploy.ps1` in a terminal.
Set-Location $PSScriptRoot
git add -A
git commit -m ("site update " + (Get-Date -Format "yyyy-MM-dd HH:mm"))
git push
Write-Host ""
Write-Host "Deployed. Live in ~60 seconds at https://syedi786.github.io"
