#!/usr/bin/env python
"""
Quick test to verify DHIP backend functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def quick_test():
    """Quick functionality test"""
    print("🚀 DHIP Backend Quick Test")
    print("="*40)
    
    tests = []
    
    # Test 1: Health Check
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=5)
        tests.append(("Health Check", response.status_code == 200))
        print(f"✅ Health Check: {response.status_code}")
    except:
        tests.append(("Health Check", False))
        print("❌ Health Check: Failed")
    
    # Test 2: Threat Analysis (URL)
    try:
        response = requests.post(
            f"{BASE_URL}/api/threat-check/",
            json={"entity": "https://example.com", "entity_type": "url"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            tests.append(("Threat Analysis", True))
            print(f"✅ Threat Analysis: DRS={data.get('drs_score')}, Risk={data.get('risk_level')}")
        else:
            tests.append(("Threat Analysis", False))
            print(f"❌ Threat Analysis: {response.status_code}")
    except:
        tests.append(("Threat Analysis", False))
        print("❌ Threat Analysis: Timeout")
    
    # Test 3: Dashboard
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/", timeout=5)
        tests.append(("Dashboard", response.status_code == 200))
        print(f"✅ Dashboard: {response.status_code}")
    except:
        tests.append(("Dashboard", False))
        print("❌ Dashboard: Failed")
    
    # Test 4: Stories
    try:
        response = requests.get(f"{BASE_URL}/api/stories/", timeout=5)
        tests.append(("Stories", response.status_code == 200))
        print(f"✅ Stories: {response.status_code}")
    except:
        tests.append(("Stories", False))
        print("❌ Stories: Failed")
    
    # Test 5: Error Handling
    try:
        response = requests.post(
            f"{BASE_URL}/api/threat-check/",
            json={"entity": "", "entity_type": "invalid"},
            timeout=5
        )
        tests.append(("Error Handling", response.status_code == 400))
        print(f"✅ Error Handling: {response.status_code}")
    except:
        tests.append(("Error Handling", False))
        print("❌ Error Handling: Failed")
    
    # Summary
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed >= 4:
        print("🎉 Backend is working correctly!")
        return True
    else:
        print("⚠️  Backend has some issues.")
        return False

if __name__ == "__main__":
    quick_test()
