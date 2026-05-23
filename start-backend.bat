#!/usr/bin/env batch
REM SIMPLEST WAY TO START BACKEND - Just Run This File!
REM Save as: start-backend.bat in the project root

@echo off
title DHIP Backend Server

echo.
echo ═══════════════════════════════════════════════════════
echo           DHIP Backend Server Starting...
echo ═══════════════════════════════════════════════════════
echo.

cd backend

if not exist ".venv" (
    echo Creating Python environment...
    python -m venv .venv
)

echo Activating environment...
call .venv\Scripts\activate.bat

echo Installing dependencies (if needed)...
python -m pip install -q -r requirements.txt 2>nul

echo.
echo ═══════════════════════════════════════════════════════
echo Starting Django server on http://localhost:8000
echo ═══════════════════════════════════════════════════════
echo.
echo Press CTRL+C to stop
echo.

python manage.py runserver 0.0.0.0:8000

pause
