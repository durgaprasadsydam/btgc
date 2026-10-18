/* BTGC — page features shared across the site: navbar, mobile menu, org chart, project filter (GSAP Flip),
   lightbox, certificate modal and quote-form validation. Works without GSAP (graceful fallbacks). */

(() => {
'use strict';

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined';

/* ---------- scroll lock (pauses Lenis via custom events) ---------- */
let locks = 0;
function lock() { if (locks++ === 0) { root.classList.add('is-locked'); document.dispatchEvent(new Event('btgc:lock')); } }
function unlock() { if (locks > 0 && --locks === 0) { root.classList.remove('is-locked'); document.dispatchEvent(new Event('btgc:unlock')); } }

/* ---------- 10. Navbar: transparent → solid, hide on scroll down / show on scroll up ---------- */
(function navbar() {
  const nav = $('[data-nav]');
  if (!nav) return;
  let last = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (!root.classList.contains('menu-open')) {
      if (y > last + 4 && y > 420) nav.classList.add('is-hidden');
      else if (y < last - 4 || y < 200) nav.classList.remove('is-hidden');
    }
    last = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  // keyboard users tabbing into a hidden nav should see it
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  update();
})();

/* ---------- Mobile full-screen menu ---------- */
(function mobileMenu() {
  const btn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  if (!btn || !menu) return;
  const set = (open) => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) { menu.removeAttribute('inert'); lock(); setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 350); }
    else { menu.setAttribute('inert', ''); unlock(); }
  };
  btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus(); } });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  // Focus trap while the full-screen menu is open: Tab cycles menu button ↔ menu links
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !root.classList.contains('menu-open')) return;
    const stops = [btn, ...$$('a', menu)];
    const i = stops.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); stops[stops.length - 1].focus(); }
    else if (!e.shiftKey && i === stops.length - 1) { e.preventDefault(); btn.focus(); }
  });
})();

