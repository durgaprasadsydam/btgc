/* BTGC — Home hero: pinned, scroll-driven "services slider".
   Classic (non-module) deferred script — works over http(s) AND when index.html is opened straight from disk (file://).
   Loaded on index.html only, AFTER motion.js (so window.lenis, GSAP and plugins exist):
       <script defer src="assets/js/motion.js"></script>
       <script defer src="assets/js/main.js"></script>
       <script defer src="assets/js/hero-slider.js"></script>   ← here
   Markup: tools/build-pages.mjs → heroSlider()   ·   Slide data: tools/data.mjs → heroSlides
   Styles: src/input.css → "HOME HERO" block.
   Design: full-bleed photo, a short text block at the lower left (title · one line · two buttons), the row of service
   titles along the bottom (active one centred and bright, click it to open that service) and a thin progress line.

   Behaviour in one paragraph: one ScrollTrigger pins the hero for (N-1) viewports. The slide index follows scroll
   progress; every change plays a ~1.1s diagonal "slash" wipe timeline. The slide follows the real scroll position
   (wheel, trackpad, scrollbar and touch all behave the same): scroll ~60px and the neighbouring slide appears; when
   scrolling pauses the page glides to that slide's exact position via Lenis. Max one slide per gesture.
   After the last slide the pin releases into #after-hero.
   Reduced motion / no JS / failed libraries: slide 1 stays visible and the strip is a plain row of service links. */

(() => {
'use strict';

const root = document.documentElement;
const hero = document.querySelector('[data-sh]');
const $ = (s, c = hero) => c.querySelector(s);
const $$ = (s, c = hero) => Array.from(c.querySelectorAll(s));
const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);
if (hero) boot();

/** Mark the intro as finished so the CSS "hidden until intro" gate is released. */
function release() { hero.classList.add('is-intro-done'); }

function boot() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const libs = window.gsap && window.ScrollTrigger;

  // "Skip to next section" works in every mode (the animated mode replaces this handler below)
  $('[data-sh-skip]').addEventListener('click', () => {
    if (hero.classList.contains('js-hero-ready')) return;
    const next = document.getElementById('after-hero');
    if (!next) return;
    next.scrollIntoView({ behavior: 'auto' });
    next.setAttribute('tabindex', '-1');
    next.focus({ preventScroll: true });
  });

  if (reduce || !libs) { release(); return; }

  // Failsafe: never leave the hero gated if something below throws or stalls
  const failsafe = setTimeout(release, 10000);
  try {
    const fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    fonts.then(() => { try { setup(); } catch (err) { fail(err); } });
  } catch (err) { fail(err); }
  hero.addEventListener('sh:ready', () => clearTimeout(failsafe), { once: true });

  function fail(err) { console.error('[hero-slider] falling back to static hero', err); hero.classList.remove('js-hero-ready'); release(); }
}

function setup() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine) and (min-width: 768px)' },
    (ctx) => {
      const { motion, fine } = ctx.conditions;
      if (!motion) { release(); return undefined; }
      return run(!!fine);
    },
  );
}

