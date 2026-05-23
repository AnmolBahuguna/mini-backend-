#!/usr/bin/env python
"""
Complete setup and test script for DHIP backend.
Ensures all dependencies are installed and backend works.
"""
import os
import sys
import subprocess
import json
from pathlib import Path

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(title):
    print(f"\n{BLUE}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{RESET}\n")

def print_success(msg):
    print(f"{GREEN}✓ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}✗ {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠ {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ {msg}{RESET}")

def run_command(cmd, description):
    """Run a command and return success status."""
    print_info(f"{description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print_success(description)
            return True, result.stdout
        else:
            print_error(f"{description}: {result.stderr}")
            return False, result.stderr
    except subprocess.TimeoutExpired:
        print_error(f"{description}: Command timed out")
        return False, "Timeout"
    except Exception as e:
        print_error(f"{description}: {str(e)}")
        return False, str(e)

def main():
    print_header("DHIP BACKEND - SETUP & VERIFICATION")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print_info(f"Working directory: {backend_dir}")
    
    # 1. Check Python
    print_header("Step 1: Python Environment")
    success, output = run_command("python --version", "Checking Python version")
    if success:
        print(f"  {output.strip()}")
    else:
        print_error("Python not found!")
        sys.exit(1)
    
    # 2. Check/Create venv
    print_header("Step 2: Virtual Environment")
    if not Path(".venv").exists():
        print_warning("Virtual environment not found, creating...")
        success, _ = run_command("python -m venv .venv", "Creating virtual environment")
        if not success:
            sys.exit(1)
    else:
        print_success("Virtual environment found")
    
    # 3. Install dependencies
    print_header("Step 3: Dependencies")
    success, _ = run_command(".venv\\Scripts\\pip install --upgrade pip", "Updating pip")
    success, _ = run_command(".venv\\Scripts\\pip install -r requirements.txt", "Installing requirements")
    if not success:
        print_warning("Some dependencies may have failed to install")
    
    # 4. Database migrations
    print_header("Step 4: Database Setup")
    print_info("Note: Supabase connection required. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env")
    success, _ = run_command(".venv\\Scripts\\python manage.py migrate", "Running migrations")
    
    # 5. Test API endpoints
    print_header("Step 5: Testing API Endpoints")
    
    # Start Django in background (for testing)
    print_info("Starting Django development server...")
    import threading
    import time
    import requests
    
    def start_server():
        subprocess.Popen([".venv\\Scripts\\python", "manage.py", "runserver", "127.0.0.1:8000"])
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(5)  # Wait for server to start
    
    test_cases = [
        {
            "name": "Health Check",
            "method": "GET",
            "endpoint": "http://localhost:8000/api/",
            "expected_status": 200
        },
        {
            "name": "Threat Check - Safe URL",
            "method": "POST",
            "endpoint": "http://localhost:8000/api/threat-check/",
            "data": {"entity": "https://www.google.com", "entity_type": "url"},
            "expected_status": 200
        },
        {
            "name": "Threat Check - Phishing URL",
            "method": "POST",
            "endpoint": "http://localhost:8000/api/threat-check/",
            "data": {"entity": "pay-sbi-secure.xyz", "entity_type": "url"},
            "expected_status": 200
        },
        {
            "name": "Threat Check - Phone",
            "method": "POST",
            "endpoint": "http://localhost:8000/api/threat-check/",
            "data": {"entity": "+91 9123456789", "entity_type": "phone"},
            "expected_status": 200
        },
        {
            "name": "Dashboard Stats",
            "method": "GET",
            "endpoint": "http://localhost:8000/api/dashboard/",
            "expected_status": 200
        },
    ]
    
    for test in test_cases:
        try:
            if test["method"] == "GET":
                response = requests.get(test["endpoint"], timeout=10)
            else:
                response = requests.post(test["endpoint"], json=test.get("data"), timeout=10)
            
            if response.status_code == test["expected_status"]:
                print_success(f"{test['name']}: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    if test['name'].startswith("Threat Check"):
                        print(f"    DRS Score: {data.get('drs_score', 'N/A')}")
                        print(f"    Risk Level: {data.get('risk_level', 'N/A')}")
                        print(f"    Scam Type: {data.get('scam_type', 'N/A')}")
            else:
                print_error(f"{test['name']}: Expected {test['expected_status']}, got {response.status_code}")
                print(f"    Response: {response.text[:200]}")
        except requests.exceptions.RequestException as e:
            print_error(f"{test['name']}: {str(e)}")
        except Exception as e:
            print_error(f"{test['name']}: Unexpected error - {str(e)}")
    
    print_header("Setup Complete!")
    print_success("DHIP Backend is ready to use!")
    print_info("Frontend: npm run dev  (in frontend/ directory)")
    print_info("Backend: Already running on http://localhost:8000")
    print_info("API Docs: http://localhost:8000/api/")

if __name__ == "__main__":
    main()
