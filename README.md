# AIkougi - マルチAI統合エンジニア養成プログラム管理システム

年間400万円の企業向けAI研修プログラム（月2回×60分×12ヶ月=24回）を管理するWebアプリケーション。各社ごとにカスタマイズされた12ヶ月のロードマップ、進捗、課題、効果測定を一元管理します。

## 🌐 公開URL

- **本番環境**: https://aikougi.pages.dev ✅
- **開発環境**: https://3000-ij8wx0or6akhsj3ef7imf-de59bda9.sandbox.novita.ai
- **GitHub**: https://github.com/snshackco-svg/AIkougi

## 📋 プロジェクト概要

### 目的
企業向けマルチAI統合エンジニア養成プログラムの進捗管理、システム開発追跡、ROI測定を一元化し、効率的なプログラム運営を実現する。

### 主要機能（MVP実装済み）

#### ✅ 完成機能

1. **ダッシュボード**
   - プログラム全体の進捗バー（24回中○回完了）
   - 次回セッション情報（日程、テーマ）
   - 累計削減効果（時間・金額）のリアルタイム表示
   - ROI計算（投資回収率）
   - 開発中システム一覧（ステータス付き）

2. **24回講義スケジュール管理**
   - Phase 1: 個別習得（第1-12回）
   - Phase 2: 統合（第13-18回）
   - Phase 3: マスター（第19-24回）
   - タイムライン表示
   - **✨ ワンクリックステータス変更**：ボタン1つで簡単にステータス更新
     - 「予定」「完了」「キャンセル」を即座に切り替え
     - モーダル不要のシンプルな操作
     - リアルタイム更新とトースト通知
   - 各セッションの詳細情報（授業内容・開発内容）

3. **システム開発プロジェクト管理**（🆕 企業別カスタマイズ対応）
   - システム一覧（カード表示）
   - **✨ 新規システム追加**：企業ごとに開発システムを自由に追加（制限なし）
   - **✨ システム編集**：名称、目的、AIツール、進捗率などを更新
   - **✨ システム削除**：不要なシステムを削除
   - 進捗率表示・スライダー調整
   - ステータス管理（企画中/開発中/テスト中/本番稼働/運用中）
   - 使用AIツール選択（Genspark/ChatGPT/Claude/Gemini/Comet）
   - **実績効果の入力**：削減時間・削減金額（実績値のみ）
   - 削減効果トラッキング

4. **効果測定・ROI管理**
   - 累計削減時間・金額の表示（実績値）
   - システム別効果一覧（進捗率、実績値）
   - ROI自動計算

5. **企業プロフィール管理**
   - 企業基本情報
   - 担当者情報
   - 主要業務課題
   - 契約情報

#### 🚧 今後実装予定

1. **課題・宿題管理**（Phase 2）
   - 課題提出フォーム
   - 評価・フィードバック機能
   - 提出状況ダッシュボード

2. **ドキュメント管理**（Phase 2）
   - ファイルアップロード/ダウンロード
   - カテゴリー別管理
   - バージョン管理

3. **コミュニケーション機能**（Phase 3）
   - メッセージ機能
   - Slack連携
   - 通知システム

4. **高度な分析機能**（Phase 3）
   - 月次レポート自動生成
   - グラフ・チャート可視化
   - 経営層向けダッシュボード

## 🏗 技術スタック

### フロントエンド
- **HTML/CSS/JavaScript**: バニラJS（フレームワークなし）
- **TailwindCSS**: CDN経由でスタイリング
- **Font Awesome**: アイコン
- **Chart.js**: グラフ可視化（今後実装）
- **Axios**: HTTP通信

### バックエンド
- **Hono**: 軽量高速なWebフレームワーク
- **TypeScript**: 型安全な開発
- **Cloudflare Workers**: エッジランタイム

### データベース
- **Cloudflare D1**: SQLiteベースの分散データベース
- **ローカル開発**: `.wrangler/state/v3/d1`（--localモード）

### デプロイ
- **Cloudflare Pages**: エッジデプロイメント
- **PM2**: ローカル開発サーバー管理
- **Wrangler**: Cloudflare CLI

## 📊 データモデル

### 主要テーブル

1. **companies（企業）**
   - 企業基本情報、担当者、契約情報
   - AI活用レベル、業務課題

2. **sessions（セッション）**
   - 24回の講義情報
   - Phase、テーマ、授業内容、開発内容
   - スケジュール、ステータス

3. **systems（システム開発）**
   - 企業ごとにカスタマイズ可能な開発プロジェクト（制限なし）
   - 使用AIツール、進捗率
   - 実績削減効果（時間・金額）

4. **measurements（効果測定）**
   - システム別削減時間・金額
   - 測定日、測定方法

5. **assignments（課題）** - Phase 2実装予定
6. **documents（ドキュメント）** - Phase 2実装予定
7. **messages（メッセージ）** - Phase 3実装予定

## 🚀 セットアップ・開発

### 必要要件
- Node.js 18+
- npm または yarn
- PM2（ローカル開発用）
- Wrangler CLI（Cloudflare）

