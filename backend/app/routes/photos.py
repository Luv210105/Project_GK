from __future__ import annotations

from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import UPLOAD_DIR
from ..dependencies import get_current_user, get_db
from ..models import Album, Photo, User
from ..schemas import FavoriteToggleResponse, MessageResponse, PhotoAlbumUpdate, PhotoRead, PhotoUpdate


router = APIRouter(prefix="/api/photos", tags=["photos"])
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


def _photo_or_404(photo_id: int, current_user: User, db: Session) -> Photo:
    photo = db.query(Photo).filter(Photo.id == photo_id, Photo.user_id == current_user.id).first()
    if photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khong tim thay anh.")
    return photo


def _album_or_none(album_id: Optional[int], current_user: User, db: Session) -> Optional[Album]:
    if album_id is None:
        return None
    album = db.query(Album).filter(Album.id == album_id, Album.user_id == current_user.id).first()
    if album is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album khong ton tai.")
    return album


def _assert_is_image(file: UploadFile) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()
    if content_type.startswith("image/") or suffix in ALLOWED_EXTENSIONS:
        return
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chi duoc upload file anh.")


@router.get("/favorites", response_model=List[PhotoRead])
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Photo]:
    return (
        db.query(Photo)
        .filter(Photo.user_id == current_user.id, Photo.is_favorite.is_(True))
        .order_by(Photo.uploaded_at.desc())
        .all()
    )


@router.get("", response_model=List[PhotoRead])
def list_photos(
    q: Optional[str] = Query(default=None),
    album_id: Optional[int] = Query(default=None),
    favorites_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Photo]:
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    if q:
        query = query.filter(func.lower(Photo.title).contains(q.strip().lower()))
    if album_id is not None:
        _album_or_none(album_id, current_user, db)
        query = query.filter(Photo.album_id == album_id)
    if favorites_only:
        query = query.filter(Photo.is_favorite.is_(True))
    return query.order_by(Photo.uploaded_at.desc()).all()


@router.post("", response_model=PhotoRead, status_code=status.HTTP_201_CREATED)
async def create_photo(
    title: str = Form(...),
    description: str = Form(default=""),
    album_id: Optional[int] = Form(default=None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Photo:
    title = title.strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tieu de anh khong duoc de trong.")

    album = _album_or_none(album_id, current_user, db)
    _assert_is_image(image)
    suffix = Path(image.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_DIR / filename
    destination.parent.mkdir(parents=True, exist_ok=True)
    file_bytes = await image.read()
    destination.write_bytes(file_bytes)

    photo = Photo(
        title=title,
        description=description.strip(),
        image_url=f"/uploads/{filename}",
        album_id=album.id if album else None,
        user_id=current_user.id,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.get("/{photo_id}", response_model=PhotoRead)
def get_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Photo:
    return _photo_or_404(photo_id, current_user, db)


@router.put("/{photo_id}", response_model=PhotoRead)
def update_photo(
    photo_id: int,
    payload: PhotoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Photo:
    photo = _photo_or_404(photo_id, current_user, db)
    album = _album_or_none(payload.album_id, current_user, db)
    photo.title = payload.title.strip()
    photo.description = payload.description.strip()
    photo.album_id = album.id if album else None
    db.commit()
    db.refresh(photo)
    return photo


@router.put("/{photo_id}/album", response_model=PhotoRead)
def move_photo_to_album(
    photo_id: int,
    payload: PhotoAlbumUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Photo:
    photo = _photo_or_404(photo_id, current_user, db)
    album = _album_or_none(payload.album_id, current_user, db)
    photo.album_id = album.id if album else None
    db.commit()
    db.refresh(photo)
    return photo


@router.put("/{photo_id}/favorite", response_model=FavoriteToggleResponse)
def toggle_favorite(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FavoriteToggleResponse:
    photo = _photo_or_404(photo_id, current_user, db)
    photo.is_favorite = not photo.is_favorite
    db.commit()
    return FavoriteToggleResponse(is_favorite=photo.is_favorite)


@router.delete("/{photo_id}", response_model=MessageResponse)
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    photo = _photo_or_404(photo_id, current_user, db)
    image_path = photo.image_url or ""
    db.delete(photo)
    db.commit()

    if image_path.startswith("/uploads/"):
        file_path = UPLOAD_DIR / Path(image_path).name
        if file_path.exists():
            file_path.unlink()

    return MessageResponse(message="Da xoa anh thanh cong.")
