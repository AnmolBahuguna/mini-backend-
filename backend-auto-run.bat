@echo off
REM DHIP Backend - Auto Start & Keep Running
REM This file automatically handles the entire setup and startup

setlocal enabledelayedexpansion

title DHIP Backend Server - AUTO RUN

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║   DHIP Backend Server - Automatic Startup                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Starting automatic backend setup...
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Current location: %cd%
echo.

REM Navigate to backend
echo [Step 1/5] Navigating to backend folder...
cd backend
if not exist "manage.py" (
    echo ERROR: Cannot find backend folder!
    echo Please run this from the project root directory
    pause
    exit /b 1
)
echo ✓ Backend folder found
echo.

REM Check Python
echo [Step 2/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✓ Found: %PYTHON_VERSION%
echo.

REM Create virtual environment
echo [Step 3/5] Setting up virtual environment...
if not exist ".venv" (
    echo Creating new virtual environment...
    python -m venv .venv
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment already exists
)
echo.

REM Activate and install
echo [Step 4/5] Installing dependencies...
call .venv\Scripts\activate.bat
python -m pip install -q --upgrade pip 2>nul
python -m pip install -q -r requirements.txt 2>nul
echo ✓ Dependencies installed
echo.

REM Start server
echo [Step 5/5] Starting Django server...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║         ✅  BACKEND SERVER STARTING                           ║
echo ║                                                                ║
echo ║  🔗 API URL: http://localhost:8000/api/                       ║
echo ║  📍 Server:  http://localhost:8000                            ║
echo ║                                                                ║
echo ║  ⏹️  To stop: Press CTRL+C                                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Waiting for server to start...
echo.

REM Run the server
python manage.py runserver 0.0.0.0:8000

REM If we get here, server stopped
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Backend server stopped                                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
