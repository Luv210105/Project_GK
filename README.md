# Album Gallery App - De B

## Cong nghe

- Backend: FastAPI + SQLAlchemy
- Frontend: ReactJS (Vite)
- Database: SQLite

## Chuc nang da hoan thien theo de

- Dang ky, dang nhap
- Quan ly album: tao, sua, xoa
- Xoa album khong xoa anh, chi dua `album_id` ve `NULL`
- Upload anh va gan album khi upload
- Sua thong tin anh va chuyen album
- Danh dau yeu thich cho tung anh
- Xem tat ca anh, loc theo album, xem danh sach yeu thich
- Tim kiem anh theo ten
- Download anh
- Phan quyen: user chi thao tac tren du lieu cua chinh minh

## Du lieu mau de B

Project su dung file du lieu da cung cap trong repo:

- `seed_data_b.json`
- `seed_data_b.sql`

Lenh seed hien tai doc tu `seed_data_b.json` va tao lai database dung schema de B.

Tai khoan seed:

- `alice / 123456`
- `bob / 123456`

Du lieu seed bao gom:

- 3 album: Du lich, Am thuc, Phong canh
- 6 anh mau
- mot so anh da duoc danh dau yeu thich

## Cau truc thu muc

```text
backend/
  app/
  scripts/
  uploads/
frontend/
  src/
seed_data_b.json
seed_data_b.sql
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
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay tai `http://127.0.0.1:5173`.

Trong dev mode, Vite da proxy san `/api` va `/uploads` sang backend `http://127.0.0.1:8000`, nen khong can cau hinh them de tranh loi CORS.

## API chinh

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Albums

- `POST /api/albums`
- `GET /api/albums`
- `PUT /api/albums/{album_id}`
- `DELETE /api/albums/{album_id}`
- `GET /api/albums/{album_id}/photos`

### Photos

- `GET /api/photos?q=keyword&album_id=1&favorites_only=true`
- `GET /api/photos/favorites`
- `POST /api/photos`
- `GET /api/photos/{photo_id}`
- `PUT /api/photos/{photo_id}`
- `PUT /api/photos/{photo_id}/album`
- `PUT /api/photos/{photo_id}/favorite`
- `DELETE /api/photos/{photo_id}`

## Ghi chu

- Thu muc `uploads/` chi dung cho anh upload moi tu giao dien.
- Anh trong seed data de B dung URL placeholder tu internet, phu hop voi noi dung de.
