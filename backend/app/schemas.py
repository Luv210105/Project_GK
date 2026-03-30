from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class MessageResponse(BaseModel):
    message: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Username phai co it nhat 3 ky tu.")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Email khong hop le.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("Password phai co it nhat 6 ky tu.")
        return value


class UserLogin(BaseModel):
    login: str
    password: str

    @field_validator("login")
    @classmethod
    def validate_login(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Vui long nhap username hoac email.")
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class AlbumRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    created_at: datetime
    user_id: int


class AlbumCreate(BaseModel):
    name: str
    description: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Ten album khong duoc de trong.")
        return value


class AlbumUpdate(BaseModel):
    name: str
    description: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Ten album khong duoc de trong.")
        return value


class PhotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    image_url: str
    album_id: Optional[int]
    is_favorite: bool
    uploaded_at: datetime
    user_id: int


class PhotoUpdate(BaseModel):
    title: str
    description: str = ""
    album_id: Optional[int] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Tieu de anh khong duoc de trong.")
        return value


class PhotoAlbumUpdate(BaseModel):
    album_id: Optional[int] = None


class FavoriteToggleResponse(BaseModel):
    is_favorite: bool
