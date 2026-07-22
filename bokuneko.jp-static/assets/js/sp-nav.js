/* SP用 ハンバーガーメニュー
   ・開閉は navButton クリックで slideToggle ＋ .open クラス
   ・ページ内リンク（#...）クリック時は通常の閉じる処理と同じ slideUp ＋ .open 解除
   ・SP表示のみ（max-width: 750px）。PCには影響しない */
(function ($) {
  var SPQuery = window.matchMedia('(max-width: 750px)');

  function isSP() {
    return SPQuery.matches;
  }

  function closeNavMenu($navButton) {
    if (!$navButton.hasClass('open')) return;
    $navButton.removeClass('open');
    $navButton.next('.panel').slideUp();
  }

  $(function () {
    var $navButton = $('.navButton');

    $navButton.on('click', function (e) {
      e.preventDefault();
      var $btn = $(this);
      $btn.next('.panel').slideToggle();
      $btn.toggleClass('open');
    });

    $('.panel .headerNav a').on('click', function () {
      if (!isSP()) return;

      var href = $(this).attr('href') || '';
      var hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      var hash = href.slice(hashIndex + 1);
      if (!hash) return;

      closeNavMenu($navButton);
    });
  });
})(jQuery);
