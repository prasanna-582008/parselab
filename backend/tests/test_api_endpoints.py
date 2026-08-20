import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("=== Testing API Health ===")
    req = urllib.request.urlopen(f"{BASE_URL}/")
    data = json.loads(req.read().decode())
    print("Health Check Response:", data)
    assert data["status"] == "online"

    grammar_payload = {
        "grammar_text": "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id"
    }

    print("\n=== Testing /api/grammar/analyze ===")
    req = urllib.request.Request(
        f"{BASE_URL}/api/grammar/analyze",
        data=json.dumps(grammar_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Analyze result start symbol:", res["grammar"]["start_symbol"])
    print("FIRST sets:", res["first_follow"]["first"])
    print("Doctor is_clean:", res["doctor"]["is_clean"])
    assert res["grammar"]["start_symbol"] == "E"

    print("\n=== Testing /api/grammar/transform ===")
    req = urllib.request.Request(
        f"{BASE_URL}/api/grammar/transform",
        data=json.dumps(grammar_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Transformed Text:\n" + res["transformed_text"])
    assert "E'" in res["transformed_text"]

    print("\n=== Testing /api/compare for 'id + id' ===")
    comp_payload = {
        "grammar_text": grammar_payload["grammar_text"],
        "input_string": "id + id"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/compare",
        data=json.dumps(comp_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("LL(1) Accepted?", res["metrics"]["ll1"]["accepted"], "Steps:", res["metrics"]["ll1"]["total_steps"])
    print("SLR(1) Accepted?", res["metrics"]["slr"]["accepted"], "Steps:", res["metrics"]["slr"]["total_steps"])
    assert res["metrics"]["slr"]["accepted"] is True

    print("\n=== Testing /api/test-suite ===")
    suite_payload = {
        "grammar_text": grammar_payload["grammar_text"],
        "input_strings": ["id + id", "id * id", "( id + id )", "id +", "+ id"]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/test-suite",
        data=json.dumps(suite_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Test Suite Total:", res["total_tests"], "SLR Passed:", res["slr_passed"])
    assert res["slr_passed"] == 3

    print("\n=== ALL FastAPI HTTP ENDPOINTS FUNCTIONING PERFECTLY! ===")

if __name__ == "__main__":
    test_api()
