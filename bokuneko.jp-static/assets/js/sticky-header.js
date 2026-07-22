/* PC用 追従ヘッダー
   既存の headerNav が画面外へ出たら、上部に固定のコンパクトなヘッダーを表示する。
   ・既存ヘッダーはそのまま。追従ヘッダーは別要素として生成（保守性重視）。
   ・ナビ／SNSは既存要素を複製して使うため、将来メニューを増やしても自動反映。
   ・表示判定は IntersectionObserver（スクロールイベント不使用）で効率的に。
   ・PC表示のみ（min-width:750.02px）。SPには影響しない。 */
(function () {
  function init() {
    var headerNav = document.querySelector('.header .headerNav');
    if (!headerNav) return;

    var PCQuery = window.matchMedia('(min-width: 750.02px)');

    // ---- 追従ヘッダーを生成（既存のロゴ・ナビ・SNSを複製） ----
    var sticky = document.createElement('div');
    sticky.className = 'stickyHeader';
    sticky.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'stickyHeader__inner';

    // 左：ロゴ
    var logoImg = document.querySelector('.header .logo, .header .logo--index');
    var logoAnchor = document.querySelector('.header h1 a');
    var logo = document.createElement('a');
    logo.className = 'stickyHeader__logo';
    logo.href = logoAnchor ? logoAnchor.getAttribute('href') : '#pageTop';
    logo.setAttribute('aria-label', '僕と猫。トップへ');
    if (logoImg) {
      var im = document.createElement('img');
      im.src = logoImg.getAttribute('src');
      im.alt = logoImg.getAttribute('alt') || '僕と猫。';
      logo.appendChild(im);
    }

    // 右：ナビ ＋ SNS
    var right = document.createElement('div');
    right.className = 'stickyHeader__right';

    var navWrap = document.querySelector('.header .headerNav__wrap');
    if (navWrap) {
      var nav = document.createElement('nav');
      nav.className = 'stickyHeader__nav';
      nav.setAttribute('aria-label', 'サイトナビゲーション');
      nav.appendChild(navWrap.cloneNode(true));
      right.appendChild(nav);
    }

    var snsWrap = document.querySelector('.header .headerSNS__wrap');
    if (snsWrap) {
      var sns = document.createElement('div');
      sns.className = 'stickyHeader__sns';
      sns.appendChild(snsWrap.cloneNode(true));
      right.appendChild(sns);
    }

    inner.appendChild(logo);
    inner.appendChild(right);
    sticky.appendChild(inner);
    document.body.appendChild(sticky);

    // ---- 表示・非表示 ----
    var shown = false;
    function setShown(v) {
      v = !!v && PCQuery.matches;
      if (v === shown) return;
      shown = v;
      sticky.classList.toggle('is-visible', v);
      sticky.setAttribute('aria-hidden', v ? 'false' : 'true');
    }
    // 元の headerNav が上端より上へ出ている（＝画面外）なら true
    function navOutOfView() {
      return headerNav.getBoundingClientRect().bottom <= 0;
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        var e = entries[entries.length - 1];
        // headerNav が見えなくなり、かつ上方向へ出たときだけ表示
        setShown(!e.isIntersecting && navOutOfView());
      }, { threshold: 0 });
      io.observe(headerNav);
    } else {
      // 非対応環境のフォールバック
      window.addEventListener('scroll', function () { setShown(navOutOfView()); }, { passive: true });
    }

    // 画面幅変更（SP↔PC）時に再評価
    var reeval = function () { setShown(navOutOfView()); };
    if (PCQuery.addEventListener) PCQuery.addEventListener('change', reeval);
    else if (PCQuery.addListener) PCQuery.addListener(reeval);
    window.addEventListener('resize', reeval, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
