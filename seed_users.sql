-- 初期ユーザーデータ
-- パスワード: password123
-- パスワードハッシュ: $2b$10$5Z35o9Pv0z4OpZJfCY7Ij.Iy7.AXQ.wLevLufW0.ElTZpk..iJ4tu

-- 管理者アカウント（全企業を管理可能）
INSERT OR IGNORE INTO users (username, password_hash, company_id, role) VALUES
('admin', '$2b$10$5Z35o9Pv0z4OpZJfCY7Ij.Iy7.AXQ.wLevLufW0.ElTZpk..iJ4tu', 1, 'admin');

-- 企業1: 株式会社テックイノベーション のユーザー
INSERT OR IGNORE INTO users (username, password_hash, company_id, role) VALUES
('techinnovation', '$2b$10$5Z35o9Pv0z4OpZJfCY7Ij.Iy7.AXQ.wLevLufW0.ElTZpk..iJ4tu', 1, 'user');
