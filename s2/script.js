// Лайтбокс: всяка снимка с data-lb се отваря голяма; стрелките минават през снимките от същата група.
// Бутоните „Още N снимки“ (data-open) отварят групата от втората снимка.
(() => {
  const dlg = document.querySelector('.lb');
  if (!dlg || typeof dlg.showModal !== 'function') return; // без поддръжка линкът просто отваря снимката

  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('.lb__cap');
  const count = dlg.querySelector('.lb__count');
  let group = [];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + group.length) % group.length;
    const a = group[index];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt || '';
    cap.textContent = a.dataset.cap || '';
    count.textContent = `${index + 1} / ${group.length}`;
    dlg.classList.toggle('lb--single', group.length < 2);
  };

  const open = (name, start, from) => {
    group = [...document.querySelectorAll(`a[data-lb="${name}"]`)];
    if (!group.length) return;
    opener = from;
    show(Math.min(start, group.length - 1));
    dlg.showModal();
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lb]');
    if (a) {
      e.preventDefault();
      const all = [...document.querySelectorAll(`a[data-lb="${a.dataset.lb}"]`)];
      open(a.dataset.lb, all.indexOf(a), a);
      return;
    }
    const b = e.target.closest('button[data-open]');
    if (b) open(b.dataset.open, 1, b);
  });

  dlg.querySelector('.lb__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb__prev').addEventListener('click', () => show(index - 1));
  dlg.querySelector('.lb__next').addEventListener('click', () => show(index + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  dlg.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus();
  });
})();

// Работно време: отбелязва реда за днешния ден.
(() => {
  const today = String(new Date().getDay());
  document.querySelectorAll('.hours [data-days]').forEach((row) => {
    if (row.dataset.days.split(',').includes(today)) row.classList.add('is-today');
  });
})();
