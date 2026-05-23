@echo off
REM DHIP Backend - Diagnostics & Fix
REM This file diagnoses and fixes backend connection issues

setlocal enabledelayedexpansion

title DHIP Backend - Diagnostics

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         DHIP Backend - Diagnostics & Fix                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set ERROR_COUNT=0

REM Test 1: Check Python
echo [Test 1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ FAILED: Python not installed
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do (
        echo ✓ PASS: %%i
    )
)
echo.

REM Test 2: Check if we're in project root
echo [Test 2/5] Checking project structure...
if not exist "backend\manage.py" (
    echo ✗ FAILED: Not in project root, or backend folder missing
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    echo ✓ PASS: Backend folder found
)
echo.

REM Test 3: Check requirements.txt
echo [Test 3/5] Checking dependencies file...
if not exist "backend\requirements.txt" (
    echo ✗ FAILED: requirements.txt not found
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    echo ✓ PASS: requirements.txt found
)
echo.

REM Test 4: Check port 8000 availability
echo [Test 4/5] Checking if port 8000 is available...
netstat -ano | findstr ":8000" >nul
if errorlevel 1 (
    echo ✓ PASS: Port 8000 is available
) else (
    echo ✗ WARNING: Port 8000 might be in use
    echo   Killing any process on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /PID %%a /F >nul 2>&1
    echo   ✓ Process terminated if found
)
echo.

REM Test 5: Check .env file
echo [Test 5/5] Checking configuration...
if not exist "backend\.env" (
    echo ✗ WARNING: .env file not found
    echo   This might be OK - the app can run with defaults
) else (
    echo ✓ PASS: .env file found
)
echo.

REM Summary
echo ╔════════════════════════════════════════════════════════════════╗
if !ERROR_COUNT! equ 0 (
    echo ║         Diagnostics Complete - Ready to Start              ║
) else (
    echo ║         Diagnostics Complete - !ERROR_COUNT! Issue^(s^) Found             ║
)
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Offer to fix
if !ERROR_COUNT! equ 0 (
    echo Ready to start backend? (Y/N)
    set /p START_NOW="Enter choice: "
    if /i "!START_NOW!"=="Y" (
        echo.
        echo Starting backend...
        call backend-auto-run.bat
    ) else (
        echo Cancelled. Run: backend-auto-run.bat when ready
    )
) else (
    echo.
    echo Please fix the issues above, then run: backend-auto-run.bat
)

pause
