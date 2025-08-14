import requests
import traceback
import json
from typing import Optional, Dict, Any
from app.core.config import settings

FRONTEND_LOG_URL = settings.FRONTEND_URL + "/api/logs"


def log_to_backend(
    level: str,
    message: str,
    user: Optional[Dict[str, Any]] = None,
    meta: Optional[Dict[str, Any]] = None,
    error: Optional[Exception] = None,
):
    """
    Log messages to the frontend with enhanced error handling.

    Args:
        level: Log level (info, error, warning, debug)
        message: Main log message
        user: Optional user information
        meta: Optional additional metadata
        error: Optional exception object for error logging
    """
    payload = {
        "level": level,
        "message": message,
        "meta": meta or {},
    }

    # Add user information if available
    if user:
        payload["userId"] = user.get("id")
        payload["meta"]["userName"] = user.get("name")
        payload["meta"]["userEmail"] = user.get("email")

    # Add error information if available
    if error:
        payload["meta"]["error"] = {
            "type": error.__class__.__name__,
            "message": str(error),
            "traceback": traceback.format_exc(),
        }

    print(f"[{level.upper()}] {message}")
    if error:
        print(f"Error details: {json.dumps(payload['meta']['error'], indent=2)}")

    try:
        requests.post(FRONTEND_LOG_URL, json=payload, timeout=2)
    except Exception as e:
        print(f"Failed to log to frontend: {str(e)}")
        print(f"Original payload: {json.dumps(payload, indent=2)}")
