(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* header shadow */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  const toggle = $('.menu-toggle'), mnav = $('#mobile-nav');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mnav.hidden = !open;
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (innerWidth > 960) setMenu(false); });

  /* lookbook: filters + "show more" (12 at a time) */
  const STEP = 12;
  const tiles = $$('.g-item');
  const filters = $$('.filter');
  const more = $('#more'), shown = $('#shown');
  let current = 'all', limit = STEP, matches = tiles;

  const render = () => {
    matches = tiles.filter(t => current === 'all' || t.dataset.cat === current);
    tiles.forEach(t => { t.hidden = true; });
    matches.slice(0, limit).forEach(t => { t.hidden = false; });
    const n = Math.min(limit, matches.length);
    shown.textContent = `Showing ${n} of ${matches.length} photographs`;
    more.hidden = n >= matches.length;
    shown.hidden = matches.length <= STEP;
  };
  filters.forEach(btn => btn.addEventListener('click', () => {
    current = btn.dataset.filter; limit = STEP;
    filters.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    render();
  }));
  more.addEventListener('click', () => { limit += STEP; render(); });
  render();

  /* lightbox over whatever is currently shown */
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCount = $('.lb-count', lb), lbFull = $('.lb-full', lb);
  let idx = 0, list = [];
  const show = i => {
    idx = (i + list.length) % list.length;
    const t = list[idx];
    lbImg.src = t.href;
    lbImg.alt = $('img', t).alt;
    lbFull.href = t.href;
    lbCount.textContent = `${idx + 1} of ${list.length}`;
  };
  const open = t => { list = matches.filter(m => !m.hidden); lb.hidden = false; document.body.classList.add('lock'); show(list.indexOf(t)); $('.lb-close', lb).focus(); };
  const close = () => { lb.hidden = true; document.body.classList.remove('lock'); lbImg.src = ''; };
  tiles.forEach(t => t.addEventListener('click', e => { e.preventDefault(); open(t); }));
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  $('#year').textContent = new Date().getFullYear();
})();
