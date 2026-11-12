// Меню за телефон и таблет: бутонът „Меню“ показва и скрива списъка.
(() => {
  const btn = document.querySelector('.bar__menu');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); }
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
    // една и съща снимка може да е в групата два пъти (голяма + миниатюра): пазим само първата
    const seen = new Set();
    group = [...document.querySelectorAll(`a[data-lb="${a.dataset.lb}"]`)]
      .filter((el) => !seen.has(el.href) && seen.add(el.href));
    show(Math.max(0, group.findIndex((el) => el.href === a.href)));
    dlg.showModal();
  });

  dlg.querySelector('.lb__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb__prev').addEventListener('click', () => show(index - 1));
  dlg.querySelector('.lb__next').addEventListener('click', () => show(index + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  dlg.addEventListener('close', () => img.removeAttribute('src'));
})();
