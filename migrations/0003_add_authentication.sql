-- ユーザー認証テーブル
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id INTEGER NOT NULL,
  role TEXT DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- ユーザーテーブルのインデックス
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_company_id ON users(company_id);

-- ユーザーセッション管理テーブル
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

-- ユーザーセッションテーブルのインデックス
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
