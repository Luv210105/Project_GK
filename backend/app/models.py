from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))

    albums: Mapped[List["Album"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    photos: Mapped[List["Photo"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    user: Mapped[User] = relationship(back_populates="albums")
    photos: Mapped[List["Photo"]] = relationship(back_populates="album")


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(255))
    album_id: Mapped[Optional[int]] = mapped_column(ForeignKey("albums.id"), nullable=True, index=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    album: Mapped[Optional[Album]] = relationship(back_populates="photos")
    user: Mapped[User] = relationship(back_populates="photos")
