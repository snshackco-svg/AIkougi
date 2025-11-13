#!/bin/bash
# 本番環境への安全なデプロイスクリプト
# バックアップ → マイグレーション → デプロイの順で実行

set -e

echo "🚀 本番環境へのデプロイを開始します..."
echo ""

# 確認プロンプト
echo "⚠️  本番環境へデプロイしようとしています。"
echo "   このスクリプトは以下を実行します:"
echo "   1. 本番データベースのバックアップ"
echo "   2. データベースマイグレーションの適用"
echo "   3. アプリケーションのビルド"
echo "   4. Cloudflare Pagesへのデプロイ"
echo ""

# 非対話モード以外では確認を求める
if [ -t 0 ]; then
  read -p "続行しますか？ (yes/no): " -r
  echo
  if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "❌ デプロイをキャンセルしました"
    exit 1
  fi
fi

# Step 1: バックアップ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1/4: 本番データベースのバックアップ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./scripts/backup-production.sh
echo ""

# Step 2: マイグレーション
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Step 2/4: データベースマイグレーション"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "本番データベースにマイグレーションを適用します..."
npx wrangler d1 migrations apply aikougi-production --remote --env production || {
  echo "❌ マイグレーションに失敗しました"
  echo "   バックアップファイルから復元することができます: backups/"
  exit 1
}
echo "✅ マイグレーション完了"
echo ""

# Step 3: ビルド
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  Step 3/4: アプリケーションのビルド"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build || {
  echo "❌ ビルドに失敗しました"
  exit 1
}
echo "✅ ビルド完了"
echo ""

# Step 4: デプロイ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Step 4/4: Cloudflare Pagesへデプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx wrangler pages deploy dist --project-name aikougi --branch main || {
  echo "❌ デプロイに失敗しました"
  exit 1
}
echo "✅ デプロイ完了"
echo ""

# 成功メッセージ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 本番環境へのデプロイが完了しました！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 デプロイ先:"
echo "   https://aikougi.pages.dev"
echo ""
echo "📊 確認事項:"
echo "   1. アプリケーションが正常に動作するか確認"
echo "   2. データベースのデータが保持されているか確認"
echo "   3. 新機能が正常に動作するか確認"
echo ""
echo "📦 バックアップファイル:"
echo "   backups/ ディレクトリに保存されています"
echo ""
