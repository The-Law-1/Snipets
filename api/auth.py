import os
import time
from typing import Dict, Optional

import requests
from fastapi import Header, HTTPException
from jose import jwt

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_JWKS_URL = os.environ.get("SUPABASE_JWKS_URL")

JWKS_CACHE: Dict[str, object] = {
    "fetched_at": 0,
    "keys": {},
}


def _get_jwks_url() -> str:
    if SUPABASE_JWKS_URL:
        return SUPABASE_JWKS_URL
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="SUPABASE_URL is not set")
    return f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"


def _get_jwks() -> Dict[str, dict]:
    now = time.time()
    if JWKS_CACHE["keys"] and now - JWKS_CACHE["fetched_at"] < 3600:
        return JWKS_CACHE["keys"]

    response = requests.get(_get_jwks_url(), timeout=5)
    if not response.ok:
        raise HTTPException(status_code=500, detail="Failed to fetch JWKS")

    keys = {key["kid"]: key for key in response.json().get("keys", [])}
    JWKS_CACHE["keys"] = keys
    JWKS_CACHE["fetched_at"] = now
    return keys


def get_current_user_id(authorization: Optional[str] = Header(default=None)) -> str:
    if os.environ.get("DISABLE_AUTH") == "true":
        return os.environ.get("AUTH_BYPASS_USER_ID", "test-user")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token header")

        jwks = _get_jwks()
        key = jwks.get(kid)
        if not key:
            raise HTTPException(status_code=401, detail="Unknown token key")

        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256", "ES256"],
            options={"verify_aud": False},
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing user id")

    return user_id
