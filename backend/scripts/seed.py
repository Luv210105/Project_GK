from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.config import DATA_DIR
from app.database import Base, SessionLocal, engine
from app.models import Album, Photo, User
from app.security import hash_password

SEED_FILE = ROOT_DIR.parent / "seed_data_b.json"


def seed() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SEED_FILE.open("r", encoding="utf-8") as file:
        seed_data = json.load(file)

    db = SessionLocal()
    try:
        users = []
        for item in seed_data.get("users", []):
            users.append(
                User(
                    id=item["id"],
                    username=item["username"],
                    email=item["email"],
                    password=hash_password(item["password"]),
                )
            )
        db.add_all(users)
        db.flush()

        albums = []
        for item in seed_data.get("albums", []):
            albums.append(
                Album(
                    id=item["id"],
                    name=item["name"],
                    description=item.get("description", ""),
                    user_id=item["user_id"],
                )
            )
        db.add_all(albums)
        db.flush()

        photos = []
        for item in seed_data.get("photos", []):
            photos.append(
                Photo(
                    id=item["id"],
                    title=item["title"],
                    description=item.get("description", ""),
                    image_url=item["image_url"],
                    album_id=item.get("album_id"),
                    is_favorite=bool(item.get("is_favorite", False)),
                    user_id=item["user_id"],
                )
            )
        db.add_all(photos)
        db.commit()

        print("Seeded users: alice / 123456, bob / 123456")
        print(f"Albums: {len(albums)}")
        print(f"Photos: {len(photos)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
