/* ページ内アンカーのスムーススクロール ＋ スクロール後に URL の # を消す
   ・読み込み時：URL に # があればその要素へスクロールし、# を除去。
     （下層ページ → トップの "../#xxx" リンク経由での着地も対応）
   ・クリック時：# 始まりの内部リンクをスムーススクロールし、完了後に # を除去。
   ・イベント委任で、後から生成される要素（追従ヘッダーの複製ナビ等）にも対応。
   ・空アンカー "#"（ハンバーガー等）・モーダル起動リンク([data-remodal-target])は対象外。
     ※ jQuery1.11では $("#") が例外を投げるため、必ずガードする。 */
$(function () {
  var DURATION = 500;

  function isScrollable(href, $link) {
    if (!href || href.charAt(0) !== "#" || href === "#") return false;
    if ($link && $link.is("[data-remodal-target]")) return false;
    return true;
  }
  function findTarget(href) {
    try {
      var $t = $(href);
      return $t.length ? $t : null;
    } catch (e) {
      return null;
    }
  }
  function stripHash() {
    if (window.history && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  // 読み込み時
  if (location.hash && isScrollable(location.hash, null)) {
    var $onload = findTarget(location.hash);
    if ($onload) {
      $("html, body").animate({ scrollTop: $onload.offset().top }, DURATION, stripHash);
    } else {
      stripHash();
    }
  }

  // クリック時（委任：動的に追加される要素にも効く）
  $(document).on("click", 'a[href^="#"]', function (e) {
    var href = $(this).attr("href");
    if (!isScrollable(href, $(this))) return;
    var $target = findTarget(href);
    if (!$target) return;
    e.preventDefault();
    $("html, body").animate({ scrollTop: $target.offset().top }, DURATION, stripHash);
  });
});
