#!/usr/bin/env bash
# SIMPLEST WAY TO START BACKEND - Just Run This File!
# Save as: start-backend.sh in the project root
# Run with: bash start-backend.sh

set -e

echo ""
echo "═══════════════════════════════════════════════════════"
echo "           DHIP Backend Server Starting..."
echo "═══════════════════════════════════════════════════════"
echo ""

cd backend

if [ ! -d ".venv" ]; then
    echo "Creating Python environment..."
    python -m venv .venv
fi

echo "Activating environment..."
source .venv/bin/activate

echo "Installing dependencies (if needed)..."
pip install -q -r requirements.txt 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Starting Django server on http://localhost:8000"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Press CTRL+C to stop"
echo ""

python manage.py runserver 0.0.0.0:8000
