@echo off
cd /d "%~dp0"

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
set "NPX_CMD=C:\Program Files\nodejs\npx.cmd"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%"

echo ========================================
echo   GLOPIXS - Android Run
echo ========================================
echo Project: %CD%
echo.

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo API already running on port 3000.
) else (
    echo Starting API server in new window...
    start "GLOPIXS API" /D "%~dp0" cmd /k ""%NODE_EXE%" server\api-server.js"
    echo Waiting 3 seconds for API to start...
    timeout /t 3 /nobreak >nul
)

if not exist "node_modules\babel-preset-expo" (
    echo Installing missing dependencies...
    call npm.cmd install
)

netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo Metro already running on port 8081.
) else (
    echo Starting Metro server in new window...
    start "GLOPIXS Metro" /D "%~dp0" cmd /k ""%NPX_CMD%" expo start --clear --port 8081 --offline"
    echo Waiting 12 seconds for Metro to start...
    timeout /t 12 /nobreak >nul
)

adb devices 2>nul | findstr /i "device" | findstr /v "List" >nul
if %errorlevel%==0 (
    echo Setting up phone connection...
    adb reverse tcp:8081 tcp:8081
    adb reverse tcp:3000 tcp:3000
) else (
    echo WARNING: No device found. Start emulator in Android Studio first.
)

echo.
echo Building and installing app...
call npm.cmd run android

if errorlevel 1 (
    echo.
    echo Build failed. Try:
    echo  1. Android Studio - Device Manager - Start emulator
    echo  2. Keep start-metro.bat window open
    pause
)
