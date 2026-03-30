from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import UPLOAD_DIR
from ..dependencies import get_current_user, get_db
from ..models import Photo, User
from ..schemas import MessageResponse, PhotoRead, PhotoUpdate


router = APIRouter(prefix="/api/photos", tags=["photos"])
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


def _photo_or_404(photo_id: int, current_user: User, db: Session) -> Photo:
    photo = db.query(Photo).filter(Photo.id == photo_id, Photo.user_id == current_user.id).first()
    if photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ảnh.")
    return photo


def _assert_is_image(file: UploadFile) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()
    if content_type.startswith("image/") or suffix in ALLOWED_EXTENSIONS:
        return
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ được upload file ảnh.")


@router.get("", response_model=list[PhotoRead])
def list_photos(
    q: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Photo]:
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    if q:
        query = query.filter(func.lower(Photo.title).contains(q.strip().lower()))
    return query.order_by(Photo.uploaded_at.desc()).all()


@router.post("", response_model=PhotoRead, status_code=status.HTTP_201_CREATED)
async def create_photo(
    title: str = Form(...),
    description: str = Form(default=""),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Photo:
    title = title.strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tiêu đề ảnh không được để trống.")

    _assert_is_image(image)
    suffix = Path(image.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_DIR / filename
    file_bytes = await image.read()
    destination.write_bytes(file_bytes)

    photo = Photo(
        title=title,
        description=description.strip(),
        image_url=f"/uploads/{filename}",
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
    photo.title = payload.title.strip()
    photo.description = payload.description.strip()
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{photo_id}", response_model=MessageResponse)
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    photo = _photo_or_404(photo_id, current_user, db)
    image_name = Path(photo.image_url).name
    db.delete(photo)
    db.commit()

    file_path = UPLOAD_DIR / image_name
    if file_path.exists():
        file_path.unlink()

    return MessageResponse(message="Đã xóa ảnh thành công.")

