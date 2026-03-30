from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, DATA_DIR, UPLOAD_DIR
from .database import Base, engine
from .routes.albums import router as albums_router
from .routes.auth import router as auth_router
from .routes.photos import router as photos_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Album Gallery App API",
    description="FastAPI backend for album gallery management.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(albums_router)
app.include_router(photos_router)


@app.get("/")
def root():
    return {"message": "Album Gallery App API dang chay."}


@app.get("/health")
def health():
    return {"status": "ok"}
