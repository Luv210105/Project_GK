from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


def _default_data_dir() -> Path:
    configured_dir = os.getenv("APP_DATA_DIR")
    if configured_dir:
        return Path(configured_dir).expanduser().resolve()

    # Writing SQLite files on mapped/network drives can fail on Windows.
    if os.name == "nt":
        local_app_data = os.getenv("LOCALAPPDATA")
        if local_app_data:
            return (Path(local_app_data) / "Project_GK").resolve()

    return BASE_DIR.resolve()


DATA_DIR = _default_data_dir()
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(DATA_DIR / 'gallery.db').as_posix()}")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str((DATA_DIR / "uploads").resolve())))
SECRET_KEY = os.getenv("APP_SECRET_KEY", "gallery-app-development-secret")
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "720"))

DEFAULT_CORS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS).split(",") if origin.strip()]

