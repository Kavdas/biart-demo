/* Фото-карусель: стрелки, перетаскивание мышью, свайп, автопрокрутка у краёв при наведении.
   Без JS — обычная горизонтальная прокрутка. */
(function () {
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.carousel-track');
    if (!track) return;
    c.classList.add('is-ready');

    // стрелки
    var mk = function (dir, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-btn car-' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = dir === 'prev'
        ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
        : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
      c.appendChild(b);
      return b;
    };
    var prev = mk('prev', 'Предыдущие фото');
    var next = mk('next', 'Следующие фото');
    var step = function () { return Math.max(240, track.clientWidth * 0.75); };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    // бесконечная лента: копии набора слева и справа, старт с «настоящего» набора
    var originals = Array.prototype.slice.call(track.children);
    var clone = function () { originals.forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('is-clone'); track.appendChild(c); }); };
    var cloneBefore = function () { originals.slice().reverse().forEach(function (el) { var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('is-clone'); track.insertBefore(c, track.firstChild); }); };
    clone(); cloneBefore();
    var realW = function () { return track.scrollWidth / 3; };
    var jumping = false;
    var jump = function (delta) {
      jumping = true;
      var prevBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft += delta;
      track.style.scrollBehavior = prevBehavior;
      jumping = false;
    };
    var loop = function () {
      if (jumping) return;
      var w = realW(), sl = track.scrollLeft;
      if (sl < w * 0.35) jump(w);
      else if (sl > w * 1.65) jump(-w);
    };
    track.addEventListener('scroll', loop, { passive: true });
    // WP ставит картинкам loading="lazy": за правым краем они не загрузились бы никогда — форсируем
    var imgs = track.querySelectorAll('img');
    var placed = false;
    var place = function () { if (placed) return; placed = true; jump(realW()); };
    imgs.forEach(function (i) { i.loading = 'eager'; i.addEventListener('load', function () { if (!placed && track.scrollWidth > track.clientWidth * 2) place(); }); });
    if (track.scrollWidth > track.clientWidth * 2) place(); else setTimeout(place, 1500);

    // перетаскивание мышью
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('mousedown', function (e) {
      down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('mouseup', function () { down = false; track.classList.remove('is-dragging'); });
    track.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // автопрокрутка при наведении к краю (только мышь)
    var edge = 0, raf = null;
    var tick = function () {
      if (edge) { track.scrollLeft += edge * 4; raf = requestAnimationFrame(tick); } else { raf = null; }
    };
    track.addEventListener('mousemove', function (e) {
      if (down || !window.matchMedia('(hover: hover)').matches) return;
      var r = track.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      edge = x < 0.1 ? -1 : x > 0.9 ? 1 : 0;
      if (edge && !raf) raf = requestAnimationFrame(tick);
    });
    track.addEventListener('mouseleave', function () { edge = 0; });
    prev.addEventListener('mouseenter', function () { edge = 0; });
    next.addEventListener('mouseenter', function () { edge = 0; });
  });
})();
