from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_current_user, get_db
from ..models import Album, Photo, User
from ..schemas import AlbumCreate, AlbumRead, AlbumUpdate, MessageResponse, PhotoRead


router = APIRouter(prefix="/api/albums", tags=["albums"])


def _album_or_404(album_id: int, current_user: User, db: Session) -> Album:
    album = db.query(Album).filter(Album.id == album_id, Album.user_id == current_user.id).first()
    if album is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khong tim thay album.")
    return album


@router.post("", response_model=AlbumRead, status_code=status.HTTP_201_CREATED)
def create_album(
    payload: AlbumCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Album:
    album = Album(
        name=payload.name.strip(),
        description=payload.description.strip(),
        user_id=current_user.id,
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    return album


@router.get("", response_model=List[AlbumRead])
def list_albums(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Album]:
    return db.query(Album).filter(Album.user_id == current_user.id).order_by(Album.created_at.desc()).all()


@router.put("/{album_id}", response_model=AlbumRead)
def update_album(
    album_id: int,
    payload: AlbumUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Album:
    album = _album_or_404(album_id, current_user, db)
    album.name = payload.name.strip()
    album.description = payload.description.strip()
    db.commit()
    db.refresh(album)
    return album


@router.delete("/{album_id}", response_model=MessageResponse)
def delete_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    album = _album_or_404(album_id, current_user, db)

    db.query(Photo).filter(Photo.album_id == album.id, Photo.user_id == current_user.id).update(
        {Photo.album_id: None},
        synchronize_session=False,
    )
    db.delete(album)
    db.commit()
    return MessageResponse(message="Da xoa album thanh cong.")


@router.get("/{album_id}/photos", response_model=List[PhotoRead])
def list_album_photos(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Photo]:
    _album_or_404(album_id, current_user, db)
    return (
        db.query(Photo)
        .filter(Photo.user_id == current_user.id, Photo.album_id == album_id)
        .order_by(Photo.uploaded_at.desc())
        .all()
    )
