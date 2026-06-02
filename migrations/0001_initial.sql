CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  ten_danh_muc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  ten_san_pham TEXT NOT NULL,
  gia REAL NOT NULL DEFAULT 0,
  so_luong INTEGER NOT NULL DEFAULT 1,
  con_hang INTEGER NOT NULL DEFAULT 1,
  da_mua INTEGER NOT NULL DEFAULT 0,
  hinh_san_pham TEXT,
  ten_nhan_vat TEXT,
  shop_ban TEXT NOT NULL DEFAULT '',
  nguoi_mua TEXT,
  ngay_mua TEXT,
  ngay_them TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);