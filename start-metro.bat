@echo off
cd /d "%~dp0"

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "NPX_CMD=C:\Program Files\nodejs\npx.cmd"
set "PATH=%ANDROID_HOME%\platform-tools;%PATH%"

echo ========================================
echo   GLOPIXS - Metro Server Start
echo ========================================
echo.

for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress"') do set "LOCAL_IP=%%i"

echo Your PC IP: %LOCAL_IP%
echo Metro will run on: http://%LOCAL_IP%:8081
echo.

adb devices 2>nul | findstr /i "device" | findstr /v "List" >nul
if %errorlevel%==0 (
    echo Connecting phone to Metro...
    adb reverse tcp:8081 tcp:8081
    echo adb reverse done.
) else (
    echo No phone/emulator found. Start emulator first, then run this again.
)

echo.
if not exist "node_modules\babel-preset-expo" (
    echo Installing missing dependencies...
    call npm install
)

echo Keep this window OPEN while using the app!
echo Press Ctrl+C to stop Metro.
echo.

"%NPX_CMD%" expo start --clear --port 8081 --offline
