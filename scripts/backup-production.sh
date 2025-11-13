#!/bin/bash
# 本番データベースのバックアップスクリプト
# デプロイ前に自動実行されます

set -e  # エラーが発生したら停止

echo "🔒 本番データベースのバックアップを開始します..."

# バックアップディレクトリの作成
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# タイムスタンプ
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/aikougi-production_${TIMESTAMP}.sql"

echo "📦 バックアップファイル: ${BACKUP_FILE}"

# 全テーブルのリストを取得
echo "📋 テーブル一覧を取得中..."
TABLES=$(npx wrangler d1 execute aikougi-production --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;" --json | jq -r '.[0].results[].name' 2>/dev/null || echo "")

if [ -z "$TABLES" ]; then
  echo "⚠️  テーブルが見つかりませんでした。データベースが空の可能性があります。"
  exit 0
fi

echo "📊 バックアップ対象テーブル:"
echo "$TABLES"

# SQLファイルの初期化
echo "-- AIkougi Production Database Backup" > "$BACKUP_FILE"
echo "-- Date: $(date)" >> "$BACKUP_FILE"
echo "-- Database: aikougi-production" >> "$BACKUP_FILE"
echo "" >> "$BACKUP_FILE"

# 各テーブルのデータをエクスポート
for TABLE in $TABLES; do
  echo "📤 テーブル '$TABLE' をバックアップ中..."
  
  # テーブル構造を取得
  echo "-- Table: $TABLE" >> "$BACKUP_FILE"
  npx wrangler d1 execute aikougi-production --remote --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='${TABLE}';" --json 2>/dev/null | jq -r '.[0].results[0].sql' >> "$BACKUP_FILE" || true
  echo ";" >> "$BACKUP_FILE"
  echo "" >> "$BACKUP_FILE"
  
  # データを取得
  echo "-- Data for table: $TABLE" >> "$BACKUP_FILE"
  
  # 行数を確認
  ROW_COUNT=$(npx wrangler d1 execute aikougi-production --remote --command="SELECT COUNT(*) as count FROM ${TABLE};" --json 2>/dev/null | jq -r '.[0].results[0].count' || echo "0")
  
  if [ "$ROW_COUNT" -gt 0 ]; then
    echo "   → $ROW_COUNT 行をエクスポート"
    
    # データのエクスポート（JSONで取得してINSERT文に変換）
    npx wrangler d1 execute aikougi-production --remote --command="SELECT * FROM ${TABLE};" --json 2>/dev/null | \
      jq -r --arg table "$TABLE" '
        .[0].results[] | 
        "INSERT INTO " + $table + " VALUES (" + 
        ([.[] | if type == "string" then "\"" + gsub("\""; "\"\"") + "\"" elif . == null then "NULL" else tostring end] | join(", ")) + 
        ");"
      ' >> "$BACKUP_FILE" || true
  else
    echo "   → テーブルは空です"
  fi
  
  echo "" >> "$BACKUP_FILE"
done

# バックアップファイルのサイズを表示
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo ""
echo "✅ バックアップ完了！"
echo "📁 ファイル: ${BACKUP_FILE}"
echo "📊 サイズ: ${BACKUP_SIZE}"
echo ""

# 古いバックアップファイルを削除（30日以上古いもの）
echo "🗑️  古いバックアップファイルを削除中（30日以上前）..."
find "$BACKUP_DIR" -name "aikougi-production_*.sql" -type f -mtime +30 -delete 2>/dev/null || true

# バックアップ成功を記録
echo "$TIMESTAMP" > "${BACKUP_DIR}/.last_backup"

echo "🎉 バックアップ処理が完了しました！"
