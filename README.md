# Gallery App

## Cong nghe

- Backend: FastAPI
- Frontend: ReactJS (Vite)
- Database: SQLite

## Chuc nang

- Dang ky, dang nhap
- Upload anh va luu metadata vao SQLite
- Xem danh sach, chi tiet, sua, xoa anh
- Tim kiem theo ten anh
- Sap xep anh theo ten A-Z hoac thu tu upload
- Download anh ve may
- Chuyen doi light mode / dark mode
- Phan quyen: user chi thao tac tren anh cua chinh minh

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

## Cai node_modules cho frontend

Co 2 cach:

```bash
npm install --prefix frontend
```

Hoac:

```bash
cd frontend
npm install
```

Neu can cai lai thu cong cac thu vien chinh cho frontend, co the dung:

```bash
cd frontend
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react
```

## Cach chay frontend

```bash
npm run dev --prefix frontend
```

Hoac:

```bash
cd frontend
npm run dev
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

## Ghi chu

- Thu muc `backend/uploads/` dung de luu file anh upload.
- File database duoc tao tai `backend/gallery.db` sau khi backend hoac seed script chay.

https://github.com/Luv210105/Project_GK.git
