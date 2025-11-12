-- マルチAI統合エンジニア養成プログラム 講義ロードマップ管理システム
-- 初期データベーススキーマ

-- 企業テーブル
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER,
  revenue TEXT,
  ai_level TEXT CHECK(ai_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  main_challenges TEXT, -- JSON形式で保存
  contact_name TEXT NOT NULL,
  contact_position TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contract_start_date DATE,
  contract_amount INTEGER DEFAULT 4000000,
  payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'partial')) DEFAULT 'pending',
  customization_info TEXT, -- JSON形式でカスタマイズ情報を保存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- セッションテーブル (24回の講義)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL CHECK(session_number >= 1 AND session_number <= 24),
  scheduled_date DATETIME,
  phase INTEGER CHECK(phase IN (1, 2, 3)), -- Phase 1: 個別習得, Phase 2: 統合, Phase 3: マスター
  theme TEXT NOT NULL,
  lesson_content TEXT, -- JSON形式で授業内容を保存
  development_content TEXT, -- JSON形式で開発内容を保存
  status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  attendance_status TEXT CHECK(attendance_status IN ('absent', 'present', 'partial')) DEFAULT 'absent',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, session_number)
);

-- 課題・宿題テーブル
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  submission_date DATETIME,
  status TEXT CHECK(status IN ('not_submitted', 'submitted', 'approved', 'revision_required')) DEFAULT 'not_submitted',
  score INTEGER CHECK(score >= 0 AND score <= 100),
  feedback TEXT,
  submission_content TEXT, -- JSON形式で提出内容を保存
  revision_history TEXT, -- JSON形式で再提出履歴を保存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- システム開発プロジェクトテーブル (12個のシステム)
CREATE TABLE IF NOT EXISTS systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  system_number INTEGER NOT NULL CHECK(system_number >= 1 AND system_number <= 12),
  name TEXT NOT NULL,
  purpose TEXT,
  ai_tools TEXT, -- JSON形式で使用AIツールを保存 (Genspark/ChatGPT/Claude/Gemini/Comet)
  status TEXT CHECK(status IN ('planning', 'development', 'testing', 'production', 'operation')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  assigned_session INTEGER, -- どのセッションで開発するか
  expected_time_reduction REAL, -- 期待削減時間（時間/日）
  expected_cost_reduction REAL, -- 期待削減金額（万円）
  actual_time_reduction REAL, -- 実際の削減時間（時間/日）
  actual_cost_reduction REAL, -- 実際の削減金額（万円）
  project_memo TEXT,
  requirements TEXT, -- JSON形式で要件定義を保存
  technical_spec TEXT, -- JSON形式で技術仕様を保存
  development_log TEXT, -- JSON形式で開発ログを保存
  test_results TEXT, -- JSON形式でテスト結果を保存
  user_feedback TEXT, -- JSON形式でユーザーフィードバックを保存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, system_number)
);

-- 効果測定テーブル
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  system_id INTEGER,
  measurement_date DATE NOT NULL,
  time_reduction REAL, -- 削減時間（時間/日）
  cost_reduction REAL, -- 削減金額（万円）
  measurement_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE SET NULL
);

-- ドキュメントテーブル
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  category TEXT CHECK(category IN ('hearing', 'roadmap', 'monthly_report', 'proposal', 'contract', 'minutes', 'slides', 'assignment', 'specification')),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  description TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  session_id INTEGER,
  sender_type TEXT CHECK(sender_type IN ('instructor', 'company')) NOT NULL,
  sender_name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  attachment_path TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_sessions_company ON sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_assignments_company ON assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_assignments_session ON assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_systems_company ON systems(company_id);
CREATE INDEX IF NOT EXISTS idx_systems_status ON systems(status);
CREATE INDEX IF NOT EXISTS idx_measurements_company ON measurements(company_id);
CREATE INDEX IF NOT EXISTS idx_measurements_system ON measurements(system_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(measurement_date);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_messages_company ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
