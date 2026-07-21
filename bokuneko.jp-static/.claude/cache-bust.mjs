#!/usr/bin/env node
/**
 * cache-bust.mjs — CSS/JS のキャッシュ対策（バージョン自動採番）
 *
 * 各HTML内のローカルCSS/JS（assets/... の <link>/<script>）に
 *   ?v=<バージョン>
 * を自動で付与・更新する。WordPress の filemtime() と同じ発想で、
 * 「ファイルを更新したら自動で最新が読み込まれる」状態にするためのツール。
 * 手動でのファイル名変更は不要。
 *
 * バージョンの決め方:
 *   - 既定（本番向け）: ファイル内容のハッシュ。
 *       内容が変わったときだけ ?v= が変わる → 変更が無いファイルは
 *       キャッシュされたまま（高速）、変更したファイルだけ確実に更新される。
 *   - --dev（開発向け）: 実行するたびにユニークな値（毎回キャッシュ無効化）。
 *       CSS/JSを頻繁に触る開発中に、常に最新を読ませたいとき用。
 *
 * 使い方（アップロード前に実行するだけ）:
 *   node .claude/cache-bust.mjs          # 本番向け（内容ハッシュ）
 *   node .claude/cache-bust.mjs --dev    # 開発向け（毎回更新）
 *
 * 対象: プロジェクト直下の全 *.html（node_modules / .claude は除外）
 */

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEV = process.argv.includes('--dev');
const EXCLUDE_DIRS = new Set(['node_modules', '.claude', '.git']);

// ローカルCSS/JSの読み込みを検出（http(s):// と // で始まる外部は対象外）
const ASSET_RE = /\b(href|src)="((?!https?:)(?!\/\/)[^"?#]+\.(?:css|js))(?:\?[^"#]*)?(#[^"]*)?"/g;

const hashCache = new Map();
function versionFor(absPath) {
  if (DEV) return Date.now().toString(36);
  if (hashCache.has(absPath)) return hashCache.get(absPath);
  let token;
  try {
    token = createHash('md5').update(readFileSync(absPath)).digest('hex').slice(0, 8);
  } catch {
    // ファイルが見つからない場合は mtime にフォールバック（filemtime相当）
    try { token = String(Math.floor(statSync(absPath).mtimeMs)); }
    catch { token = null; }
  }
  hashCache.set(absPath, token);
  return token;
}

function listHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) {
      if (!EXCLUDE_DIRS.has(name.name)) out.push(...listHtml(join(dir, name.name)));
    } else if (name.isFile() && name.name.endsWith('.html')) {
      out.push(join(dir, name.name));
    }
  }
  return out;
}

let changedFiles = 0, totalRefs = 0;
for (const htmlPath of listHtml(ROOT)) {
  const htmlDir = dirname(htmlPath);
  const src = readFileSync(htmlPath, 'utf8');
  let refs = 0, missing = [];
  const out = src.replace(ASSET_RE, (whole, attr, url, frag = '') => {
    const abs = resolve(htmlDir, url);
    const v = versionFor(abs);
    if (v === null) { missing.push(url); return whole; } // 見つからない参照はそのまま
    refs++;
    return `${attr}="${url}?v=${v}${frag}"`;
  });
  totalRefs += refs;
  if (out !== src) { writeFileSync(htmlPath, out); changedFiles++; }
  const rel = htmlPath.slice(ROOT.length + 1).replace(/\\/g, '/');
  console.log(`  ${out !== src ? '✓' : '-'} ${rel}  (${refs} refs${missing.length ? `, 未検出: ${missing.join(', ')}` : ''})`);
}

console.log(`\n${DEV ? '[dev] ' : ''}更新: ${changedFiles} HTML / ${totalRefs} 参照にバージョンを付与しました。`);
