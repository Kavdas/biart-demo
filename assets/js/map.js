/* Карта по клику: виджет Яндекса тянет больше мегабайта скриптов, поэтому
   до клика на странице стоит заглушка. Без JS работает <noscript> с обычным iframe. */
(function () {
  document.querySelectorAll('.map-embed.is-stub').forEach(function (box) {
    var btn = box.querySelector('.map-open');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.dataset.map;
      f.title = box.dataset.title || '';
      f.width = '100%';
      f.height = '600';
      f.loading = 'eager';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.classList.remove('is-stub');
      box.innerHTML = '';
      box.appendChild(f);
    });
  });
})();
