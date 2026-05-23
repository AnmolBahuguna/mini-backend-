@echo off
REM DHIP Backend Server - Auto Start & Run
REM This file automatically starts the backend server

setlocal enabledelayedexpansion

title DHIP Backend Server - Running

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║         DHIP Backend Server - Starting...            ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Navigate to backend directory
cd /d "%~dp0..\..\backend"

echo Current directory: %cd%
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python found
echo.

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    echo ✓ Virtual environment created
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
python -m pip install -q -r requirements.txt 2>nul
echo ✓ Dependencies installed
echo.

REM Start the server
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║     Django Server Starting on http://localhost:8000   ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo Press CTRL+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8000

pause
