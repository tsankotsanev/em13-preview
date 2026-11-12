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