### 環境構成

| 環境 | データベース | 用途 |
|------|------------|------|
| **ローカル** | aikougi-development (local) | ローカル開発・テスト |
| **開発環境** | aikougi-development (remote) | リモート開発・検証 |
| **本番環境** | aikougi-production (remote) | 顧客利用 |

📖 **詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください**

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/snshackco-svg/AIkougi.git
cd AIkougi

# 依存関係をインストール
npm install

# ローカル開発環境のセットアップ（開発用DBを使用）
npm run db:reset:local
```

### ローカル開発

```bash
# ビルド
npm run build

# PM2で開発サーバー起動（開発用DBを使用）
pm2 start ecosystem.config.cjs

# サービス確認
npm test
# または
curl http://localhost:3000

# ログ確認
pm2 logs aikougi-dev --nostream

# サービス停止
pm2 stop aikougi-dev
pm2 delete aikougi-dev
```

### データベース操作

```bash
# ローカル開発環境
npm run db:reset:local        # DBリセット+マイグレーション+シード
npm run db:migrate:local      # マイグレーションのみ
npm run db:seed:local         # シードデータ投入
npm run db:console:local      # DBコンソール

# リモート開発環境
npm run db:migrate:dev        # マイグレーション適用
npm run db:console:dev        # DBコンソール

# 本番環境（慎重に！）
npm run backup:prod           # バックアップ作成
npm run db:migrate:check      # マイグレーション確認
npm run db:migrate:prod       # マイグレーション適用
npm run db:console:prod       # DBコンソール
```

## 📦 本番デプロイ（Cloudflare Pages）

### ✅ デプロイ済み環境

- **本番環境**: https://aikougi.pages.dev
- **プロジェクト名**: aikougi
- **本番DB**: aikougi-production (cf8e5dad-0a18-45fc-9698-321e1bffb1ff)
- **開発DB**: aikougi-development (7309601f-8a81-49d7-813b-9a0e6fc17030)

### 🚀 安全なデプロイ手順（推奨）

```bash
# 完全自動デプロイ（バックアップ→マイグレーション→ビルド→デプロイ）
npm run deploy:prod
```

このコマンドは以下を自動実行します：
1. ✅ 本番データベースの自動バックアップ（`backups/` に保存）
2. ✅ データベースマイグレーションの安全な適用
3. ✅ アプリケーションのビルド
4. ✅ Cloudflare Pagesへのデプロイ

**既存の顧客データは完全に保持されます！**

### 📝 手動デプロイ手順

```bash
# Step 1: バックアップ（必須）
npm run backup:prod

# Step 2: マイグレーション確認
npm run db:migrate:check

# Step 3: マイグレーション適用
npm run db:migrate:prod

# Step 4: ビルドとデプロイ
npm run build
npx wrangler pages deploy dist --project-name aikougi --branch main
```

### 開発環境へのデプロイ

```bash
# 開発環境にデプロイ（バックアップ不要）
npm run deploy:dev
```

### 🔐 環境変数設定

```bash
# 本番環境シークレット（Cloudflareダッシュボードで設定推奨）
npx wrangler pages secret put SESSION_SECRET --project-name aikougi

# ローカル開発用（.dev.vars ファイル）
# .dev.vars ファイルを編集してください
```

### 💾 バックアップとリストア

```bash
# バックアップ作成
npm run backup:prod

# バックアップファイルは backups/ ディレクトリに保存されます
# 例: backups/aikougi-production_20250113_143022.sql

# リストア（緊急時）
npx wrangler d1 execute aikougi-production --remote \
  --file=./backups/aikougi-production_YYYYMMDD_HHMMSS.sql
