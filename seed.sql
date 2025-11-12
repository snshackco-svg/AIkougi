-- シードデータ: デモ企業と24回標準カリキュラム

-- デモ企業を挿入
INSERT INTO companies (
  name, 
  industry, 
  employee_count, 
  revenue, 
  ai_level, 
  main_challenges,
  contact_name, 
  contact_position, 
  contact_email, 
  contact_phone,
  contract_start_date,
  contract_amount,
  payment_status
) VALUES (
  'サンプル株式会社',
  '製造業',
  500,
  '100億円',
  'intermediate',
  '["業務効率化", "DX推進", "人材育成", "コスト削減", "品質向上"]',
  '山田太郎',
  '情報システム部長',
  'yamada@example.com',
  '03-1234-5678',
  '2025-01-15',
  4000000,
  'paid'
);

-- 24回の標準カリキュラムセッションを挿入
INSERT INTO sessions (company_id, session_number, phase, theme, lesson_content, development_content, scheduled_date, status) VALUES
-- Phase 1: 個別習得 (第1-12回)
(1, 1, 1, '初回ヒアリング・ロードマップ策定', 
'{"objectives": ["企業の業務課題を徹底ヒアリング", "12ヶ月の開発計画を策定", "各社専用ロードマップ作成"], "duration": 60}',
'{"theme": "ヒアリング", "target": "企業課題の可視化", "tools": [], "goal": "カスタマイズロードマップ完成"}',
'2025-01-15 14:00:00', 'completed'),

(1, 2, 1, 'Genspark AI Developer完全攻略 + 初回システム企画',
'{"objectives": ["Genspark基本操作", "AI Developer機能", "プロジェクト管理"], "points": ["コード生成の基礎", "デバッグ方法", "バージョン管理"], "demo": "簡単なWebアプリ作成", "duration": 30}',
'{"theme": "システム1企画", "target": "業務効率化ツール", "tools": ["Genspark"], "goal": "要件定義完了"}',
'2025-01-29 14:00:00', 'completed'),

(1, 3, 1, 'Genspark実践開発 + システム開発1',
'{"objectives": ["実践的なコーディング", "API連携", "デプロイ方法"], "points": ["エラー処理", "セキュリティ", "パフォーマンス"], "demo": "API統合", "duration": 30}',
'{"theme": "システム1開発", "target": "見積書自動生成システム", "tools": ["Genspark"], "goal": "プロトタイプ完成"}',
'2025-02-12 14:00:00', 'scheduled'),

(1, 4, 1, 'Genspark応用テクニック + システム開発2',
'{"objectives": ["高度な機能実装", "カスタムコンポーネント", "最適化手法"], "points": ["パターン活用", "ベストプラクティス", "保守性"], "demo": "複雑な業務ロジック", "duration": 30}',
'{"theme": "システム2開発", "target": "営業日報自動作成システム", "tools": ["Genspark"], "goal": "基本機能実装"}',
'2025-02-26 14:00:00', 'scheduled'),

(1, 5, 1, 'Genspark統合・API連携 + システム開発3',
'{"objectives": ["外部サービス連携", "Webhook活用", "自動化フロー"], "points": ["認証方法", "データ同期", "エラーハンドリング"], "demo": "Slack/Teams連携", "duration": 30}',
'{"theme": "システム3開発", "target": "在庫管理アラートシステム", "tools": ["Genspark"], "goal": "外部連携実装"}',
'2025-03-12 14:00:00', 'scheduled'),

(1, 6, 1, 'ChatGPT基礎・Custom GPTs + システム開発4',
'{"objectives": ["ChatGPT基本操作", "Custom GPTs作成", "プロンプトエンジニアリング"], "points": ["効果的な指示", "Few-shot learning", "GPT設計"], "demo": "業務用GPT作成", "duration": 30}',
'{"theme": "システム4開発", "target": "問い合わせ自動応答GPT", "tools": ["ChatGPT"], "goal": "Custom GPT完成"}',
'2025-03-26 14:00:00', 'scheduled'),

(1, 7, 1, 'ChatGPT応用・Zapier連携 + システム開発5',
'{"objectives": ["Zapier自動化", "GPT API活用", "ワークフロー構築"], "points": ["トリガー設定", "アクション連鎖", "エラー対策"], "demo": "メール→GPT→Slack", "duration": 30}',
'{"theme": "システム5開発", "target": "受注処理自動化システム", "tools": ["ChatGPT", "Zapier"], "goal": "ワークフロー完成"}',
'2025-04-09 14:00:00', 'scheduled'),

(1, 8, 1, 'Claude完全攻略・Projects活用 + システム開発6',
'{"objectives": ["Claude特徴理解", "Projects機能", "長文処理"], "points": ["コンテキスト管理", "ファイル分析", "コード生成"], "demo": "大規模文書分析", "duration": 30}',
'{"theme": "システム6開発", "target": "契約書レビューシステム", "tools": ["Claude"], "goal": "文書分析機能実装"}',
'2025-04-23 14:00:00', 'scheduled'),

