-- システム数の制限を削除し、期待削減値を削除するマイグレーション

-- 既存のsystemsテーブルを一時的にリネーム
ALTER TABLE systems RENAME TO systems_old;

-- 新しいsystemsテーブルを作成（制約なし、期待削減フィールドなし）
CREATE TABLE systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  system_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  ai_tools TEXT,
  status TEXT CHECK(status IN ('planning', 'development', 'testing', 'production', 'operation')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  assigned_session INTEGER,
  actual_time_reduction REAL,
  actual_cost_reduction REAL,
  project_memo TEXT,
  requirements TEXT,
  technical_spec TEXT,
  development_log TEXT,
  test_results TEXT,
  user_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, system_number)
);

-- データを移行
INSERT INTO systems (
  id, company_id, system_number, name, purpose, ai_tools, status, progress,
  assigned_session, actual_time_reduction, actual_cost_reduction, project_memo,
  requirements, technical_spec, development_log, test_results, user_feedback,
  created_at, updated_at
)
SELECT 
  id, company_id, system_number, name, purpose, ai_tools, status, progress,
  assigned_session, actual_time_reduction, actual_cost_reduction, project_memo,
  requirements, technical_spec, development_log, test_results, user_feedback,
  created_at, updated_at
FROM systems_old;

-- 古いテーブルを削除
DROP TABLE systems_old;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_systems_company ON systems(company_id);
CREATE INDEX IF NOT EXISTS idx_systems_status ON systems(status);
