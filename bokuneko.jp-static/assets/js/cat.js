/* 猫プロフィール ポップアップ（1つのモーダルを使い回し、開いたカードの内容を複製して表示）
   ※インラインではHTMLのキャッシュに巻き込まれ更新が反映されにくいため外部ファイル化。
     読み込みは各HTMLで ?v=<バージョン> を付けてキャッシュ対策する。 */
(function () {
  var modal = document.querySelector('.catModal');
  if (!modal) return;
  var body = modal.querySelector('.catModal__body');
  var lastFocus = null;
  var COLORS = ['green', 'orange', 'yerrow', 'pink'];

  function openModal(item) {
    var color = COLORS.filter(function (c) { return item.classList.contains(c); })[0] || '';
    body.className = 'catModal__body' + (color ? ' ' + color : '');
    body.innerHTML = item.innerHTML;
    // 複製した画像のWOWアニメ用クラス/インラインスタイルを除去し、確実に表示する
    body.querySelectorAll('img').forEach(function (img) {
      img.classList.remove('wow');
      img.classList.remove('flipInY');
      img.removeAttribute('style');
      img.removeAttribute('data-wow-delay');
    });
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.catModal__close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    body.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // リンク（クリック範囲）は catList__item 全体。
  // カードのどこをクリック/タップ、または Enter/Space で開く。
  document.querySelectorAll('.catList__item').forEach(function (item) {
    item.addEventListener('click', function () { openModal(item); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item); }
    });
  });

  modal.querySelectorAll('[data-cat-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
