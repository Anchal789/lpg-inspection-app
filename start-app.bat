@echo off
echo Starting LPG Inspection App Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found in backend directory
    echo Please create .env file with required environment variables
    echo See .env.example for reference
    pause
    exit /b 1
)

echo Starting backend server...
npm run dev

pause
