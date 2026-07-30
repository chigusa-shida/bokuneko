# デプロイ / ブランチ運用

## ブランチ
| ブランチ | 用途 | アップ先 | .htaccess / robots.txt / noindex |
|---|---|---|---|
| `develop` | 開発・テスト | `test.bokuneko.jp` | テスト用（クロール拒否・noindexあり） |
| `main` | 本番 | `bokuneko.jp` | 本番用（クロール許可・noindexなし） |

## 日常の開発
1. `develop` で作業・コミット。
2. アップロード前に `node .claude/cache-bust.mjs` を実行（`?v=` を更新）。
3. `develop` の内容を `test.bokuneko.jp` へアップして確認。

## 本番リリース
```bash
bash deploy/release.sh      # develop を main へ反映（テスト設定を自動除去）
git push origin main
```
その後、`main` の内容を `bokuneko.jp`（本番）へアップロード。

## 仕組みのポイント
- `.htaccess` と `robots.txt` は環境ごとに内容が異なるが、`.gitattributes`
  の `merge=ours` により **マージしてもブランチごとの内容が維持**される
  （main＝本番用、develop＝テスト用）。競合しない。
- `noindex` メタは main では除去済み。`release.sh` が念のため毎回除去するため、
  develop で新規ページを追加しても本番に noindex が残らない。
- キャッシュ対策は各アセットの `?v=`（内容ハッシュ）が主。`.htaccess` の
  Cache-Control ヘッダは補助。
