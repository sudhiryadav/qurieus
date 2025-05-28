import requests
import os

FRONTEND_LOG_URL = os.getenv("FRONTEND_URL")  + '/api/logs'  # Adjust as needed

def log_to_frontend(level, message, user=None, meta=None):
    payload = {
        "level": level,
        "message": message,
        "meta": meta or {},
    }
    print(payload)
    if user:
        payload["userId"] = user.get("id")
        payload["meta"]["userName"] = user.get("name")
        payload["meta"]["userEmail"] = user.get("email")
    try:
        requests.post(FRONTEND_LOG_URL, json=payload, timeout=2)
    except Exception as e:
        print(f"Failed to log to frontend: {e}") 