```

### 🔍 デプロイ前チェックリスト

- [ ] ローカルでビルドが成功する（`npm run build`）
- [ ] マイグレーション内容を確認（`npm run db:migrate:check`）
- [ ] 変更内容をGitにコミット
- [ ] バックアップが自動実行されることを確認
- [ ] デプロイは営業時間外に実施（推奨）

### 🛟 トラブルシューティング

デプロイで問題が発生した場合：

1. **バックアップを確認**: `ls -lt backups/`
2. **バックアップから復元**: 上記のリストア手順を参照
3. **詳細なログを確認**: `pm2 logs aikougi-dev --err`
4. **[DEPLOYMENT.md](./DEPLOYMENT.md) を参照**

## 📁 プロジェクト構造

```
aikougi/
├── src/
│   ├── index.tsx          # メインアプリケーション（APIルート）
│   └── renderer.tsx       # HTMLレンダラー
├── public/
│   └── static/
│       ├── app.js         # フロントエンドJavaScript
│       └── style.css      # カスタムCSS
├── migrations/
│   ├── 0001_initial_schema.sql  # DBスキーマ
│   └── 0002_remove_system_constraints.sql  # 制約削除
├── seed.sql               # 初期データ（24回カリキュラム）
├── ecosystem.config.cjs   # PM2設定
├── wrangler.jsonc         # Cloudflare設定
├── vite.config.ts         # Vite設定
├── package.json           # 依存関係・スクリプト
└── README.md
```

## 🎯 APIエンドポイント

### ダッシュボード
- `GET /api/dashboard/:companyId` - ダッシュボードデータ取得

### 企業管理
- `GET /api/companies/:id` - 企業情報取得
- `PUT /api/companies/:id` - 企業情報更新

### セッション管理
- `GET /api/sessions/:companyId` - セッション一覧
- `GET /api/sessions/:companyId/:sessionNumber` - セッション詳細
- `PUT /api/sessions/:companyId/:sessionNumber` - セッション更新

### システム開発管理
- `GET /api/systems/:companyId` - システム一覧
- `GET /api/systems/:companyId/:systemNumber` - システム詳細
- `POST /api/systems/:companyId` - システム新規作成
- `PUT /api/systems/:companyId/:systemNumber` - システム更新
- `DELETE /api/systems/:companyId/:systemNumber` - システム削除

### 効果測定
- `GET /api/measurements/:companyId` - 効果測定データ取得
- `POST /api/measurements/:companyId` - 効果測定データ追加

## 💡 使い方

### デモデータ
初期セットアップ後、以下のデモデータが利用可能です：

- **企業**: サンプル株式会社（製造業、従業員500名）
- **セッション**: 24回の標準カリキュラム
- **システム**: 12個の開発プロジェクト
- **効果測定**: 一部システムの実績データ

### ナビゲーション

1. **ダッシュボード**: プログラム全体の概要とKPI
2. **講義スケジュール**: 24回のセッション詳細
3. **システム開発**: 12個のプロジェクト管理
4. **効果測定**: ROIと削減効果の分析
5. **企業プロフィール**: 受講企業情報

## 🔐 セキュリティ

- D1データベースはCloudflare Workers環境で実行
- API認証は今後実装予定（Phase 2）
- 本番環境ではシークレット管理を推奨

## 📈 今後の開発予定

### Phase 2（中期）
- [ ] 課題・宿題管理機能
- [ ] ドキュメント管理（R2統合）
- [ ] セッション・システムの編集機能
- [ ] 認証・権限管理

### Phase 3（長期）
- [ ] メッセージ・コミュニケーション機能
- [ ] Slack連携
- [ ] 月次レポート自動生成（PDF）
- [ ] 高度なグラフ可視化
- [ ] 経営層向けダッシュボード

## 📝 最近の更新履歴

### 2025-11-13 (v1.2.0) - 環境分離と安全なデプロイ ✅
- **🏗️ 環境分離**: 開発環境と本番環境の完全分離
- **💾 自動バックアップ**: デプロイ前の本番DBバックアップ機能
- **🔒 データ保護**: 既存顧客データを保持したままデプロイ可能
- **📝 ドキュメント**: DEPLOYMENT.md追加（詳細な環境管理手順）
- **🛠️ スクリプト整備**: 安全なデプロイフロー自動化
  - `npm run deploy:prod` - 完全自動デプロイ
  - `npm run backup:prod` - 手動バックアップ
  - `npm run db:migrate:check` - マイグレーション検証
- **データベース**: aikougi-development作成（開発用）

### 2025-11-12 (v1.1.0) - 管理者機能追加 ✅
- **👑 認証システム**: Cookie-based認証、bcryptパスワードハッシュ
- **👥 ユーザー管理**: 管理者によるユーザーCRUD操作
- **🏢 企業管理**: 新規企業追加、削除、有効/無効切り替え
- **📊 統計ダッシュボード**: システム全体の統計と分析
- **📜 活動ログ**: 全ユーザーの活動履歴追跡
- **⏱️ セッション管理**: アクティブセッション表示、強制ログアウト
- **📥 データエクスポート**: CSV形式でのデータダウンロード
- **⚙️ システム設定**: 設定値の管理画面
- **データベース**: migration 0003, 0004適用

### 2025-11-12 (v1.0.1) - 本番リリース ✅
- **🚀 デプロイ**: Cloudflare Pagesに本番デプロイ完了
- **修正**: システム作成の制限を解除（12個から無制限へ）
- **削除**: 期待削減時間・金額フィールドを削除（実績値のみに統一）
- **改善**: 効果測定画面を簡素化（目標値と達成率を削除）
- **データベース**: D1 production database作成、migration 0002適用

## 🐛 既知の問題

- システム詳細ページは未実装（クリック時アラート表示）
- グラフ可視化は未実装（Chart.js CDN読み込み済み）
- モバイル対応は部分的

## 📝 ライセンス

MIT License

## 👥 作成者

- **プロジェクト名**: AIkougi
- **作成日**: 2025-11-12
- **バージョン**: 1.0.0 MVP

## 🙏 謝辞

- Hono Framework
- Cloudflare Workers/Pages/D1
- TailwindCSS
- Font Awesome
- Chart.js

---

**Last Updated**: 2025-11-13 07:00 UTC (v1.2.0 - 環境分離と安全なデプロイ ✅)
