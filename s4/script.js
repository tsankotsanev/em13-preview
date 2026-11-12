// Снимки на цял екран: всяка връзка с data-lb се отваря голяма; стрелките минават през снимките от същата група.
(() => {
  const dlg = document.querySelector('.lb');
  if (!dlg || typeof dlg.showModal !== 'function') return; // без поддръжка връзката просто отваря снимката

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

// Сянка под горната лента след превъртане.
(() => {
  const top = document.querySelector('.top');
  const set = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
  set();
  window.addEventListener('scroll', set, { passive: true });
})();

// Подчертава в менюто секцията, която се вижда в момента.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const links = new Map(
    [...document.querySelectorAll('.top__nav a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const a = links.get(en.target.id);
      if (!a) return;
      if (en.isIntersecting) {
        links.forEach((l) => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
      } else if (a.hasAttribute('aria-current')) {
        a.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

// Плавно появяване на блоковете при превъртане (изключено при намалено движение).
(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const groups = ['.split-head', '.forms-key', '.swatch li', '.mason__item', '.tile', '.truck__text', '.truck__pics', '.about__text', '.fb__card', '.find__title'];
  const els = [];
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('rv');
      el.style.setProperty('--d', `${Math.min(i % 6, 5) * 70}ms`);
      els.push(el);
    });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
})();
