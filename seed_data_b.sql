-- ============================================
-- SEED DATA - ĐỀ B: ALBUM GALLERY APP
-- Import: sqlite3 gallery.db < seed_data_b.sql
-- ============================================

-- Tạo bảng
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    album_id INTEGER REFERENCES albums(id),
    is_favorite INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id)
);

-- ============================================
-- DỮ LIỆU MẪU
-- ============================================

-- Users (password là hash của "123456")
INSERT INTO users (id, username, email, password) VALUES
(1, 'alice', 'alice@example.com', '$2b$12$LJ3m4ys3Lk0TSwHlvDPsuOHHy3VYv1fMEKJfgO1X0T3YQa.hVfGi'),
(2, 'bob', 'bob@example.com', '$2b$12$LJ3m4ys3Lk0TSwHlvDPsuOHHy3VYv1fMEKJfgO1X0T3YQa.hVfGi');

-- Albums
INSERT INTO albums (id, name, description, user_id) VALUES
(1, 'Du lịch', 'Ảnh chụp trong các chuyến du lịch', 1),
(2, 'Ẩm thực', 'Các món ăn yêu thích', 1),
(3, 'Phong cảnh', 'Ảnh phong cảnh thiên nhiên', 2);

-- Photos
INSERT INTO photos (id, title, description, image_url, album_id, is_favorite, user_id) VALUES
(1, 'Biển Đà Nẵng', 'Hoàng hôn tại bãi biển Mỹ Khê', 'https://picsum.photos/id/100/800/600', 1, 1, 1),
(2, 'Phở Hà Nội', 'Phở bò truyền thống', 'https://picsum.photos/id/200/800/600', 2, 0, 1),
(3, 'Hội An đêm', 'Phố cổ Hội An về đêm với đèn lồng', 'https://picsum.photos/id/300/800/600', 1, 1, 1),
(4, 'Núi Fansipan', 'Đỉnh Fansipan trong sương mù', 'https://picsum.photos/id/400/800/600', 3, 0, 2),
(5, 'Bánh mì Sài Gòn', 'Bánh mì thịt nướng đặc biệt', 'https://picsum.photos/id/500/800/600', 2, 1, 1),
(6, 'Ruộng bậc thang', 'Ruộng bậc thang Mù Cang Chải mùa lúa chín', 'https://picsum.photos/id/600/800/600', NULL, 0, 2);
