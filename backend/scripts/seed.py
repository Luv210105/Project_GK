from __future__ import annotations

from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.config import UPLOAD_DIR
from app.database import Base, SessionLocal, engine
from app.models import Photo, User
from app.security import hash_password


def ensure_svg(filename: str, label: str, color_a: str, color_b: str) -> str:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        file_path.write_text(
            f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<defs>
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="{color_a}" />
    <stop offset="100%" stop-color="{color_b}" />
  </linearGradient>
</defs>
<rect width="1200" height="800" fill="url(#bg)" rx="36" />
<circle cx="980" cy="180" r="120" fill="rgba(255,255,255,0.15)" />
<circle cx="260" cy="620" r="160" fill="rgba(255,255,255,0.12)" />
<text x="80" y="140" font-size="54" font-family="Segoe UI, Arial, sans-serif" fill="white">{label}</text>
<text x="80" y="220" font-size="26" font-family="Segoe UI, Arial, sans-serif" fill="white">Sample photo for Gallery App demo</text>
</svg>""",
            encoding="utf-8",
        )
    return f"/uploads/{filename}"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "demo").first()
        if user is None:
            user = User(
                username="demo",
                email="demo@example.com",
                password=hash_password("demo123"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        existing_titles = {photo.title for photo in db.query(Photo).filter(Photo.user_id == user.id).all()}
        samples = [
            ("Sunset Memory", "Ảnh demo đầu tiên cho bài gallery app.", "demo-sunset.svg", "#ff7a18", "#af002d"),
            ("Ocean Mood", "Ảnh demo thứ hai để kiểm tra danh sách và chi tiết.", "demo-ocean.svg", "#0f2027", "#2c5364"),
        ]

        for title, description, filename, color_a, color_b in samples:
            if title in existing_titles:
                continue
            image_url = ensure_svg(filename, title, color_a, color_b)
            db.add(
                Photo(
                    title=title,
                    description=description,
                    image_url=image_url,
                    user_id=user.id,
                )
            )

        db.commit()
        print("Seeded demo user: demo / demo123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

