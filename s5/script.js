document.documentElement.classList.add('js');

// Избор на цвят гнайс: без JS всички цветове се виждат един под друг; с JS — по един, като раздели.
(() => {
  const picker = document.querySelector('[data-picker]');
  if (!picker) return;
  const list = picker.querySelector('.picker__list');
  const tabs = [...list.querySelectorAll('.pick')];
  const panels = tabs.map((t) => document.querySelector(t.getAttribute('href')));

  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Цвят на гнайса');
  tabs.forEach((t, i) => {
    t.parentElement.setAttribute('role', 'presentation');
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', t.id);
  });

  const select = (i, focus) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('is-on', on);
    });
    if (focus) tabs[i].focus();
  };

  list.addEventListener('click', (e) => {
    const t = e.target.closest('.pick');
    if (!t) return;
    e.preventDefault();
    select(tabs.indexOf(t));
  });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); select((i + step + tabs.length) % tabs.length, true); }
    if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    if (e.key === ' ') { e.preventDefault(); select(i); }
  });

  const fromHash = tabs.findIndex((t) => t.getAttribute('href') === location.hash);
  select(fromHash > -1 ? fromHash : 0);
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

// Леко появяване на блоковете при превъртане; изключено при „намалено движение“.
(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = document.querySelectorAll('.sec__head, .kinds, .tile, .row, .extra, .truck__pics, .about__grid, .fb__in, .find__grid');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => { el.classList.add('rv'); io.observe(el); });
  document.documentElement.classList.add('reveal-on');
})();