(1, 9, 1, 'Claude応用・大規模文書処理 + システム開発7',
'{"objectives": ["複数文書処理", "要約生成", "情報抽出"], "points": ["バッチ処理", "品質管理", "結果検証"], "demo": "報告書自動要約", "duration": 30}',
'{"theme": "システム7開発", "target": "会議議事録自動生成", "tools": ["Claude"], "goal": "要約機能完成"}',
'2025-05-14 14:00:00', 'scheduled'),

(1, 10, 1, 'Gemini応用・Deep Research + システム開発8',
'{"objectives": ["Gemini特性", "Deep Research機能", "マルチモーダル"], "points": ["画像認識", "動画分析", "統合検索"], "demo": "市場調査自動化", "duration": 30}',
'{"theme": "システム8開発", "target": "競合分析レポート生成", "tools": ["Gemini"], "goal": "調査機能実装"}',
'2025-05-28 14:00:00', 'scheduled'),

(1, 11, 1, 'Comet Browser・Web自動化 + システム開発9',
'{"objectives": ["Comet基礎", "Web自動化", "スクレイピング"], "points": ["要素取得", "操作自動化", "データ抽出"], "demo": "価格監視bot", "duration": 30}',
'{"theme": "システム9開発", "target": "発注先価格監視システム", "tools": ["Comet"], "goal": "自動巡回実装"}',
'2025-06-11 14:00:00', 'scheduled'),

(1, 12, 1, 'Phase1総復習・中間評価 + システム開発10',
'{"objectives": ["Phase1振り返り", "各AI比較", "効果測定"], "points": ["適材適所", "組み合わせ", "ROI計算"], "demo": "9システム連携", "duration": 30}',
'{"theme": "システム10開発", "target": "発注書自動作成システム", "tools": ["複数AI"], "goal": "統合機能実装"}',
'2025-06-25 14:00:00', 'scheduled'),

-- Phase 2: 統合 (第13-18回)
(1, 13, 2, '5AI統合設計の考え方 + 統合システム企画',
'{"objectives": ["統合設計思想", "アーキテクチャ設計", "データフロー"], "points": ["役割分担", "連携方法", "拡張性"], "demo": "統合システム設計", "duration": 30}',
'{"theme": "統合システム企画", "target": "5AI統合プラットフォーム", "tools": ["全AI"], "goal": "設計書完成"}',
'2025-07-09 14:00:00', 'scheduled'),

(1, 14, 2, '統合システム開発1 + 実装サポート',
'{"objectives": ["基盤構築", "認証統合", "データ連携"], "points": ["セキュリティ", "パフォーマンス", "監視"], "demo": "認証システム", "duration": 30}',
'{"theme": "基盤開発", "target": "統合認証・ルーティング", "tools": ["全AI"], "goal": "基盤完成"}',
'2025-07-23 14:00:00', 'scheduled'),

(1, 15, 2, '統合システム開発2 + 実装サポート',
'{"objectives": ["業務フロー実装", "UI/UX構築", "テスト"], "points": ["ユーザビリティ", "レスポンス", "エラー処理"], "demo": "管理画面", "duration": 30}',
'{"theme": "フロント開発", "target": "統合ダッシュボード", "tools": ["全AI"], "goal": "画面完成"}',
'2025-08-06 14:00:00', 'scheduled'),

(1, 16, 2, '統合システム開発3 + 実装サポート',
'{"objectives": ["高度な機能", "自動化強化", "最適化"], "points": ["AI切り替えロジック", "キャッシュ", "並列処理"], "demo": "インテリジェントルーティング", "duration": 30}',
'{"theme": "高度化", "target": "自動AI選択機能", "tools": ["全AI"], "goal": "最適化完了"}',
'2025-08-20 14:00:00', 'scheduled'),

(1, 17, 2, '統合システムテスト・改善 + デバッグサポート',
'{"objectives": ["総合テスト", "負荷テスト", "セキュリティ監査"], "points": ["バグ修正", "パフォーマンス", "脆弱性"], "demo": "品質保証", "duration": 30}',
'{"theme": "品質向上", "target": "テスト・デバッグ", "tools": ["全AI"], "goal": "本番準備完了"}',
'2025-09-03 14:00:00', 'scheduled'),

(1, 18, 2, '統合システム完成・社内展開 + 展開サポート',
'{"objectives": ["本番リリース", "ユーザー教育", "運用開始"], "points": ["マニュアル", "サポート体制", "フィードバック"], "demo": "全社展開", "duration": 30}',
'{"theme": "システム11完成", "target": "5AI統合プラットフォーム稼働", "tools": ["全AI"], "goal": "社内展開完了"}',
'2025-09-17 14:00:00', 'scheduled'),

-- Phase 3: マスター (第19-24回)
(1, 19, 3, 'マスタープロジェクト企画 + 企画サポート',
'{"objectives": ["最終プロジェクト立案", "事業インパクト設計", "ROI最大化"], "points": ["経営視点", "スケール", "持続性"], "demo": "事業計画", "duration": 30}',
'{"theme": "マスター企画", "target": "全社DX推進システム", "tools": ["全AI"], "goal": "企画承認"}',
'2025-10-01 14:00:00', 'scheduled'),

