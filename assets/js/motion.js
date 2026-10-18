/* BTGC — shared motion layer (GSAP 3.13 + ScrollTrigger + SplitText + Lenis)
   Loaded as a classic deferred script on every page after the CDN scripts (modules are blocked on file://).
   Safety: if libraries are missing, reduced motion is requested, or anything throws,
   the page falls back to fully-visible static content (html.no-motion). */

(() => {
'use strict';

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const libsOk = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function staticFallback() {
  root.classList.add('no-motion');
  root.classList.remove('preload', 'pt');
  window.__btgcReady = true;
  // anchor links use native scrolling (CSS scroll-padding handles the fixed header)
}

if (!libsOk || reduce) {
  staticFallback();
} else {
  try {
    init();
  } catch (err) {
    console.error('[btgc] motion failed, showing static content', err);
    staticFallback();
  }
}

function init() {
  const { gsap, ScrollTrigger } = window;
  const plugins = [ScrollTrigger];
  if (window.SplitText) plugins.push(window.SplitText);
  if (window.Flip) plugins.push(window.Flip);
  gsap.registerPlugin(...plugins);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- 1. Lenis + ScrollTrigger sync ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.btgc = { lenis };
    window.lenis = lenis;
    // features.js pauses scrolling while the mobile menu / modals are open
    document.addEventListener('btgc:lock', () => lenis.stop());
    document.addEventListener('btgc:unlock', () => lenis.start());
  }

  // Anchor links scroll via lenis.scrollTo()
  const scrollToHash = (hash, immediate = false) => {
    const target = hash === '#top' || hash === '' ? 0 : $(hash);
    if (target === null || target === undefined) return false;
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -76, duration: immediate ? 0 : 1.3, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 76 });
    return true;
  };
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    if (scrollToHash(url.hash)) {
      e.preventDefault();
      history.pushState(null, '', url.hash);
    }
  });

  /* ---------- 9. Page transitions (diagonal slash wipe) ---------- */
  const wipe = $('[data-wipe]');
  const panels = $$('[data-wipe-panel]');
  const resetPanels = (x) => gsap.set(panels, { xPercent: x, x: 0, skewX: -20 });
  let leaving = false;

  function leave(href) {
    if (leaving || !wipe) { location.href = href; return; }
    leaving = true;
    resetPanels(-101);
    gsap.set(wipe, { visibility: 'visible' });
    gsap.to(panels, {
      xPercent: 0, duration: 0.65, ease: 'power3.inOut', stagger: 0.09,
      onComplete: () => {
        try { sessionStorage.setItem('btgc-pt', '1'); } catch (e) { /* ignore */ }
        location.href = href;
      },
    });
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;
    const raw = a.getAttribute('href');
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) return;
    const url = new URL(a.href, location.href);
    if (!/^(https?:|file:)$/.test(url.protocol) || url.origin !== location.origin) return;
    if (url.pathname === location.pathname && (url.hash || url.search === location.search)) return;
    e.preventDefault();
    leave(url.href);
  });
  // Back/forward cache: make sure the wipe is not left covering the page
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      leaving = false;
      root.classList.remove('pt');
      if (wipe) gsap.set(wipe, { visibility: 'hidden' });
      if (lenis) lenis.start();
    }
  });

  function arrive() {
    // Came from a transition: panels already cover the page (html.pt) → slide them away
    return new Promise((resolve) => {
      if (!wipe) { root.classList.remove('pt'); return resolve(); }
      resetPanels(0);
      gsap.set(wipe, { visibility: 'visible' });
      root.classList.remove('pt');
      try { sessionStorage.removeItem('btgc-pt'); } catch (e) { /* ignore */ }
      gsap.to(panels, {
        xPercent: 101, duration: 0.7, ease: 'power3.inOut', stagger: { each: 0.08, from: 'end' },
        onStart: () => gsap.delayedCall(0.25, resolve),
        onComplete: () => gsap.set(wipe, { visibility: 'hidden' }),
      });
    });
  }

  /* ---------- 2. Preloader (first visit per session, ≤1.6s) ---------- */
  function preloader() {
    const pre = $('[data-preloader]');
    if (!root.classList.contains('preload') || !pre) { root.classList.remove('preload'); return Promise.resolve(); }
    try { sessionStorage.setItem('btgc-pre', '1'); } catch (e) { /* ignore */ }
    if (lenis) lenis.stop();
    return new Promise((resolve) => {
      const logo = $('[data-pre-logo]', pre);
      const counter = $('[data-pre-count]', pre);
      // logo is revealed with a diagonal slash wipe, then settles
      gsap.set(logo, { clipPath: 'polygon(0 0, 0 0, -30% 100%, -30% 100%)', scale: 0.94 });
      const num = { v: 0 }, edge = { t: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          pre.style.display = 'none';
          root.classList.remove('preload');
          if (lenis) lenis.start();
        },
      });
      tl.to(logo, { clipPath: 'polygon(0 0, 130% 0, 100% 100%, -30% 100%)', duration: 0.7, ease: 'power3.out' }, 0.05)
        .to(logo, { scale: 1, duration: 0.9, ease: 'power2.out' }, 0.05)
        .to(num, { v: 100, duration: 1.0, ease: 'power2.inOut', onUpdate: () => { counter.textContent = Math.round(num.v); } }, 0.05)
        // diagonal wipe
        .to(edge, {
          t: 1, duration: 0.5, ease: 'power3.inOut',
          onUpdate: () => { pre.style.clipPath = `polygon(${edge.t * 130}% 0, 100% 0, 100% 100%, ${edge.t * 130 - 30}% 100%)`; },
        }, 1.05)
        .call(resolve, null, 1.3);
    });
  }

  /* ---------- 3. Hero ---------- */
  function heroIntro() {
    const title = $('[data-hero-title]');
    const fades = $$('[data-hero-fade]');
    if (title && window.SplitText) {
      window.SplitText.create(title, {
        type: 'lines,words', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit(self) {
          gsap.set(title, { autoAlpha: 1 });
          return gsap.from(self.words, { yPercent: 115, duration: 1.2, stagger: 0.07, ease: 'expo.out' });
        },
      });
    } else if (title) gsap.set(title, { autoAlpha: 1 });
    if (fades.length) gsap.fromTo(fades, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.45, clearProps: 'transform' });
    $$('[data-hero-slash]').forEach((el, i) => {
      gsap.fromTo(el, { xPercent: 160, skewX: -24, opacity: 0 }, { xPercent: 0, skewX: -24, opacity: i ? 0.55 : 0.92, duration: 1.4, ease: 'expo.out', delay: 0.2 + i * 0.15 });
    });
    const hint = $('[data-scroll-hint]');
    if (hint) gsap.from(hint, { opacity: 0, y: 20, duration: 1, delay: 1.1 });
  }

  function heroParallax() {
    $$('[data-hero]').forEach((hero) => {
      const bg = $('[data-hero-bg]', hero);
      if (!bg) return;
      // slow Ken-Burns + scroll parallax on the same element (transforms merge in GSAP)
      gsap.fromTo(bg, { scale: 1.02 }, { scale: 1.14, duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo(bg, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- 4. Section reveals ---------- */
  function reveals() {
    $$('[data-reveal]').forEach((el) => {
      if (el.dataset.reveal === 'clip') {
        const r = el.hasAttribute('data-mirror');
        const from = r ? 'polygon(0 0, 0 0, 10% 100%, 10% 100%)' : 'polygon(10% 0, 10% 0, 0 100%, 0 100%)';
        const to = r ? 'polygon(0 0, 90% 0, 100% 100%, 10% 100%)' : 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)';
        gsap.fromTo(el, { clipPath: from }, {
          clipPath: to, duration: 1.5, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          onComplete() { el.classList.add('is-in'); gsap.set(el, { clearProps: 'clipPath' }); },
        });
        const img = $('img', el);
        if (img && !img.hasAttribute('data-parallax')) gsap.fromTo(img, { scale: 1.35 }, { scale: 1.12, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
      } else {
        gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      }
    });

    // Heading line reveals — split lazily, just before each heading nears the viewport (keeps first load light)
    if (window.SplitText) {
      $$('[data-split]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 130%', once: true,
          onEnter: () => {
            window.SplitText.create(el, {
              type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
              onSplit(self) {
                gsap.set(el, { autoAlpha: 1 });
                return gsap.from(self.lines, { yPercent: 110, duration: 1.15, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
              },
            });
          },
        });
      });
    } else $$('[data-split]').forEach((el) => gsap.set(el, { autoAlpha: 1 }));

    // Card grids
    $$('[data-batch]').forEach((group) => {
      const items = Array.from(group.children);
      ScrollTrigger.batch(items, {
        start: 'top 92%', once: true,
        onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.95, ease: 'expo.out', stagger: 0.08, clearProps: 'transform', overwrite: true }),
      });
    });

    // CTA slashes
    $$('[data-cta-slashes]').forEach((wrap) => {
      $$('[data-cta-slash]', wrap).forEach((el, i) => gsap.fromTo(el, { xPercent: 140, skewX: -24, opacity: 0 }, { xPercent: 0, skewX: -24, opacity: 1, duration: 1.4, ease: 'expo.out', delay: i * 0.15, scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } }));
    });

    // Parallax on masked images
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { scale: 1.2, yPercent: -8 }, { scale: 1.2, yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- 5. Counters ---------- */
  function counters() {
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const from = parseFloat(el.dataset.from || 0);
      const obj = { v: from };
      el.textContent = from;
      ScrollTrigger.create({
        trigger: el, start: 'top 94%', once: true,
        onEnter: () => gsap.to(obj, { v: end, duration: 2.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); }, onComplete: () => { el.textContent = end; } }),
      });
    });
  }

  /* ---------- 6 + 7. Pinned sections (desktop only; stacked otherwise) ---------- */
  function pinned() {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      // Horizontal featured projects
      const hs = $('[data-hscroll]');
      if (hs) {
        const track = $('[data-hscroll-track]', hs);
        const bar = $('[data-hscroll-progress]', hs);
        const count = $('[data-hscroll-count]', hs);
        const cards = $$('[data-hs-card]', hs).length;
        hs.classList.add('hscroll--pinned');
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: hs, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, anticipatePin: 1,
            invalidateOnRefresh: true, refreshPriority: 2,
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
              if (count) count.textContent = String(Math.min(cards, Math.round(self.progress * (cards - 1)) + 1)).padStart(2, '0');
            },
          },
        });
      }

      // WBS timeline with drawing SVG line
      const wbs = $('[data-wbs]');
      if (wbs) {
        const steps = $$('[data-wbs-step]', wbs);
        const items = $$('[data-wbs-panel]', wbs);
        const draw = $('[data-wbs-draw]', wbs);
        const n = items.length;
        wbs.classList.add('wbs--pinned');
        gsap.set(items, { autoAlpha: 0 });
        gsap.set(items[0], { autoAlpha: 1 });
        const setActive = (idx) => steps.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.classList.toggle('is-done', i < idx); });
        setActive(0);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: wbs, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 3.2), pin: true, scrub: 0.6, anticipatePin: 1, refreshPriority: 1,
            onUpdate: () => setActive(Math.min(n - 1, Math.floor(tl.time() + 0.3))),
          },
        });
        tl.fromTo(draw, { scaleX: 0.0001, svgOrigin: '0 10' }, { scaleX: 1, svgOrigin: '0 10', duration: n - 1 }, 0);
        for (let i = 1; i < n; i++) {
          tl.to(items[i - 1], { autoAlpha: 0, y: -24, duration: 0.3 }, i - 0.4)
            .fromTo(items[i], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.3 }, i - 0.2);
        }
        tl.to({}, { duration: 0.5 }); // hold on the last phase
      }

      return () => {
        $('[data-hscroll]')?.classList.remove('hscroll--pinned');
        $('[data-wbs]')?.classList.remove('wbs--pinned');
      };
    });
  }

  /* ---------- 8. Magnetic buttons + custom cursor (pointer: fine) ---------- */
  function pointerFx() {
    if (!finePointer) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });

    const cursor = $('[data-cursor-root]');
    if (!cursor) return;
    root.classList.add('has-cursor');
    const dot = $('[data-cursor-dot]', cursor), ring = $('[data-cursor-ring]', cursor);
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', (e) => cursor.classList.toggle('is-hover', !!e.target.closest('a, button, [data-cursor], label, summary, select, input, textarea')));
    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    document.documentElement.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
    document.documentElement.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
  }

  /* ---------- 12. Refresh after fonts / images ---------- */
  const refresh = gsap.delayedCall(0.15, () => ScrollTrigger.refresh()).pause();
  const queueRefresh = () => refresh.restart(true);

  /* ---------- Boot ---------- */
  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  const cameViaWipe = root.classList.contains('pt');

  heroParallax();
  reveals();
  counters();
  pinned();
  pointerFx();
  window.__btgcReady = true;

  // The preloader / wipe doesn't need fonts, so it starts immediately; the hero text waits for both.
  const intro = cameViaWipe ? arrive() : preloader();
  fontsReady.then(queueRefresh);
  Promise.all([intro, fontsReady]).then(() => {
    heroIntro();
    queueRefresh();
    if (location.hash) scrollToHash(location.hash, true);
  });
  window.addEventListener('load', queueRefresh);
  $$('img[loading="lazy"]').forEach((img) => { if (!img.complete) img.addEventListener('load', queueRefresh, { once: true }); });
}
})();
