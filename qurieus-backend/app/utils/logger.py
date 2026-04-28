from typing import Optional, Dict, Any


def log_to_backend(
    level: str,
    message: str,
    user: Optional[Dict[str, Any]] = None,
    meta: Optional[Dict[str, Any]] = None,
    error: Optional[Exception] = None,
):
    _ = (level, message, user, meta, error)
    return None
