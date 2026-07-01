# GLOPIXS - Android app run script
# Double-click or run: powershell -ExecutionPolicy Bypass -File run-android.ps1

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"

$Adb = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
$Npx = "C:\Program Files\nodejs\npx.cmd"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GLOPIXS - Android Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot"

$apiRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $apiRunning) {
    Write-Host "Starting API on port 3000 in new window..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$ProjectRoot`" && npm.cmd run api"
    Write-Host "Waiting 3 seconds for API..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "API already running on port 3000." -ForegroundColor Green
}

$metroRunning = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
if (-not $metroRunning) {
    Write-Host "Starting Metro in new window..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$ProjectRoot`" && `"$Npx`" expo start --clear --port 8081 --offline"
    Write-Host "Waiting 12 seconds for Metro..." -ForegroundColor Yellow
    Start-Sleep -Seconds 12
} else {
    Write-Host "Metro already running on port 8081." -ForegroundColor Green
}

$devices = & $Adb devices 2>$null | Select-String "device$"
if ($devices) {
    Write-Host "Setting up phone connection (adb reverse)..." -ForegroundColor Green
    & $Adb reverse tcp:8081 tcp:8081
    & $Adb reverse tcp:3000 tcp:3000
} else {
    Write-Host "WARNING: No device found. Start emulator first." -ForegroundColor Yellow
}

Write-Host "Building and installing app..." -ForegroundColor Green
npm.cmd run android

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed. Try:" -ForegroundColor Yellow
    Write-Host "1. Android Studio -> Device Manager -> Start emulator"
    Write-Host "2. Keep start-metro.bat window open"
    pause
}