(1, 20, 3, 'マスタープロジェクト開発1 + 開発サポート',
'{"objectives": ["コア機能開発", "データ基盤", "API設計"], "points": ["拡張性", "保守性", "ドキュメント"], "demo": "システムコア", "duration": 30}',
'{"theme": "コア開発", "target": "全社業務統合システム", "tools": ["全AI"], "goal": "コア完成"}',
'2025-10-15 14:00:00', 'scheduled'),

(1, 21, 3, 'マスタープロジェクト開発2 + 開発サポート',
'{"objectives": ["応用機能開発", "AI最適化", "高度な自動化"], "points": ["機械学習活用", "予測分析", "レコメンド"], "demo": "高度機能", "duration": 30}',
'{"theme": "高度化", "target": "AI予測・最適化機能", "tools": ["全AI"], "goal": "高度機能完成"}',
'2025-10-29 14:00:00', 'scheduled'),

(1, 22, 3, 'マスタープロジェクト完成 + 最終調整',
'{"objectives": ["最終仕上げ", "パフォーマンス最適化", "セキュリティ強化"], "points": ["品質保証", "ストレステスト", "災害対策"], "demo": "完成システム", "duration": 30}',
'{"theme": "システム12完成", "target": "マスタープロジェクト完成", "tools": ["全AI"], "goal": "本番稼働"}',
'2025-11-12 14:00:00', 'scheduled'),

(1, 23, 3, '総復習・運用体制構築 + 運用計画',
'{"objectives": ["12ヶ月総括", "運用体制", "継続改善計画"], "points": ["保守手順", "監視体制", "アップデート"], "demo": "運用マニュアル", "duration": 30}',
'{"theme": "運用計画", "target": "持続的改善体制", "tools": ["全AI"], "goal": "運用体制確立"}',
'2025-11-26 14:00:00', 'scheduled'),

(1, 24, 3, '最終評価・修了式',
'{"objectives": ["プログラム総括", "ROI最終報告", "修了証授与"], "points": ["12システム成果", "削減効果", "今後の展望"], "demo": "最終プレゼン", "duration": 60}',
'{"theme": "修了", "target": "プログラム完了", "tools": [], "goal": "修了証取得"}',
'2025-12-10 14:00:00', 'scheduled');

-- 12個のシステム開発プロジェクトを挿入
INSERT INTO systems (company_id, system_number, name, purpose, ai_tools, status, progress, assigned_session, expected_time_reduction, expected_cost_reduction) VALUES
(1, 1, '見積書自動生成システム', '見積書作成の自動化により営業工数を削減', '["Genspark"]', 'development', 70, 3, 2.0, 300),
(1, 2, '営業日報自動作成システム', '営業活動の自動記録と報告書生成', '["Genspark"]', 'development', 60, 4, 1.5, 200),
(1, 3, '在庫管理アラートシステム', '在庫状況の自動監視と通知', '["Genspark", "Slack"]', 'planning', 40, 5, 1.0, 150),
(1, 4, '問い合わせ自動応答GPT', '顧客問い合わせの自動対応', '["ChatGPT"]', 'planning', 30, 6, 3.0, 400),
(1, 5, '受注処理自動化システム', '受注から発注までの自動化', '["ChatGPT", "Zapier"]', 'planning', 20, 7, 2.5, 350),
(1, 6, '契約書レビューシステム', '契約書の自動チェックとリスク検出', '["Claude"]', 'planning', 10, 8, 2.0, 280),
(1, 7, '会議議事録自動生成', '会議内容の自動文字起こしと要約', '["Claude"]', 'planning', 10, 9, 1.5, 200),
(1, 8, '競合分析レポート生成', '市場・競合情報の自動収集と分析', '["Gemini"]', 'planning', 0, 10, 2.0, 280),
(1, 9, '発注先価格監視システム', '仕入先価格の自動監視と通知', '["Comet"]', 'planning', 0, 11, 1.0, 150),
(1, 10, '発注書自動作成システム', '発注書の自動生成と送信', '["Genspark", "ChatGPT"]', 'planning', 0, 12, 1.5, 200),
(1, 11, '5AI統合プラットフォーム', '全AIツールを統合した業務プラットフォーム', '["Genspark", "ChatGPT", "Claude", "Gemini", "Comet"]', 'planning', 0, 18, 5.0, 700),
(1, 12, '全社DX推進システム', '全社的なDX推進を支援する統合システム', '["Genspark", "ChatGPT", "Claude", "Gemini", "Comet"]', 'planning', 0, 22, 10.0, 1500);

-- 効果測定データのサンプル
INSERT INTO measurements (company_id, system_id, measurement_date, time_reduction, cost_reduction, measurement_method) VALUES
(1, 1, '2025-03-01', 0.5, 50, '実測: 見積書作成時間を計測'),
(1, 1, '2025-03-15', 1.0, 100, '実測: 複数案件での平均時間'),
(1, 1, '2025-04-01', 1.5, 150, '実測: システム改善後の効果'),
(1, 2, '2025-03-20', 0.8, 80, '実測: 営業日報作成時間の削減');
