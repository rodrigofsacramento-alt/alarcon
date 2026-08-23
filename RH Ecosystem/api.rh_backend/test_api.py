import requests
import json

try:
    res = requests.get('http://localhost:8000/api/v1/assessments/questions/DISC')
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.json(), indent=2))
except Exception as e:
    print("Error:", e)
