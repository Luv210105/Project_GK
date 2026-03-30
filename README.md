# Gallery App

Gallery App duoc build theo dung de bai trong file `chuan-bi-gk_20260323.docx` va checklist `gallery_app_checklist.pdf`.

## Cong nghe

- Backend: FastAPI
- Frontend: ReactJS (Vite)
- Database: SQLite

## Chuc nang da hoan thanh

- Dang ky, dang nhap
- Hash password truoc khi luu
- Upload anh va luu metadata vao SQLite
- Xem danh sach anh cua user hien tai
- Xem chi tiet anh
- Sua title va description
- Xoa anh
- Tim kiem anh theo title
- Phan quyen: user chi thao tac tren anh cua chinh minh
- Route guard frontend khi chua dang nhap
- Du lieu demo de test nhanh

## Cau truc thu muc

```text
backend/
  app/
  scripts/
  uploads/
frontend/
  src/
```

## Cach chay backend

```bash
cd backend
python -m pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload
```

Backend mac dinh chay tai `http://127.0.0.1:8000`.

## Cach chay frontend

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

Frontend mac dinh chay tai `http://127.0.0.1:5173` va goi API den `http://127.0.0.1:8000`.

Neu can doi dia chi backend, tao file `frontend/.env` voi noi dung:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Tai khoan demo

Sau khi chay `python scripts/seed.py` trong thu muc `backend`, he thong tao tai khoan:

- Username: `demo`
- Email: `demo@example.com`
- Password: `demo123`

Dong thoi co 2 anh SVG mau de demo gallery, detail va search.

## API chinh

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/photos?q=keyword`
- `POST /api/photos`
- `GET /api/photos/{photo_id}`
- `PUT /api/photos/{photo_id}`
- `DELETE /api/photos/{photo_id}`

## Kiem tra da thuc hien

- Da seed du lieu demo thanh cong.
- Da smoke test backend cho cac luong: register, login, upload, list, detail, update, delete.
- Da build frontend thanh cong bang `npm run build --prefix frontend`.

## Ghi chu

- Thu muc `backend/uploads/` dung de luu file anh upload.
- File database duoc tao tai `backend/gallery.db` sau khi backend hoac seed script chay.
