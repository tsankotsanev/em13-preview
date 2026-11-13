// Без библиотеки. Всичко се вижда и без този файл; той само добавя движение и управление.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const EASE = 'cubic-bezier(.16, 1, .3, 1)';
// iOS показва :active (натиснато състояние) само ако страницата слуша за докосване
document.addEventListener('touchstart', () => {}, { passive: true });

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

// При превъртане: компактна горна лента със сянка, червена линия за прочетената част,
// бутон „нагоре“ и подчертан раздел в менюто.
(() => {
  const top = document.querySelector('.top');
  const progress = document.querySelector('.top__progress');
  const totop = document.querySelector('.totop');
  const links = [...document.querySelectorAll('.top__nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  if (totop) totop.hidden = false;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (top) {
      top.classList.toggle('is-scrolled', y > 8);
      if (y > 120) top.classList.add('is-compact');
      else if (y < 60) top.classList.remove('is-compact');
    }
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (totop) totop.classList.toggle('is-on', y > window.innerHeight * 1.5);
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) current = s.id;
    if (max > 0 && y >= max - 2 && sections.length) current = sections[sections.length - 1].id;
    for (const a of links) {
      if (a.getAttribute('href') === `#${current}`) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
})();

// Появяване при превъртане: само блоковете под първия екран; в редица се появяват един след друг.
// Ако наблюдателят не се обади до 2 s (или при печат), всичко се показва веднага.
(() => {
  if (!('IntersectionObserver' in window) || reduceMotion.matches) return;
  const selector = [
    '.intro__grid > *', '.callband__in > *', '.sec-head', '.swatches li', '.hint', '.stone__feat', '.stone__body',
    '.cards > li', '.deco > h3', '.deco__grid li', '.truck__text', '.slider--truck', '.letter__paper > *',
    '.about__pic', '.contact__grid > div:first-child', '.contact__info > div', '.contact__map',
  ].join(', ');
  const fold = window.innerHeight * 0.92;
  const items = [...document.querySelectorAll(selector)].filter((el) => el.getBoundingClientRect().top > fold);
  if (!items.length) return;
  let answered = false;
  const showAll = () => items.forEach((el) => el.classList.add('in'));
  const io = new IntersectionObserver((entries) => {
    answered = true;
    let k = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty('--d', `${Math.min(k++, 6) * 90}ms`);
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => { el.classList.add('rv'); io.observe(el); });
  setTimeout(() => { if (!answered) showAll(); }, 2000);
  window.addEventListener('beforeprint', showAll);
})();

// Черната лента: линията под номера се изтегля, когато лентата се покаже; слушалката „звъни“ на ~6 s, докато се вижда.
(() => {
  const band = document.querySelector('.callband');
  if (!band || !('IntersectionObserver' in window)) return;
  if (!reduceMotion.matches) band.classList.add('is-waiting');
  const seen = () => band.classList.remove('is-waiting');
  new IntersectionObserver(([e]) => {
    band.classList.toggle('is-live', e.isIntersecting);
    if (e.isIntersecting) seen();
  }, { threshold: 0.35 }).observe(band);
  setTimeout(() => { if (!band.classList.contains('is-live') && band.getBoundingClientRect().top < window.innerHeight) seen(); }, 2000);
})();

// Лайтбокс: всяка снимка с data-lb се отваря голяма; стрелки, клавиши и плъзгане минават през снимките от същата група.
(() => {
  const dlg = document.querySelector('.lb');
  if (!dlg || typeof dlg.showModal !== 'function') return; // без поддръжка линкът просто отваря снимката

  const fig = dlg.querySelector('figure');
  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('figcaption');
  const ms = (n) => (reduceMotion.matches ? 0 : n);
  let group = [];
  let index = 0;
  let turn = 0;
  let closing = false;

  const set = (i) => {
    index = (i + group.length) % group.length;
    const a = group[index];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt || a.dataset.alt || '';
    cap.textContent = a.dataset.cap || '';
    dlg.classList.toggle('lb--single', group.length < 2);
  };

  const show = async (i, dir) => {
    if (group.length < 2) return;
    const mine = ++turn;
    const out = fig.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 48}px)` }],
      { duration: ms(160), easing: 'ease-in', fill: 'forwards' });
    await out.finished.catch(() => {});
    if (mine !== turn) return;
    set(i);
    await Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
    if (mine !== turn) return;
    out.cancel();
    fig.animate([{ opacity: 0, transform: `translateX(${dir * 48}px)` }, { opacity: 1, transform: 'none' }],
      { duration: ms(340), easing: EASE });
  };

  const close = () => {
    if (closing) return;
    closing = true;
    dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms(200), easing: 'ease-in', fill: 'forwards' });
    fig.animate([{ transform: 'none' }, { transform: 'scale(.96)' }], { duration: ms(200), easing: 'ease-in', fill: 'forwards' })
      .finished.then(() => dlg.close());
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lb]');
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    group = [...document.querySelectorAll(`a[data-lb="${a.dataset.lb}"]`)];
    set(group.indexOf(a));
    dlg.showModal();
    dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms(260), easing: 'ease-out' });
    fig.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: ms(450), easing: EASE });
  });

  dlg.querySelector('.lb__close').addEventListener('click', close);
  dlg.querySelector('.lb__prev').addEventListener('click', () => show(index - 1, -1));
  dlg.querySelector('.lb__next').addEventListener('click', () => show(index + 1, 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1, 1);
    if (e.key === 'ArrowLeft') show(index - 1, -1);
  });
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  dlg.addEventListener('close', () => {
    turn++;
    closing = false;
    [...dlg.getAnimations(), ...fig.getAnimations()].forEach((an) => an.cancel());
    img.removeAttribute('src');
  });
})();

// Слайдери (горе и „Транспорт“): сменят снимката сами; червената линия отдолу показва кога идва следващата.
// Спират при посочване с мишката, при фокус от клавиатурата и когато не се виждат; стрелки, точки и плъзгане с пръст.
// При prefers-reduced-motion не се сменят сами.
document.querySelectorAll('.slider').forEach((root) => {
  const slides = [...root.querySelectorAll('.slide')];
  const dots = [...root.querySelectorAll('.slider__dots button')];
  const bar = root.querySelector('.slider__bar');
  const delay = root.classList.contains('slider--truck') ? 4500 : 5000;
  let current = 0;
  let timer = null;
  let leaving = null;
  let hovered = false;
  let focused = false;
  let inView = true;

  const eager = (slide) => slide.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
  const go = (i) => {
    const next = (i + slides.length) % slides.length;
    if (next !== current) {
      const old = slides[current];
      slides.forEach((s) => s.classList.remove('is-prev'));
      old.classList.add('is-prev'); // stays under the incoming slide until the cross-fade is done
      clearTimeout(leaving);
      leaving = setTimeout(() => old.classList.remove('is-prev'), 1300);
    }
    current = next;
    slides.forEach((s, n) => {
      const on = n === current;
      s.classList.toggle('is-active', on);
      s.inert = !on;
      if (on) eager(s);
    });
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === current)));
    eager(slides[(current + 1) % slides.length]); // подготвя следващата снимка, за да няма празен кадър
  };

  const sync = () => {
    const play = inView && !hovered && !focused && !document.hidden;
    root.classList.toggle('is-paused', !play);
    if (timer) { if (play) timer.play(); else timer.pause(); }
  };
  const restart = () => {
    if (timer) { timer.onfinish = null; timer.cancel(); timer = null; }
    root.classList.toggle('is-live', !reduceMotion.matches);
    if (reduceMotion.matches || slides.length < 2) return;
    timer = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: delay, easing: 'linear' });
    timer.onfinish = () => { go(current + 1); restart(); };
    sync();
  };
  const step = (d) => { go(current + d); restart(); };

  root.querySelector('.slider__arrow--prev').addEventListener('click', () => step(-1));
  root.querySelector('.slider__arrow--next').addEventListener('click', () => step(1));
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); restart(); }));

  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = true; sync(); } });
  root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovered = false; sync(); } });
  root.addEventListener('focusin', (e) => { focused = e.target.matches(':focus-visible'); sync(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { focused = false; sync(); } });
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', restart);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(root);
  }

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
  restart();
});
