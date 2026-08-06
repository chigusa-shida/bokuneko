# デプロイ / ブランチ運用ガイド

このサイトは **2つのブランチ**を使い分けます。

| ブランチ | 何用？ | アップ先 |
|---|---|---|
| **develop** | ふだんの作業・テスト（下書き） | `test.bokuneko.jp`（テスト） |
| **main** | 完成版・本番（清書） | `bokuneko.jp`（本番） |

ざっくり言うと **develop＝下書き（検索に出ない）／ main＝本番（検索に出る）** です。

---

## ① ふだんの作業（develop で行う）

1. `develop` ブランチで編集してコミット。
2. アップロードする前に、これを1回実行（キャッシュ対策：ファイルのバージョンを更新）。
   **必ず `bokuneko.jp-static` フォルダの中で**実行してください。
   ```bash
   cd bokuneko.jp-static           # まだ入っていなければ
   node .claude/cache-bust.mjs
   ```
3. `develop` の中身を **test.bokuneko.jp** にアップして表示を確認。

---

## ② 本番に出す（テストでOKになったら）

```bash
bash deploy/release.sh     # develop の内容を main に反映（テスト用の設定は自動で外れる）
git push origin main
```

そのあと、`main` の中身を **bokuneko.jp** にアップロード。

---

## 覚えておくと安心なこと

- **noindex（検索よけ）**
  develop には「検索に出さない」設定が付いています。`release.sh` を通すと**自動で外れる**ので、本番（main）に残る心配はありません。

- **.htaccess / robots.txt（環境で中身が違うファイル）**
  develop はテスト用、main は本番用。マージしても**混ざりません**（`.gitattributes` で保護済み）。
  - ※ 本番の `.htaccess` は **Xサーバー側で直接管理**しています。
    FTPでサイトを上げるときは **`.htaccess` を上書きしない**でください（サーバーの設定が消えてしまうため）。

- **キャッシュ対策**
  ブラウザに古いCSS/JSが残らないよう、各ファイルに `?v=…` を付けています。
  更新したら **アップ前に `node .claude/cache-bust.mjs`** を忘れずに。

---

## まとめ（最短フロー）

```
develop で作業
   ↓  node .claude/cache-bust.mjs
test.bokuneko.jp にアップして確認
   ↓  OKなら
bash deploy/release.sh → git push origin main
   ↓
bokuneko.jp にアップ（.htaccess は上書きしない）
```
