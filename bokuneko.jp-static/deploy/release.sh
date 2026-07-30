#!/usr/bin/env bash
# ============================================================
# release.sh — develop（開発/テスト）の内容を main（本番）へ反映する
#
# 使い方（Git Bash 等で）:
#   bash deploy/release.sh
#
# 処理内容:
#   1. main へ切替
#   2. develop をマージ
#      - 本番用 .htaccess / robots.txt は .gitattributes(merge=ours) で維持
#   3. 念のため全HTMLの noindex メタを除去（新規ページ対策）
#   4. コミット
# 実行後は「git push origin main」→ 本番(bokuneko.jp)へアップロード。
# ============================================================
set -euo pipefail

# プロジェクトルート（このスクリプトの1つ上）へ移動
cd "$(cd "$(dirname "$0")/.." && pwd)"

# merge=ours ドライバを有効化（.gitattributes 用）
git config merge.ours.driver true

# 作業ツリーがクリークか確認
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "✗ コミットされていない変更があります。先に整理してください。"
  exit 1
fi

echo "▶ main へ切替"
git checkout main

echo "▶ develop をマージ（本番用 .htaccess / robots.txt は維持）"
if ! git merge --no-commit --no-ff develop; then
  echo "✗ マージ競合が発生しました。手動で解決後、再実行してください。"
  exit 1
fi

echo "▶ 本番クリーニング：noindex メタを除去"
# 全HTMLから noindex メタ（＋直前の説明コメント行）を削除
while IFS= read -r f; do
  sed -i '/検索エンジンにインデックスさせない/d; /content="noindex, nofollow"/d' "$f"
done < <(grep -rl --include='*.html' 'noindex' . 2>/dev/null || true)

# 変更を確定（マージ＋クリーニングを1コミットに）
git add -u
if git diff --cached --quiet; then
  echo "✓ 反映する差分はありませんでした。"
  git merge --abort 2>/dev/null || true
else
  git commit -m "release: develop を本番(main)へ反映（テスト設定を除去）"
  echo "✓ main を本番用に更新しました。"
fi

echo ""
echo "-----------------------------------------------------"
echo " 次の手順:"
echo "   1) git push origin main"
echo "   2) bokuneko.jp（本番）へ main の内容をアップロード"
echo "-----------------------------------------------------"
