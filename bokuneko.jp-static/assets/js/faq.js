/* FAQ アコーディオン
   ・Q（.faqList__q ボタン）をクリックすると A（.faqList__a）が控えめに開閉。
   ・イベント委任のため、HTMLに <li.faqList__item> を追加するだけで項目を増やせる。
   ・各項目は独立して開閉（複数同時に開ける）。
   ・jQuery（サイト共通ライブラリ）の slideToggle で自然なアニメーション。 */
$(function () {
  $(document).on('click', '.faqList__q', function () {
    var $q = $(this);
    var expanded = $q.attr('aria-expanded') === 'true';
    $q.attr('aria-expanded', expanded ? 'false' : 'true');
    $q.next('.faqList__a').stop(true, true).slideToggle(250);
  });
});