/* ---------- Site search (native <dialog>; index loaded on demand from search-data.js) ---------- */
(function siteSearch() {
  const dlg = $('[data-search]');
  const btn = $('[data-search-btn]');
  if (!dlg || !btn) return;
  const input = $('[data-search-input]', dlg);
  const list = $('[data-search-results]', dlg);
  const base = '../'.repeat(Number(document.body.dataset.depth) || 0);
  let data = null;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const row = (r) => `<li><a href="${base}${r.u}"><span><span class="sr-title">${esc(r.t)}</span>${r.d ? `<span class="sr-sub">${esc(r.d)}</span>` : ''}</span><span class="sr-tag">${esc(r.c)}</span></a></li>`;

  function render(q) {
    if (!data) return;
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { // suggestions
      list.innerHTML = `<li class="search-hint">Popular</li>${data.filter((r) => r.c === 'Service' || r.u === 'contact.html').slice(0, 8).map(row).join('')}`;
      return;
    }
    const scored = data.map((r) => {
      const title = r.t.toLowerCase(), rest = `${r.d || ''} ${r.k || ''} ${r.c}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += title.startsWith(t) ? 5 : 3;
        else if (rest.includes(t)) score += 1;
        else return null; // every term must match something
      }
      return { r, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
    list.innerHTML = scored.length ? scored.map((x) => row(x.r)).join('') : `<li class="search-hint">No results for “${esc(q)}”. Try “HVAC”, “fire”, “fit-out” or a project name.</li>`;
  }

  // search-data.js is a classic script (sets window.BTGC_SEARCH) so it also works when the site is opened from file://
  function loadData() {
    if (data) return Promise.resolve();
    if (window.BTGC_SEARCH) { data = window.BTGC_SEARCH; return Promise.resolve(); }
    return new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = base + 'assets/js/search-data.js';
      sc.onload = () => { data = window.BTGC_SEARCH; res(); };
      sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }

  function open() {
    dlg.showModal();
    lock();
    input.value = '';
    loadData().then(() => render(input.value)).catch(() => { list.innerHTML = '<li class="search-hint">Search is unavailable right now.</li>'; });
    input.focus();
  }
  btn.addEventListener('click', open);
  input.addEventListener('input', () => render(input.value));
  $('[data-search-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click on the dimmed area
  dlg.addEventListener('close', () => { unlock(); btn.focus(); });
  dlg.addEventListener('keydown', (e) => {
    // Esc always closes (a search field would otherwise just clear itself first)
    if (e.key === 'Escape') { e.preventDefault(); dlg.close(); return; }
    // arrow keys move between the field and the results
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = $$('a', list);
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') (items[i + 1] || items[0]).focus();
    else if (i <= 0) input.focus(); else items[i - 1].focus();
  });
  $('[data-search-form]', dlg).addEventListener('submit', (e) => { e.preventDefault(); const first = $('a', list); if (first) first.click(); });
})();

/* ---------- Home "Our approach": phase explorer (ARIA tabs, arrow keys, gentle autoplay that stops on interaction) ---------- */
(function phaseExplorer() {
  const root = $('[data-phases]');
  if (!root) return;
  const tabs = $$('[data-ptab]', root), panels = $$('[data-ppanel]', root);
  const fill = $('[data-pfill]', root), cur = $('[data-pcur]', root);
  const n = tabs.length;
  let i = 0, timer = null, interacted = false;

  function show(k, focus) {
    i = (k + n) % n;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
      t.classList.toggle('is-active', j === i);
      t.classList.toggle('is-done', j < i);
    });
    panels.forEach((p, j) => { p.hidden = j !== i; p.classList.toggle('is-in', j === i); });
    fill.style.width = `${(i / (n - 1)) * 100}%`;
    cur.textContent = String(i + 1).padStart(2, '0');
    if (focus) tabs[i].focus();
    // keep the active tab visible in the scrollable row on small screens
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => { stop(); if (!reduce && !interacted) timer = setInterval(() => show(i + 1), 7000); };
  const touch = () => { interacted = true; stop(); };

  root.classList.add('is-ready');
  show(0);
  tabs.forEach((t, j) => t.addEventListener('click', () => { touch(); show(j); }));
  $('[data-pprev]', root).addEventListener('click', () => { touch(); show(i - 1); });
  $('[data-pnext]', root).addEventListener('click', () => { touch(); show(i + 1); });
  $('[role=tablist]', root).addEventListener('keydown', (e) => {
    const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); touch(); show(k, true);
  });
  root.addEventListener('focusin', touch);
  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', () => { if (!interacted) play(); });
  new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()), { threshold: 0.45 }).observe(root);
})();

/* ---------- Org chart: open on desktop, collapsible accordion on mobile ---------- */
(function orgChart() {
  const depts = $$('[data-org-dept]');
  if (!depts.length) return;
  const mq = window.matchMedia('(min-width: 1100px)');
  const sync = () => depts.forEach((d, i) => { d.open = mq.matches || i === 0; });
  sync();
  mq.addEventListener('change', sync);
  depts.forEach((d) => d.addEventListener('toggle', () => { if (mq.matches && !d.open) d.open = true; }));
})();

/* ---------- 5. Projects filter with GSAP Flip ---------- */
(function projectFilter() {
  const grid = $('[data-grid]');
  const bar = $('[data-filter-bar]');
  if (!grid || !bar) return;
  const cards = $$('[data-project]', grid);
  const buttons = $$('[data-filter]', bar);
  const count = $('[data-filter-count]');
  const canFlip = hasGsap && window.Flip && !reduce;

  const apply = (key) => {
    const matches = (c) => key === 'all' || c.dataset.cat.split(' ').includes(key);
    if (canFlip && window.ScrollTrigger) {
      // reveal batches are done once the user starts filtering
      window.ScrollTrigger.getAll().filter((st) => cards.includes(st.trigger)).forEach((st) => st.kill());
      window.gsap.set(cards, { opacity: 1, clearProps: 'transform' });
    }
    const state = canFlip ? window.Flip.getState(cards) : null;
    cards.forEach((c) => c.classList.toggle('is-hidden', !matches(c)));
    if (count) count.textContent = cards.filter(matches).length;
    if (canFlip) {
      window.Flip.from(state, {
        duration: 0.75, ease: 'power3.inOut', absolute: true, stagger: 0.025, nested: true,
        onEnter: (els) => window.gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.55, delay: 0.2, clearProps: 'transform' }),
        onLeave: (els) => window.gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
        onComplete: () => window.ScrollTrigger && window.ScrollTrigger.refresh(),
      });
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply(b.dataset.filter);
  }));
  const initial = new URLSearchParams(location.search).get('filter');
  const initialBtn = buttons.find((b) => b.dataset.filter === initial);
  if (initialBtn) initialBtn.click();
})();

/* ---------- Gallery lightbox (native <dialog>) ---------- */
(function lightbox() {
  const items = $$('[data-lightbox]');
  if (!items.length) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image gallery');
  dlg.innerHTML = `<button type="button" class="modal-close" data-lb-close aria-label="Close gallery"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    <figure class="lightbox-fig"><img alt="" src=""><figcaption></figcaption>
    <button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="Previous image"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
    <button type="button" class="lb-btn lb-next" data-lb-next aria-label="Next image"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button></figure>`;
  document.body.appendChild(dlg);
  const img = $('img', dlg), cap = $('figcaption', dlg);
  let idx = 0, opener = null;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    img.src = it.dataset.src; img.alt = it.dataset.alt || '';
    cap.textContent = `${it.dataset.alt || ''} (${idx + 1} / ${items.length})`;
  };
  items.forEach((it, i) => it.addEventListener('click', () => { opener = it; show(i); dlg.showModal(); lock(); }));
  $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
  $('[data-lb-prev]', dlg).addEventListener('click', () => show(idx - 1));
  $('[data-lb-next]', dlg).addEventListener('click', () => show(idx + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  dlg.addEventListener('close', () => { unlock(); opener?.focus(); });
})();

/* ---------- Certificate preview modal ---------- */
(function certModal() {
  const dlg = $('[data-cert-modal]');
  const cards = $$('[data-cert]');
  if (!dlg || !cards.length) return;
  const img = $('[data-cert-img]', dlg), title = $('[data-cert-title]', dlg), sub = $('[data-cert-sub]', dlg), pdf = $('[data-cert-pdf]', dlg);
  let opener = null;
  cards.forEach((c) => c.addEventListener('click', () => {
    opener = c;
    img.src = c.dataset.img; img.alt = `${c.dataset.title} — certificate preview (placeholder)`;
    title.textContent = c.dataset.title; sub.textContent = c.dataset.sub; pdf.href = c.dataset.pdf;
    dlg.showModal(); lock();
  }));
  $$('[data-modal-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { unlock(); opener?.focus(); });
})();

/* ---------- Quote form: client-side validation, accessible errors, success state ---------- */
(function quoteForm() {
  const form = $('[data-quote-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const success = $('[data-form-success]');
  const fileInput = $('[data-file-input]', form);
  const fileName = $('[data-file-name]', form);
  const MAX = 10 * 1024 * 1024;

  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
    email: (v) => (!v.trim() ? 'Please enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
    phone: (v) => (v.trim() && !/^[+\d][\d\s()\-]{6,}$/.test(v.trim()) ? 'Please enter a valid phone number.' : ''),
    service: (v) => (!v ? 'Please select a service.' : ''),
    location: (v) => (!v ? 'Please select a project location.' : ''),
    message: (v) => (v.trim().length < 10 ? 'Please describe your project (at least 10 characters).' : ''),
  };

  const setError = (el, msg) => {
    const err = $(`#${el.id}-err`);
    if (err) err.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !msg;
  };
  const check = (el) => {
    if (el.type === 'file') {
      const f = el.files[0];
      return setError(el, f && f.size > MAX ? 'This file is larger than 10 MB. Please send a smaller file.' : '');
    }
    const rule = rules[el.name];
    return rule ? setError(el, rule(el.value)) : true;
  };

  $$('input, select, textarea', form).forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.hasAttribute('aria-invalid')) check(el); });
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) check(el); });
    el.addEventListener('change', () => { if (el.tagName === 'SELECT') check(el); });
  });
  fileInput?.addEventListener('change', () => {
    fileName.textContent = fileInput.files[0] ? fileInput.files[0].name : 'Choose a file…';
    check(fileInput);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($('[data-hp]', form)?.value) return; // honeypot
    status.className = 'form-status'; status.textContent = '';
    const fields = $$('input:not(.hp), select, textarea', form);
    const bad = fields.filter((el) => !check(el));
    if (bad.length) {
      status.classList.add('is-error');
      status.textContent = `Please fix ${bad.length} highlighted field${bad.length > 1 ? 's' : ''} and try again.`;
      bad[0].focus();
      return;
    }
    const submitBtn = $('[data-submit]', form);
    submitBtn.disabled = true; status.textContent = 'Sending…';
    try {
      const action = form.getAttribute('action') || '';
      if (action.includes('YOUR_FORM_ID')) {
        // DEMO MODE: the placeholder endpoint has not been replaced yet.
        console.info('[btgc] Form endpoint is still the placeholder — submission simulated. Set the form action to your Formspree URL.');
        await new Promise((r) => setTimeout(r, 700));
      } else {
        const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    } catch (err) {
      status.classList.add('is-error');
      status.textContent = 'Sorry — we could not send your request. Please try again or call +971 50 969 9436.';
      submitBtn.disabled = false;
    }
  });
})();
})();
