import requests
import json

try:
    data = {
        "nome": "Test",
        "cargo": "Test",
        "area": "Comercial",
        "empresa": "Test",
        "consultor": "Test"
    }
    res = requests.post('http://localhost:8000/api/v1/reports/demo/generate-ai', json=data)
    print("Status:", res.status_code)
    print("Response:", res.text[:500])
except Exception as e:
    print("Error:", e)
