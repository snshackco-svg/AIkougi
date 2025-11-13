-- 活動ログテーブル（誰が何をしたか記録）
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_company_id ON activity_logs(company_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- システム設定テーブル
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- メールテンプレートテーブル
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 通知履歴テーブル
CREATE TABLE notification_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_created_at ON notification_history(created_at);
CREATE INDEX idx_notification_history_status ON notification_history(status);

-- 企業にis_activeフラグを追加（既存テーブルの拡張）
ALTER TABLE companies ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE companies ADD COLUMN deleted_at DATETIME;

-- バックアップ履歴テーブル
CREATE TABLE backup_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'completed',
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_backup_history_created_at ON backup_history(created_at);

-- デフォルトのシステム設定を挿入
INSERT INTO system_settings (key, value, description) VALUES
  ('session_duration_days', '7', 'ログインセッションの有効期限（日数）'),
  ('max_login_attempts', '5', '最大ログイン試行回数'),
  ('enable_email_notifications', 'false', 'メール通知を有効にするか'),
  ('backup_retention_days', '30', 'バックアップの保持期間（日数）');

-- デフォルトのメールテンプレートを挿入
INSERT INTO email_templates (name, subject, body, variables) VALUES
  ('user_created', '新規ユーザーアカウント作成のお知らせ', 
   'こんにちは {{username}} 様\n\nあなたのアカウントが作成されました。\nユーザー名: {{username}}\n初回ログインURL: {{login_url}}\n\nよろしくお願いいたします。',
   'username,login_url'),
  ('password_reset', 'パスワードリセットのご案内',
   'こんにちは {{username}} 様\n\nパスワードリセットのリクエストを受け付けました。\n以下のリンクからパスワードをリセットしてください。\n{{reset_url}}\n\nこのリンクは24時間有効です。',
   'username,reset_url'),
  ('system_alert', 'システムアラート通知',
   '管理者様\n\nシステムアラートが発生しました。\n内容: {{alert_message}}\n発生時刻: {{timestamp}}\n\n確認をお願いいたします。',
   'alert_message,timestamp');
