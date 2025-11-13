#!/bin/bash
# マイグレーションの検証スクリプト
# 本番環境への適用前にマイグレーションをチェックします

set -e

echo "🔍 マイグレーションチェックを開始します..."
echo ""

# 開発環境で未適用のマイグレーションを確認
echo "📊 開発環境のマイグレーション状態:"
npx wrangler d1 migrations list aikougi-development --remote 2>&1 | grep -A 20 "Migration" || echo "   開発環境のデータベースが見つかりません"
echo ""

# 本番環境で未適用のマイグレーションを確認
echo "📊 本番環境のマイグレーション状態:"
npx wrangler d1 migrations list aikougi-production --remote 2>&1 | grep -A 20 "Migration" || echo "   エラー: 本番環境のデータベースが見つかりません"
echo ""

# 未適用のマイグレーションファイルを表示
echo "📝 マイグレーションファイル一覧:"
ls -1 migrations/ | sort
echo ""

# 警告メッセージ
echo "⚠️  重要な注意事項:"
echo "  1. マイグレーションは不可逆的な操作です"
echo "  2. 本番適用前に必ずバックアップを取得してください"
echo "  3. 本番適用は営業時間外に実施することを推奨します"
echo "  4. ALTER TABLE や DROP TABLE は既存データに影響します"
echo ""

# マイグレーション内容の確認
echo "🔬 最新のマイグレーションファイルの内容を確認:"
LATEST_MIGRATION=$(ls -1 migrations/*.sql | sort | tail -1)
if [ -n "$LATEST_MIGRATION" ]; then
  echo "ファイル: $LATEST_MIGRATION"
  echo "---"
  cat "$LATEST_MIGRATION"
  echo "---"
else
  echo "マイグレーションファイルが見つかりません"
fi
echo ""

echo "✅ マイグレーションチェック完了"
echo ""
echo "次のステップ:"
echo "  1. 開発環境でテスト: npm run db:migrate:dev"
echo "  2. バックアップ作成: npm run backup:prod"
echo "  3. 本番環境へ適用: npm run db:migrate:prod"
