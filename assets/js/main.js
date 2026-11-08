/* =========================================================
   BTGC Group — site interactions
   GSAP + ScrollTrigger + SplitText + Lenis
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  const reveal = () => {
    window.__btgcReady = true;
    root.classList.remove("js-loading");
  };

  if (!hasGSAP) { reveal(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4, ...opts });
    else {
      const el = typeof target === "string" ? $(target) : target;
      if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
      else if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ---------- Header ---------- */
  const header = $(".site-header");
  let lastY = 0;
  const onScroll = (y) => {
    if (!header) return;
    header.classList.toggle("is-solid", y > 60);
    const goingDown = y > lastY && y > 160;
    if (!root.classList.contains("menu-open")) header.classList.toggle("is-hidden", goingDown);
    lastY = y;
    const toTop = $("[data-to-top]");
    if (toTop) {
      toTop.classList.toggle("opacity-0", y < 500);
      toTop.classList.toggle("pointer-events-none", y < 500);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      toTop.style.setProperty("--p", (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%");
    }
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);

  /* ---------- Side drawer menu (reference: round menu button) ---------- */
  const drawer = $("[data-menu]");
  const menuBtns = $$("[data-menu-toggle]");
  if (drawer && menuBtns.length) {
    const panel = $(".drawer-panel", drawer);
    const overlay = $(".drawer-overlay", drawer);
    const items = [...$$("[data-menu-meta]", drawer), ...$$("[data-menu-link]", drawer)];
    const tl = gsap.timeline({ paused: true })
      .set(drawer, { visibility: "visible" })
      .to(overlay, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
      .to(panel, { xPercent: 100, duration: 0.9, ease: "expo.inOut" }, 0)
      .from(items, { x: -30, autoAlpha: 0, duration: 0.8, stagger: 0.04 }, 0.35);
    let open = false;
    const setOpen = (v) => {
      open = v;
      root.classList.toggle("menu-open", v);
      menuBtns.forEach((b) => b.setAttribute("aria-expanded", String(v)));
      drawer.setAttribute("aria-hidden", String(!v));
      if (v) { lenis && lenis.stop(); tl.timeScale(1).play(); setTimeout(() => { const c = $("[data-menu-close].rounded-full", drawer); c && c.focus(); }, 300); }
      else { lenis && lenis.start(); tl.timeScale(1.7).reverse(); }
    };
    menuBtns.forEach((b) => b.addEventListener("click", () => setOpen(!open)));
    $$("[data-menu-close]", drawer).forEach((b) => b.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && open && setOpen(false));
  }

  /* ---------- Generic fade slider (hero + flagship banner) ---------- */
  const makeSlider = ({ slides, onChange, interval = 0, next, prev, onTick }) => {
    let idx = 0, timer = null, start = 0, busy = false;
    const go = (to, dir = 1) => {
      if (busy || to === idx) return;
      busy = true;
      const from = idx;
      idx = (to + slides.length) % slides.length;
      onChange(from, idx, dir, () => (busy = false));
      start = performance.now();
    };
    const step = (d) => go(idx + d, d);
    next && next.addEventListener("click", () => step(1));
    prev && prev.addEventListener("click", () => step(-1));
    if (interval && !reduceMotion) {
      start = performance.now();
      gsap.ticker.add(() => {
        if (document.hidden) { start = performance.now(); return; }
        const p = Math.min((performance.now() - start) / interval, 1);
        onTick && onTick(idx, p);
        if (p >= 1 && !busy) step(1);
      });
    }
    return { go, step, get index() { return idx; } };
  };

  const initHeroSlider = () => {
    const root = $("[data-hero-slider]");
    if (!root) return;
    const slides = $$("[data-hero-slide]", root);
    const texts = $$("[data-slide-text]", root);
    const bars = $$("[data-hero-bar]", root);
    const dots = $$("[data-hero-dot]", root);
    const counter = $("[data-hero-index]", root);
    // Ken Burns on the first image
    gsap.fromTo($("img", slides[0]), { scale: 1.12 }, { scale: 1, duration: 7, ease: "none" });
    const slider = makeSlider({
      slides, interval: 6500,
      next: $("[data-hero-next]", root), prev: $("[data-hero-prev]", root),
      onTick: (i, p) => bars.forEach((b, k) => gsap.set(b, { scaleX: k < i ? 1 : k === i ? p : 0 })),
      onChange: (from, to, dir, done) => {
        const inS = slides[to], outS = slides[from];
        counter && (counter.textContent = String(to + 1).padStart(2, "0"));
        bars.forEach((b, k) => gsap.set(b, { scaleX: k < to ? 1 : 0 }));
        gsap.set(inS, { zIndex: 2 }); gsap.set(outS, { zIndex: 1 });
        inS.classList.add("is-active");
        const tl = gsap.timeline({ onComplete: () => { outS.classList.remove("is-active"); gsap.set(outS, { opacity: 0, zIndex: 0 }); done(); } });
        tl.fromTo(inS, { opacity: 0, clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1.4, ease: "expo.inOut" }, 0)
          .fromTo($("img", inS), { scale: 1.18 }, { scale: 1, duration: 7.5, ease: "power2.out" }, 0)
          .to($("img", outS), { scale: 1.06, duration: 1.4, ease: "expo.inOut" }, 0);
        // text swap
        const tOut = texts[from], tIn = texts[to];
        tl.to(tOut.children, { y: -30, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "power3.in" }, 0)
          .set(tOut, { autoAlpha: 0 }, 0.65)
          .set(tIn, { autoAlpha: 1, visibility: "visible" }, 0.65)
          .fromTo($("[data-slide-script]", tIn), { y: 40, autoAlpha: 0, clipPath: "inset(-20% 120% -20% -20%)" }, { y: 0, autoAlpha: 1, clipPath: "inset(-20% -20% -20% -20%)", duration: 1.3, ease: "expo.out", clearProps: "clipPath" }, 0.7)
          .fromTo($("[data-slide-line]", tIn), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out" }, 0.85);
      },
    });
    dots.forEach((d, i) => d.addEventListener("click", () => slider.go(i, i > slider.index ? 1 : -1)));
    // swipe on touch
    let sx = null;
    root.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    root.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) slider.step(dx < 0 ? 1 : -1); sx = null; });
  };

  const initBanner = () => {
    const root = $("[data-banner]");
    if (!root) return;
    const slides = $$("[data-banner-slide]", root);
    const counter = $("[data-banner-index]", root);
    makeSlider({
      slides, interval: 0,
      next: $("[data-banner-next]", root), prev: $("[data-banner-prev]", root),
      onChange: (from, to, dir, done) => {
        const inS = slides[to], outS = slides[from];
        counter && (counter.textContent = String(to + 1).padStart(2, "0"));
        inS.classList.add("is-active");
        gsap.set(inS, { zIndex: 2 }); gsap.set(outS, { zIndex: 1 });
        const panel = $(".diag-panel-r > div:last-child", inS);
        gsap.timeline({ onComplete: () => { outS.classList.remove("is-active"); gsap.set(outS, { opacity: 0, zIndex: 0 }); done(); } })
          .fromTo(inS, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
          .fromTo($("img", inS), { scale: 1.1, xPercent: dir * 4 }, { scale: 1, xPercent: 0, duration: 1.4, ease: "expo.out" }, 0)
          .fromTo(panel.children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.06, ease: "expo.out" }, 0.15);
      },
    });
    let sx = null;
    root.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    root.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) $(dx < 0 ? "[data-banner-next]" : "[data-banner-prev]", root).click(); sx = null; });
  };

  /* ---------- Page transitions ---------- */
  const curtain = $(".page-curtain");
  // Normalise: GSAP owns the transform (the CSS translateY(100%) is only a no-JS default)
  if (curtain) gsap.set(curtain, { y: 0, yPercent: 100 });
  const isInternal = (a) => {
    if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.lightbox !== undefined) return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== "file:") return false;
    return url.pathname !== location.pathname || !url.hash;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href") || "";
    // Same-page anchors -> smooth scroll
    if (href.startsWith("#") && href.length > 1 && $(href)) {
      e.preventDefault();
      scrollTo(href);
      return;
    }
    if (!isInternal(a) || reduceMotion || !curtain) return;
    e.preventDefault();
    sessionStorage.setItem("btgc-transition", "1");
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut", onComplete: () => (location.href = a.href) });
  });
  // bfcache: reset curtain when coming back
  window.addEventListener("pageshow", (e) => { if (e.persisted && curtain) gsap.set(curtain, { yPercent: 100 }); });

  /* ---------- Intro (preloader or curtain) ---------- */
  const preloader = $("#preloader");
  const cameFromTransition = sessionStorage.getItem("btgc-transition") === "1";
  sessionStorage.removeItem("btgc-transition");
  const seenLoader = sessionStorage.getItem("btgc-loaded") === "1";

  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    const heroImg = $("[data-hero-img]");
    if (heroImg) tl.fromTo(heroImg, { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0);
    $$("[data-hero-split]").forEach((el, i) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      tl.from(split.lines, { yPercent: 115, duration: 1.4, stagger: 0.1 }, 0.15 + i * 0.1);
    });
    const fades = $$("[data-hero-fade]");
    if (fades.length) tl.fromTo(fades, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.5);
    const panel = $(".hero-card .diag-panel");
    if (panel) tl.from(panel, { xPercent: -100, duration: 1.5, ease: "expo.inOut" }, 0);
    const firstSlide = $("[data-hero-slide] img");
    if (firstSlide && !heroImg) tl.fromTo(firstSlide, { scale: 1.25 }, { scale: 1, duration: 2.4 }, 0);
    tl.from(".site-header .hdr-bar > *", { y: -30, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.4);
    return tl;
  };

  const startPage = () => {
    reveal();
    if (reduceMotion) { gsap.set("[data-hero-fade]", { autoAlpha: 1 }); return; }
    heroIntro();
  };

  const runPreloader = () => {
    const counter = $("[data-loader-count]", preloader);
    const bar = $("[data-loader-bar]", preloader);
    const shapes = $$("[data-loader-shape]", preloader);
    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => { preloader.remove(); sessionStorage.setItem("btgc-loaded", "1"); },
    });
    tl.from(shapes, { scale: 0.85, autoAlpha: 0, duration: 1, ease: "expo.out" })
      .to(obj, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => counter && (counter.textContent = String(Math.round(obj.v)).padStart(3, "0")) }, 0)
      .to(bar, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0)
      .to("[data-loader-inner]", { autoAlpha: 0, y: -30, duration: 0.6, ease: "power3.in" }, "+=0.15")
      .to(preloader, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", duration: 1.1, ease: "expo.inOut" })
      .add(startPage, "-=0.75");
  };

  const boot = () => {
    if (preloader && !seenLoader && !reduceMotion) { runPreloader(); return; }
    if (preloader) preloader.remove();
    if (cameFromTransition && curtain && !reduceMotion) {
      gsap.set(curtain, { yPercent: 0 });
      gsap.to(curtain, { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.05 });
      gsap.delayedCall(0.35, startPage);
    } else startPage();
  };

  /* ---------- Scroll animations ---------- */
  const initScroll = () => {
    if (reduceMotion) return;

    // Split headings: lines slide up
    $$("[data-split]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.3, stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    // Word-by-word highlight scrubbed with scroll
    $$("[data-words]").forEach((el) => {
      const split = SplitText.create(el, { type: "words" });
      gsap.fromTo(split.words, { opacity: 0.16 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      });
    });

    // Fade/slide up
    $$("[data-reveal]").forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 1.2, delay,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    // Stagger children
    $$("[data-stagger]").forEach((wrap) => {
      const items = wrap.children;
      gsap.fromTo(items, { autoAlpha: 0, y: 50 }, {
        autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08,
        scrollTrigger: { trigger: wrap, start: "top 85%", once: true },
      });
    });

    // Image clip reveal
    $$("[data-img-reveal]").forEach((wrap) => {
      const img = $("img", wrap);
      const dir = wrap.dataset.imgReveal || "up";
      const from = dir === "left" ? "inset(0 100% 0 0)" : dir === "right" ? "inset(0 0 0 100%)" : "inset(100% 0 0 0)";
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 85%", once: true } });
      tl.fromTo(wrap, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" });
      if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.1);
    });

    // Parallax
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: -amt * 50 }, {
        yPercent: amt * 50, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Counters
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 2.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => (el.textContent = obj.v.toFixed(dec)),
      });
    });

    // Vertical line draw (process)
    $$("[data-draw]").forEach((el) => {
      const axis = el.dataset.draw === "x" ? "scaleX" : "scaleY";
      gsap.fromTo(el, { [axis]: 0 }, {
        [axis]: 1, ease: "none", transformOrigin: axis === "scaleX" ? "left center" : "top center",
        scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "bottom 60%", scrub: true },
      });
    });

    // Hero image scroll-out
    const heroImg = $("[data-hero-img]");
    if (heroImg) {
      gsap.to(heroImg.parentElement, {
        yPercent: 18, ease: "none",
        scrollTrigger: { trigger: heroImg.closest("section"), start: "top top", end: "bottom top", scrub: true },
      });
    }

    // Horizontal scroll section (desktop only)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      $$("[data-hscroll]").forEach((section) => {
        const track = $("[data-hscroll-track]", section);
        const progress = $("[data-hscroll-progress]", section);
        if (!track) return;
        const dist = () => track.scrollWidth - window.innerWidth + 48;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: section, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8,
            invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: (self) => progress && gsap.set(progress, { scaleX: self.progress }),
          },
        });
        return () => tween.kill();
      });
    });

    // Marquee driven by time + scroll velocity
    $$("[data-marquee]").forEach((m) => {
      const tracks = $$(".marquee-track", m);
      const reverse = m.dataset.marquee === "reverse";
      const speed = parseFloat(m.dataset.speed || 30);
      const tweens = tracks.map((t) => gsap.fromTo(t, { xPercent: reverse ? -100 : 0 }, { xPercent: reverse ? 0 : -100, duration: speed, ease: "none", repeat: -1 }));
      ScrollTrigger.create({
        trigger: m, start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
          tweens.forEach((tw) => gsap.to(tw, { timeScale: 1 + v, duration: 0.3, overwrite: true }));
          gsap.delayedCall(0.3, () => tweens.forEach((tw) => gsap.to(tw, { timeScale: 1, duration: 1.2, overwrite: true })));
        },
      });
    });
  };

  /* ---------- Project list hover preview ---------- */
  const initHoverPreview = () => {
    const preview = $(".hover-preview");
    const rows = $$("[data-preview]");
    if (!preview || !rows.length || window.matchMedia("(hover: none)").matches) return;
    const img = $("img", preview);
    const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX - 120); yTo(e.clientY - 150); });
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        img.src = row.dataset.preview;
        gsap.to(preview, { autoAlpha: 1, scale: 1, rotate: -4, duration: 0.5, ease: "expo.out" });
      });
      row.addEventListener("mouseleave", () => gsap.to(preview, { autoAlpha: 0, scale: 0.85, rotate: 0, duration: 0.4 }));
    });
    gsap.set(preview, { scale: 0.85 });
  };

  /* ---------- Magnetic buttons ---------- */
  const initMagnetic = () => {
    if (window.matchMedia("(hover: none)").matches || reduceMotion) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  };

  /* ---------- Project filters ---------- */
  const initFilters = () => {
    const btns = $$("[data-filter]");
    const items = $$("[data-cat]");
    if (!btns.length) return;
    btns.forEach((btn) => btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      btns.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
      const show = items.filter((i) => f === "all" || i.dataset.cat.split(" ").includes(f));
      const hide = items.filter((i) => !show.includes(i));
      gsap.to(hide, { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: "power2.in", onComplete: () => hide.forEach((i) => (i.style.display = "none")) });
      gsap.delayedCall(hide.length ? 0.36 : 0, () => {
        show.forEach((i) => (i.style.display = ""));
        gsap.fromTo(show, { autoAlpha: 0, scale: 0.94, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.04, onComplete: () => ScrollTrigger.refresh() });
      });
      const count = $("[data-filter-count]");
      if (count) count.textContent = String(show.length).padStart(2, "0");
    }));
  };

  /* ---------- Lightbox ---------- */
  const initLightbox = () => {
    const triggers = $$("[data-lightbox]");
    if (!triggers.length) return;
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML = `
      <button class="absolute top-5 right-5 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-signal" data-lb-close aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <button class="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-signal sm:left-6" data-lb-prev aria-label="Previous image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button class="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-signal sm:right-6" data-lb-next aria-label="Next image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>
      <figure class="flex max-h-full w-full max-w-6xl flex-col items-center">
        <img class="max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl" alt="" data-lb-img>
        <figcaption class="mt-5 text-center text-sm text-white/70" data-lb-cap></figcaption>
      </figure>`;
    document.body.appendChild(box);
    const img = $("[data-lb-img]", box);
    const cap = $("[data-lb-cap]", box);
    let group = [], idx = 0, lastFocus = null;
    const show = (i) => {
      idx = (i + group.length) % group.length;
      const t = group[idx];
      gsap.fromTo(img, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.6 });
      img.src = t.getAttribute("href");
      img.alt = t.dataset.caption || "";
      cap.textContent = (t.dataset.caption || "") + (group.length > 1 ? `  ·  ${idx + 1} / ${group.length}` : "");
    };
    const open = (t) => {
      group = triggers.filter((x) => x.dataset.lightbox === t.dataset.lightbox);
      lastFocus = document.activeElement;
      box.classList.add("is-open");
      lenis && lenis.stop();
      show(group.indexOf(t));
      $("[data-lb-close]", box).focus();
      $$("[data-lb-prev],[data-lb-next]", box).forEach((b) => (b.style.display = group.length > 1 ? "" : "none"));
    };
    const close = () => { box.classList.remove("is-open"); lenis && lenis.start(); lastFocus && lastFocus.focus(); };
    triggers.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); open(t); }));
    $("[data-lb-close]", box).addEventListener("click", close);
    $("[data-lb-prev]", box).addEventListener("click", () => show(idx - 1));
    $("[data-lb-next]", box).addEventListener("click", () => show(idx + 1));
    box.addEventListener("click", (e) => e.target === box && close());
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  };

  /* ---------- Enquiry form (static: opens the visitor's email app) ---------- */
  const initForm = () => {
    const form = $("#enquiry-form");
    if (!form) return;
    const status = $("[data-form-status]", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const d = new FormData(form);
      const to = form.dataset.email;
      const subject = `Website enquiry — ${d.get("service") || "General"} — ${d.get("name")}`;
      const body = [
        `Name: ${d.get("name")}`,
        `Company: ${d.get("company") || "-"}`,
        `Email: ${d.get("email")}`,
        `Phone: ${d.get("phone") || "-"}`,
        `Service: ${d.get("service") || "-"}`,
        "",
        `${d.get("message")}`,
      ].join("\n");
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (status) {
        status.textContent = "Thank you — your email app should open with the enquiry ready to send.";
        gsap.fromTo(status, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 });
      }
    });
  };

  /* ---------- Footer "Keep in touch" quick enquiry ---------- */
  $$("[data-quick-enquiry]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", f);
    if (!input.checkValidity()) { input.reportValidity(); return; }
    const subject = "Call-back request from the BTGC website";
    const body = `Please contact me about a project.\n\nEmail: ${input.value}`;
    window.location.href = `mailto:${f.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const btn = $("button", f); btn.textContent = "Thank you ✓";
  }));

  /* ---------- Misc ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  $$("[data-to-top]").forEach((b) => b.addEventListener("click", () => scrollTo(0, { offset: 0 })));

  /* ---------- Go ---------- */
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    initScroll();
    initHoverPreview();
    initHeroSlider();
    initBanner();
    initMagnetic();
    initFilters();
    initLightbox();
    initForm();
    boot();
    // Images loading late can change layout -> refresh triggers
    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (location.hash && $(location.hash)) setTimeout(() => scrollTo(location.hash, { immediate: true }), 100);
  });
})();
