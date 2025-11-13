-- クリーンなシードデータ

-- 企業データ
INSERT OR IGNORE INTO companies (
  id, name, industry, employee_count, revenue, ai_level, main_challenges,
  contact_name, contact_position, contact_email, contact_phone,
  contract_start_date, contract_amount, payment_status
) VALUES (
  1, '株式会社テックイノベーション', '製造業', 500, '100億円', 'intermediate',
  '["業務効率化", "DX推進", "人材育成", "コスト削減", "品質向上"]',
  '山田太郎', '情報システム部長', 'yamada@example.com', '03-1234-5678',
  '2025-01-15', 4000000, 'paid'
);

-- 24回の標準カリキュラムセッション (簡略版)
INSERT OR IGNORE INTO sessions (company_id, session_number, phase, theme, lesson_content, development_content, scheduled_date, status) VALUES
(1, 1, 1, '初回ヒアリング・ロードマップ策定', '{}', '{}', '2025-01-15 14:00:00', 'completed'),
(1, 2, 1, 'Genspark AI Developer完全攻略', '{}', '{}', '2025-01-29 14:00:00', 'completed'),
(1, 3, 1, 'Genspark実践開発', '{}', '{}', '2025-02-12 14:00:00', 'scheduled'),
(1, 4, 1, 'ChatGPT基礎', '{}', '{}', '2025-02-26 14:00:00', 'scheduled'),
(1, 5, 1, 'ChatGPT実践', '{}', '{}', '2025-03-12 14:00:00', 'scheduled'),
(1, 6, 1, 'Claude基礎', '{}', '{}', '2025-03-26 14:00:00', 'scheduled'),
(1, 7, 1, 'Claude実践', '{}', '{}', '2025-04-09 14:00:00', 'scheduled'),
(1, 8, 1, 'Gemini基礎', '{}', '{}', '2025-04-23 14:00:00', 'scheduled'),
(1, 9, 1, 'Gemini実践', '{}', '{}', '2025-05-14 14:00:00', 'scheduled'),
(1, 10, 1, 'Comet基礎', '{}', '{}', '2025-05-28 14:00:00', 'scheduled'),
(1, 11, 1, 'Comet実践', '{}', '{}', '2025-06-11 14:00:00', 'scheduled'),
(1, 12, 1, '個別習得総括', '{}', '{}', '2025-06-25 14:00:00', 'scheduled'),
(1, 13, 2, 'マルチAI統合基礎', '{}', '{}', '2025-07-09 14:00:00', 'scheduled'),
(1, 14, 2, 'マルチAI統合実践1', '{}', '{}', '2025-07-23 14:00:00', 'scheduled'),
(1, 15, 2, 'マルチAI統合実践2', '{}', '{}', '2025-08-13 14:00:00', 'scheduled'),
(1, 16, 2, 'マルチAI統合実践3', '{}', '{}', '2025-08-27 14:00:00', 'scheduled'),
(1, 17, 2, 'マルチAI統合実践4', '{}', '{}', '2025-09-10 14:00:00', 'scheduled'),
(1, 18, 2, '統合総括', '{}', '{}', '2025-09-24 14:00:00', 'scheduled'),
(1, 19, 3, 'マスター実践1', '{}', '{}', '2025-10-08 14:00:00', 'scheduled'),
(1, 20, 3, 'マスター実践2', '{}', '{}', '2025-10-22 14:00:00', 'scheduled'),
(1, 21, 3, 'マスター実践3', '{}', '{}', '2025-11-12 14:00:00', 'scheduled'),
(1, 22, 3, 'マスター実践4', '{}', '{}', '2025-11-26 14:00:00', 'scheduled'),
(1, 23, 3, 'マスター実践5', '{}', '{}', '2025-12-10 14:00:00', 'scheduled'),
(1, 24, 3, '最終成果発表・修了式', '{}', '{}', '2025-12-24 14:00:00', 'scheduled');

-- システムデータ (12システム)
INSERT OR IGNORE INTO systems (company_id, system_number, name, purpose, ai_tools, status, progress, actual_cost_reduction) VALUES
(1, 1, '見積書自動生成システム', '見積書作成の自動化', '["Genspark"]', 'development', 70, 50),
(1, 2, '在庫管理最適化システム', '在庫の可視化と最適化', '["ChatGPT"]', 'planning', 30, 30),
(1, 3, '品質検査自動化', '品質検査の効率化', '["Gemini"]', 'planning', 20, NULL),
(1, 4, '営業日報自動生成', '営業活動の記録自動化', '["Claude"]', 'planning', 10, NULL),
(1, 5, '顧客問い合わせ自動応答', '問い合わせ対応の自動化', '["ChatGPT"]', 'planning', 0, NULL),
(1, 6, '受発注管理システム', '受発注業務の効率化', '["Genspark"]', 'planning', 0, NULL),
(1, 7, '生産計画最適化', '生産計画の自動化', '["Comet"]', 'planning', 0, NULL),
(1, 8, '請求書処理自動化', '請求書処理の効率化', '["Claude"]', 'planning', 0, NULL),
(1, 9, '社内FAQ自動応答', '社内問い合わせの自動化', '["ChatGPT"]', 'planning', 0, NULL),
(1, 10, '会議議事録自動作成', '議事録作成の自動化', '["Gemini"]', 'planning', 0, NULL),
(1, 11, '勤怠管理最適化', '勤怠管理の効率化', '["Genspark"]', 'planning', 0, NULL),
(1, 12, '研修資料自動生成', '研修資料作成の自動化', '["Claude"]', 'planning', 0, NULL);