function run(fine) {
  const { gsap, ScrollTrigger } = window;
  const cleanups = [];
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };

  /* ---------- elements & state ---------- */
  const slides = $$('[data-sh-slide]');
  const N = slides.length;
  const strip = $('[data-sh-strip]');
  const wrap = $('[data-sh-strip-wrap]');
  const links = $$('[data-sh-item]');
  const mainLinks = links.filter((a) => a.dataset.set === '1');
  const progEl = $('[data-sh-progress]');
  const trackEl = $('[data-sh-track]');
  const liveEl = $('[data-sh-live]');
  const slash = $('[data-sh-slash]');
  const cursorEl = $('[data-sh-cursor]');
  const pill = $('[data-sh-pill]');
  const skipBtn = $('[data-sh-skip]');
  const curtain = $('[data-sh-curtain]');
  const afterEl = document.getElementById('after-hero');
  const q = (sel, i) => slides[i].querySelector(sel);

  let current = 0;          // slide currently shown
  let target = null;        // slide we are programmatically scrolling to (ignore scroll-driven index meanwhile)
  let queued = null;        // slide whose (async) change is already scheduled
  let tl = null;            // running transition timeline
  let introDone = false;
  let skipping = false;
  let token = 0;
  let pending = null;       // at most one queued keyboard/strip jump
  let gesture = false;      // a scroll gesture is in progress
  let anchor = 0;           // slide the current gesture started on
  let idleTimer = 0;
  let lastCommit = 0;       // time of the last gesture-driven slide change
  let lastInput = 0;        // time of the last wheel / touch input (observed only, never intercepted)
  let touching = false;
  let lastAbs = 0;          // |deltaY| of the last wheel event
  let fromBelow = false;    // user has been below the hero since last being inside it
  const kbs = new Array(N).fill(null);

  hero.classList.add('js-hero-ready');
  hero.classList.toggle('has-cursor-mode', fine);
  hero.classList.toggle('has-pill', !fine);

  slides.forEach((s, i) => {
    s.classList.toggle('is-active', i === 0);
    if (i === 0) s.removeAttribute('inert'); else s.setAttribute('inert', '');
  });

  /* ---------- helpers ---------- */
  function startKB(i, from = 1.08) {
    if (kbs[i]) kbs[i].kill();
    kbs[i] = gsap.fromTo(q('[data-sh-img]', i), { scale: from }, { scale: 1, duration: 9, ease: 'none' });
  }

  // the file the browser will pick from <picture>: AVIF on wide screens, otherwise the 1280/1920 WebP
  const webpFor = (i) => {
    if (window.innerWidth > 1280) return slides[i].dataset.avif;
    const base = slides[i].dataset.webp;
    return window.innerWidth * (window.devicePixelRatio || 1) > 1280 ? base : base.replace('.webp', '-1280.webp');
  };
  function preload(i) {
    if (i < 0 || i >= N) return;
    const img = q('[data-sh-img]', i);
    if (img.complete && img.naturalWidth) return;
    new Image().src = webpFor(i);
  }
  function loaded(i) {
    const img = q('[data-sh-img]', i);
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = webpFor(i); setTimeout(res, 700); });
  }

  function centerX(i) {
    const li = mainLinks[i].parentElement;
    return wrap.clientWidth / 2 - (li.offsetLeft + li.offsetWidth / 2);
  }
  function centerStrip(i, animate) {
    if (animate) gsap.to(strip, { x: centerX(i), duration: 0.9, ease: 'expo.out', overwrite: true });
    else gsap.set(strip, { x: centerX(i) });
  }

  function chrome(i, animate) {
    mainLinks.forEach((a, k) => {
      a.classList.toggle('is-active', k === i);
      if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    liveEl.textContent = `${slides[i].dataset.title}, slide ${i + 1} of ${N}`;
    centerStrip(i, animate);
    preload(i + 1); preload(i - 1);
  }

  /* ---------- scrolling primitives (shared Lenis instance, native fallback) ---------- */
  function scrollToY(y, { duration = 1.1, easing = easeOut4, onComplete, lock = false } = {}) {
    if (window.lenis) window.lenis.scrollTo(y, { duration, easing, onComplete, lock });
    else { window.scrollTo({ top: y, behavior: 'smooth' }); setTimeout(() => onComplete && onComplete(), duration * 1000 + 100); }
  }

  /* ---------- the slide transition ---------- */
  function transition(to, dir) {
    if (to === current) return;
    if (tl) tl.progress(1, false); // finish the running transition so we never mix states
    const from = current;
    current = to;
    queued = null;
    const fwd = dir > 0;
    const sgn = fwd ? 1 : -1;
    const sIn = slides[to], sOut = slides[from];

    sIn.classList.add('is-active', 'is-incoming');
    sIn.removeAttribute('inert');

    const mIn = q('[data-sh-media]', to), mOut = q('[data-sh-media]', from), dimOut = q('[data-sh-dim]', from);
    const textOf = (i) => ({ title: q('[data-sh-title-in]', i), rest: [q('[data-sh-sub]', i), q('[data-sh-ctas]', i)] });
    const tIn = textOf(to), tOut = textOf(from);
    const W = hero.clientWidth, H = hero.clientHeight;
    const startPoly = fwd ? 'polygon(100% 0, 100% 0, 85% 100%, 85% 100%)' : 'polygon(0 0, 0 0, -15% 100%, 0 100%)';
    const endPoly = fwd ? 'polygon(0 0, 100% 0, 100% 100%, -15% 100%)' : 'polygon(0 0, 115% 0, 100% 100%, 0 100%)';
    const theta = (Math.atan((0.15 * W) / H) * 180) / Math.PI;

    gsap.set(mIn, { clipPath: startPoly });
    gsap.set(tIn.title, { yPercent: 110 * sgn });
    gsap.set(tIn.rest, { autoAlpha: 0, y: 16 * sgn });
    gsap.set(slash, { skewX: -theta, x: fwd ? W * 1.02 : -W * 0.02, opacity: 1 });
    startKB(to);
    chrome(to, true);

    tl = gsap.timeline({
      onComplete() {
        sOut.classList.remove('is-active');
        sOut.setAttribute('inert', '');
        sIn.classList.remove('is-incoming');
        if (kbs[from]) kbs[from].kill();
        gsap.set([mOut, dimOut, q('[data-sh-img]', from), tOut.title, ...tOut.rest], { clearProps: 'all' });
        gsap.set([tIn.title, ...tIn.rest], { clearProps: 'transform,opacity,visibility' });
        gsap.set(mIn, { clearProps: 'clipPath' });
        gsap.set(slash, { opacity: 0 });
        tl = null;
      },
    });
    tl.to(tOut.title, { yPercent: -110 * sgn, duration: 0.55, ease: 'power3.in' }, 0)
      .to(tOut.rest, { autoAlpha: 0, y: -16 * sgn, duration: 0.4, stagger: 0.04, ease: 'power2.in' }, 0)
      .to(mIn, { clipPath: endPoly, duration: 1.1, ease: 'expo.out' }, 0.1)
      .to(mOut, { scale: 0.96, duration: 1.1, ease: 'expo.out' }, 0.1)
      .to(dimOut, { opacity: 0.65, duration: 0.9, ease: 'power2.out' }, 0.1)
      .to(slash, { x: fwd ? -W * 0.2 : W * 1.2, duration: 0.7, ease: 'power3.inOut' }, 0.1)
      .to(slash, { opacity: 0, duration: 0.25, ease: 'none' }, 0.55)
      .to(tIn.title, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0.45)
      .to(tIn.rest, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out' }, 0.65);
  }

  /** Change slide with a transition (waits briefly for the image so the wipe never reveals a blank frame). */
  function change(to, dir) {
    if (to === current || to === queued) return;
    queued = to;
    const mine = ++token;
    loaded(to).then(() => { if (mine === token) transition(to, dir || (to > current ? 1 : -1)); });
  }

  /** Change slide without animation (scroll restoration, after "skip"). */
  function setInstant(i) {
    if (tl) tl.progress(1, false);
    if (i === current) return;
    const old = current;
    current = i;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.remove('is-incoming');
      if (k === i) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });
    gsap.set([...slides[old].querySelectorAll('*'), ...slides[i].querySelectorAll('*')], { clearProps: 'all' });
    if (kbs[old]) kbs[old].kill();
    startKB(i, 1.04);
    chrome(i, false);
  }

  /* ---------- the pinned ScrollTrigger ---------- */
  // progress fill: a short segment (1/N) on the first slide that grows to the full width on the last, scrubbed to scroll
  const fillFor = (p) => (p * (N - 1) + 1) / N;
  // html.sh-active = hero still covering the viewport (inclusive of the last slide's end position)
  let st = null;
  const syncNav = () => { if (st) root.classList.toggle('sh-active', window.scrollY <= st.end + 4); };
  st = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => '+=' + (N - 1) * hero.offsetHeight,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority: 3, // above the other pinned sections lower on the page
    onUpdate(self) {
      gsap.set(progEl, { scaleX: fillFor(self.progress) }); // scrubbed straight to scroll
      syncNav();
    },
    onToggle: () => syncNav(), // lets CSS keep the navbar transparent while the hero is on screen
    onEnterBack() {
      // arriving from the next section (not merely starting a scroll at the end): land on the last slide
      if (!fromBelow || target !== null || skipping) return;
      fromBelow = false;
      gesture = false;
      target = N - 1;
      scrollToY(st.end, { duration: 0.35, lock: true, onComplete: () => { target = null; fromBelow = false; } });
      setTimeout(() => { if (target === N - 1) target = null; }, 700);
    },
  });
  syncNav();
  cleanups.push(() => { st.kill(); root.classList.remove('sh-active'); });

  const stepPx = () => (st.end - st.start) / (N - 1);
  const yFor = (i) => st.start + i * stepPx();
  const inZone = () => window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;

  /** Programmatic jump (keyboard / strip): show the slide now and move the scroll position with it. One change may queue. */
  function go(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (target !== null) { pending = i; return; }
    target = i;
    gesture = false;
    clearTimeout(idleTimer);
    change(i);
    const done = () => {
      if (target !== i) return;
      target = null;
      if (pending !== null) { const n = pending; pending = null; if (n !== current) go(n); }
    };
    scrollToY(yFor(i), { duration: 1.1, onComplete: done });
    setTimeout(done, 1500); // safety if Lenis is interrupted
  }

  /* ---------- scroll-driven slides: the slide follows the real scroll position ----------
     Works for wheel, trackpad, scrollbar and touch alike — nothing depends on intercepting wheel events.
     A gesture starts when the scroll position moves; once it is more than ~60px from the slide it began on, the
     neighbouring slide is shown (never more than ±1 per gesture). When scrolling pauses, the page glides to the
     exact position of the current slide, so "one gesture = one slide" and scroll position and slide stay in sync. */
  // ~10px of deliberate scroll is enough to commit the next slide in that direction (light trackpad swipes never "pull back")
  const THRESH = () => Math.min(10, stepPx() * 0.02);
  const COOLDOWN = 800, ACTIVE = 180, DELIBERATE = 18;
  // input counts as deliberate while events keep arriving with real magnitude; a fling's decaying inertia tail does not
  const inputActive = () => touching || (performance.now() - lastInput < ACTIVE && lastAbs >= DELIBERATE);
  function onScroll() {
    if (!introDone || skipping) return;
    const y = window.scrollY;
    const now = performance.now();
    if (y > st.end + 20 && target === null) fromBelow = true;
    if (y > st.end + 2) { if (current !== N - 1 && target === null) change(N - 1, 1); return; } // past the hero: last slide stays
    if (target !== null) return; // a programmatic move (keyboard / strip / settle) is in charge
    if (!gesture) { gesture = true; anchor = current; lastCommit = 0; }
    // sustained scrolling (input still arriving after the cooldown) re-anchors on the new slide so the next one can follow;
    // a single flick's leftover momentum has no input, so it can never skip a slide
    if (lastCommit && now - lastCommit > COOLDOWN && inputActive()) anchor = current;
    const dy = y - yFor(anchor);
    const dir = dy > THRESH() ? 1 : dy < -THRESH() ? -1 : 0;
    const idx = Math.max(0, Math.min(N - 1, anchor + dir));
    if (idx !== current) { change(idx, idx > current ? 1 : -1); lastCommit = now; }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(settle, 110);
  }
  function settle() {
    gesture = false;
    if (target !== null || skipping || !introDone) return;
    const y = window.scrollY;
    if (y > st.end + 2 || y < st.start - 2) return;
    const to = yFor(current);
    if (Math.abs(y - to) <= 2) return;
    const mine = current;
    target = mine;
    // lock: further wheel input is ignored during the glide, so a gesture can never stack extra slides
    scrollToY(to, { duration: 0.7, lock: true, onComplete: () => { if (target === mine) target = null; } });
    setTimeout(() => { if (target === mine) target = null; }, 1100);
  }
  const mark = () => { lastInput = performance.now(); };
  on(window, 'wheel', (e) => { lastAbs = Math.abs(e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY); mark(); }, { passive: true, capture: true });
  on(window, 'touchstart', () => { touching = true; mark(); }, { passive: true });
  on(window, 'touchmove', mark, { passive: true });
  on(window, 'touchend', () => { touching = false; mark(); }, { passive: true });
  on(window, 'touchcancel', () => { touching = false; }, { passive: true });
  on(window, 'scroll', onScroll, { passive: true });
  on(window, 'scroll', syncNav, { passive: true }); // ScrollTrigger stops updating once the hero is left, so listen directly
  cleanups.push(() => clearTimeout(idleTimer));

  function onKey(e) {
    if (!introDone || skipping || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], dialog')) return;
    if (root.classList.contains('is-locked') || !inZone()) return;
    const dir = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : e.key === 'ArrowUp' || e.key === 'PageUp' ? -1 : 0;
    if (!dir) return;
    const base = pending !== null ? pending : target !== null ? target : current;
    if (base + dir < 0 || base + dir > N - 1) return; // at the ends the browser scrolls the page
    e.preventDefault();
    go(base + dir);
  }
  on(document, 'keydown', onKey);

  /* strip: click an item to jump to its slide (copies behave the same) */
  links.forEach((a) => on(a, 'click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const i = Number(a.dataset.shItem);
    if (i === current && a.dataset.set === '1') return; // the active title is a normal link to its service page
    e.preventDefault();
    if (introDone && !skipping) go(i);
  }));

  /* ---------- skip to the next section ---------- */
  function finishSkip() {
    if (!skipping) return;
    skipping = false;
    target = null;
    setInstant(N - 1); // so scrolling back up re-enters from the last slide
  }
  function skipToNext() {
    if (!afterEl || skipping || !introDone) return;
    skipping = true;
    target = N - 1;
    if (window.lenis) window.lenis.scrollTo(afterEl, { duration: 1.4, easing: easeOut4, onComplete: finishSkip });
    else { afterEl.scrollIntoView({ behavior: 'smooth' }); setTimeout(finishSkip, 1500); }
    setTimeout(finishSkip, 1800); // safety if the scroll gets interrupted
  }
  on(skipBtn, 'click', skipToNext);
  on(pill, 'click', skipToNext);

  /* ---------- "SCROLL DOWN" cursor (fine pointers only) ---------- */
  if (fine) {
    const qx = gsap.quickTo(cursorEl, 'x', { duration: 0.35, ease: 'power3' });
    const qy = gsap.quickTo(cursorEl, 'y', { duration: 0.35, ease: 'power3' });
    const arrow = $('[data-sh-cursor-arrow]');
    let inside = false, dot = false;
    const interactive = (t) => t.closest && t.closest('a, button, [data-sh-strip-wrap]');
    const show = (b) => { gsap.to(cursorEl, { opacity: b ? 1 : 0, duration: 0.25, overwrite: 'auto' }); root.classList.toggle('sh-cursor-on', b); };
    const setDot = (b) => { if (b === dot) return; dot = b; cursorEl.classList.toggle('is-dot', b); gsap.to(cursorEl, { scale: b ? 8 / 96 : 1, duration: 0.35, ease: 'power3' }); };

    on(hero, 'mouseenter', (e) => { if (!introDone) return; gsap.set(cursorEl, { x: e.clientX, y: e.clientY }); inside = true; show(true); });
    on(hero, 'mouseleave', () => { inside = false; show(false); });
    on(hero, 'mousemove', (e) => {
      if (!introDone) return;
      if (!inside) { gsap.set(cursorEl, { x: e.clientX, y: e.clientY }); inside = true; show(true); }
      qx(e.clientX); qy(e.clientY);
      setDot(!!interactive(e.target));
    });
    on(hero, 'click', (e) => {
      if (interactive(e.target)) return;
      gsap.fromTo(cursorEl, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'expo.out' });
      gsap.fromTo(arrow, { y: 0 }, { y: 6, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
      skipToNext();
    });
    cleanups.push(() => root.classList.remove('sh-cursor-on'));
  }

  /* ---------- intro (after the preloader / page wipe) ---------- */
  function afterPreloader() {
    const busy = () => root.classList.contains('preload') || root.classList.contains('pt');
    return new Promise((res) => {
      if (!busy()) return res();
      const mo = new MutationObserver(() => { if (!busy()) { mo.disconnect(); res(); } });
      mo.observe(root, { attributes: true, attributeFilter: ['class'] });
      setTimeout(() => { mo.disconnect(); res(); }, 4000);
    });
  }
  function finishIntro() {
    introDone = true;
    release();
    startKB(current, 1.08);
    preload(current + 1);
    hero.dispatchEvent(new Event('sh:ready'));
  }
  function intro() {
    if (st.progress > 0.01) { // page restored mid-hero (reload / back button): no intro, just land on the right slide
      setInstant(Math.round(st.progress * (N - 1)));
      gsap.set(progEl, { scaleX: fillFor(st.progress) });
      gsap.set(curtain, { opacity: 0 });
      finishIntro();
      return;
    }
    const items = $$('.sh-item');
    const t0 = q('[data-sh-title-in]', 0), rest0 = [q('[data-sh-sub]', 0), q('[data-sh-ctas]', 0)];
    gsap.set(t0, { yPercent: 110 });
    const itl = gsap.timeline({ onComplete: finishIntro });
    itl.fromTo(curtain, { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0) // fade from black
      .fromTo(q('[data-sh-img]', 0), { scale: 1.15 }, { scale: 1.08, duration: 1.6, ease: 'power2.out' }, 0)
      .to(t0, { yPercent: 0, duration: 1, ease: 'expo.out' }, 0.5)
      .fromTo(rest0, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', clearProps: 'transform' }, 0.8)
      .fromTo(items, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' }, 0.55)
      .fromTo(trackEl, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: 1, ease: 'expo.out' }, 1.0)
      .fromTo(pill, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.4);
    cleanups.push(() => itl.kill());
  }

  /* ---------- initial layout ---------- */
  chrome(0, false);
  gsap.set(progEl, { scaleX: fillFor(0) });
  afterPreloader().then(intro);

  // keep the strip centred and the pin distances right after resize / orientation change / late fonts & images
  const onRefresh = () => centerStrip(current, false);
  ScrollTrigger.addEventListener('refresh', onRefresh);
  cleanups.push(() => ScrollTrigger.removeEventListener('refresh', onRefresh));
  const firstImg = q('[data-sh-img]', 0);
  const imgReady = firstImg.decode ? firstImg.decode().catch(() => {}) : Promise.resolve();
  Promise.all([document.fonts ? document.fonts.ready : null, imgReady]).then(() => ScrollTrigger.refresh());

  /* ---------- revert (breakpoint change / reduced-motion toggle) ---------- */
  return () => {
    cleanups.forEach((fn) => fn());
    if (tl) tl.kill();
    gsap.killTweensOf(hero.querySelectorAll('*'));
    gsap.set(hero.querySelectorAll('*'), { clearProps: 'all' });
    hero.classList.remove('js-hero-ready', 'has-pill', 'has-cursor-mode');
    root.classList.remove('sh-cursor-on');
    slides.forEach((s, i) => { s.classList.toggle('is-active', i === 0); s.classList.remove('is-incoming'); if (i === 0) s.removeAttribute('inert'); else s.setAttribute('inert', ''); });
    release();
  };
}
})();
