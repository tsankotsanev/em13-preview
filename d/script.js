// Меню под 1024 px: отваря/затваря списъка с връзки; Esc и избор на връзка го затварят.
(() => {
  const top = document.querySelector('.top');
  const btn = top && top.querySelector('.menu-btn');
  if (!btn) return;
  const set = (open) => {
    top.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => set(!top.classList.contains('is-open')));
  top.querySelector('.top__nav').addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && top.classList.contains('is-open')) { set(false); btn.focus(); }
  });
})();

// Лайтбокс: всяка снимка с data-lb се отваря голяма; стрелките минават през снимките от същата група.
(() => {
  const dlg = document.querySelector('.lb');
  if (!dlg || typeof dlg.showModal !== 'function') return; // без поддръжка линкът просто отваря снимката

  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('figcaption');
  let group = [];
  let index = 0;

  const show = (i) => {
    index = (i + group.length) % group.length;
    const a = group[index];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt || '';
    cap.textContent = a.dataset.cap || '';
    dlg.classList.toggle('lb--single', group.length < 2);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lb]');
    if (!a) return;
    e.preventDefault();
    group = [...document.querySelectorAll(`a[data-lb="${a.dataset.lb}"]`)];
    show(group.indexOf(a));
    dlg.showModal();
  });

  dlg.querySelector('.lb__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb__prev').addEventListener('click', () => show(index - 1));
  dlg.querySelector('.lb__next').addEventListener('click', () => show(index + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  dlg.addEventListener('close', () => img.removeAttribute('src'));
})();

// Слайдер: сменя снимката на ~5 s; спира при посочване с мишката или фокус; стрелки, точки и плъзгане с пръст.
(() => {
  const root = document.querySelector('.slider');
  if (!root) return;
  const slides = [...root.querySelectorAll('.slide')];
  const dots = [...root.querySelectorAll('.slider__dots button')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DELAY = 5000;
  let current = 0;
  let timer = null;
  let hovered = false;
  let focused = false;

  const go = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const on = n === current;
      s.classList.toggle('is-active', on);
      s.inert = !on;
      if (on) s.querySelector('img').loading = 'eager';
    });
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === current)));
    // подготвя следващата снимка, за да няма празен кадър
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (reduce.matches || hovered || focused || document.hidden) return;
    timer = setInterval(() => go(current + 1), DELAY);
  };
  const step = (d) => { go(current + d); start(); };

  root.querySelector('.slider__arrow--prev').addEventListener('click', () => step(-1));
  root.querySelector('.slider__arrow--next').addEventListener('click', () => step(1));
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); start(); }));

  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = true; stop(); } });
  root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovered = false; start(); } });
  root.addEventListener('focusin', () => { focused = true; stop(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { focused = false; start(); } });
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener('change', start);

  let x0 = null;
  let swiped = false;
  const track = root.querySelector('.slider__track');
  track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; swiped = false; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  track.addEventListener('click', (e) => { if (swiped) { e.preventDefault(); swiped = false; } });

  go(0);
  start();
})();
