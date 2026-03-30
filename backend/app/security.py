from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import HTTPException, status

from .config import SECRET_KEY, TOKEN_EXPIRE_MINUTES


PBKDF2_ITERATIONS = 100_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    ).hex()
    return f"{PBKDF2_ITERATIONS}${salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        iterations_text, salt, password_hash = stored_hash.split("$", 2)
        recalculated = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations_text),
        ).hex()
        return secrets.compare_digest(recalculated, password_hash)
    except ValueError:
        return False


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": int(time.time()) + (TOKEN_EXPIRE_MINUTES * 60),
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64encode(payload_bytes)
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).digest()
    return f"{payload_b64}.{_b64encode(signature)}"


def decode_access_token(token: str) -> int:
    try:
        payload_b64, signature_b64 = token.split(".", 1)
    except ValueError as exc:
        raise _auth_error() from exc

    expected_signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    if not hmac.compare_digest(expected_signature, _b64decode(signature_b64)):
        raise _auth_error()

    try:
        payload = json.loads(_b64decode(payload_b64))
    except (json.JSONDecodeError, ValueError) as exc:
        raise _auth_error() from exc

    if payload.get("exp", 0) < int(time.time()):
        raise _auth_error("Phiên đăng nhập đã hết hạn.")

    try:
        return int(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise _auth_error() from exc


def _auth_error(message: str = "Token không hợp lệ.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )

