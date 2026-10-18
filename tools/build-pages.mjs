// Static page generator. Run: node tools/build-pages.mjs
// Outputs plain HTML files (header/footer markup duplicated identically per page) + placeholder SVG images.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './data.mjs';
import { layout, pageHero, projectCard, processStrip, icon, img, eyebrow, btn, esc } from './partials.mjs';
import { placeholder } from './placeholders.mjs';

const { site, services, projects, cases, phases } = D;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = [];

function write(rel, content) {
  const full = join(ROOT, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}
function page(file, opts) {
  pages.push(file);
  write(file, layout({ file, ...opts }));
}

const secHead = ({ kicker, title, intro = '', light = false, center = false }) => `<div class="sec-head${center ? ' sec-head--center' : ''}">
  ${eyebrow(kicker, light)}
  <h2 class="h-display h-display--lg" data-split>${title}</h2>
  ${intro ? `<p class="sec-intro" data-reveal>${intro}</p>` : ''}
</div>`;

const projBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
const svcBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const featured = projects.filter((p) => p.case);

/* =========================== PLACEHOLDER IMAGES =========================== */
function makeImages() {
  const out = [];
  const add = (file, label, kind, w, h) => out.push({ file, label, kind, w, h });
  add('hero-about-bright-theme-team', 'BTGC site team — Abu Dhabi', 'skyline');
  add('hero-services-mep-overview', 'MEP services overview', 'duct');
  add('hero-projects-portfolio', 'BTGC project portfolio', 'plan');
  add('hero-quality-hse-site', 'Quality, health & safety on site', 'panel');
  add('hero-certifications', 'Licences & certifications', 'plan');
  add('hero-contact-abu-dhabi', 'Abu Dhabi head office', 'skyline');
  add('about-company-story-fitout', 'BTGC fit-out works — interior', 'fitout');
  add('about-teaser-engineers-on-site', 'BTGC engineers reviewing drawings on site', 'plan');
  add('quality-completion-on-time', 'Programme monitoring & handover', 'plan');
  for (const s of services) add(s.img, `${s.title} — BTGC`, { mechanical: 'duct', electrical: 'panel', 'phe-fire': 'sprinkler', elv: 'panel', civil: 'plan', 'interior-fitout': 'fitout', maintenance: 'duct' }[s.slug]);
  for (const p of projects) add(`project-${p.slug}`, `${p.title} — ${p.loc}`, p.kind);
  for (const p of featured) {
    const kinds = ['plan', p.kind, 'skyline'];
    [1, 2, 3].forEach((n, i) => add(`project-${p.slug}-${n}`, `${p.short || p.title} — gallery ${n}`, kinds[i]));
  }
  for (const l of D.leaders) add(l.img, `${l.name} — ${l.role}`, 'portrait', 800, 1000);
  for (const c of D.certs) add(`cert-${c.slug}`, `${c.title} — certificate preview`, 'doc', 900, 1200);
  for (const i of out) write(`assets/img/${i.file}.svg`, placeholder({ w: 1600, h: 1000, ...i }));
  return out.length;
}


/* =========================== HOME HERO — pinned services slider =========================== */
// Markup only; behaviour lives in assets/js/hero-slider.js. Slide 1 is fully visible without JS.
// Visual design: photo, a short text block (title · one line · two buttons) at the left, bottom row of titles, progress line.
function heroSlider() {
  const S = D.heroSlides, N = S.length;
  const slides = S.map((s, i) => `
    <div class="sh-slide${i === 0 ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${N}" data-sh-slide data-title="${esc(s.title)}" data-link="${s.link}" data-webp="assets/img/hero/${s.img}.webp" data-avif="assets/img/hero/${s.img}.avif"${i === 0 ? '' : ' inert'}>
      <div class="sh-media" data-sh-media>
        <picture>
          <source type="image/avif" media="(min-width: 1281px)" srcset="assets/img/hero/${s.img}.avif">
          <source type="image/webp" srcset="assets/img/hero/${s.img}-1280.webp 1280w, assets/img/hero/${s.img}.webp 1920w" sizes="100vw">
          <img class="sh-img" data-sh-img src="assets/img/hero/${s.img}.jpg" srcset="assets/img/hero/${s.img}-1280.jpg 1280w, assets/img/hero/${s.img}.jpg 1920w" sizes="100vw" width="1920" height="1080" alt="${esc(s.title)} — BTGC" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </picture>
        <span class="sh-shade" aria-hidden="true"></span>
        <span class="sh-dim" data-sh-dim aria-hidden="true"></span>
      </div>
      <div class="sh-content" data-sh-content>
        <h2 class="sh-title" data-sh-title><span class="sh-title-in" data-sh-title-in>${esc(s.title)}</span></h2>
        <p class="sh-sub" data-sh-sub>${esc(s.line)}</p>
        <div class="sh-ctas" data-sh-ctas>
          <a href="${s.link}" class="btn btn-light btn-sm"><span class="btn-label">Explore Service</span>${icon('arrow-right', 'ic btn-ic')}</a>
          <a href="contact.html" class="btn btn-ghost-light btn-sm"><span class="btn-label">Get a Quote</span></a>
        </div>
      </div>
    </div>`).join('');
  const item = (s, i, set) => `<li class="sh-item${set === 1 ? '' : ' sh-item-copy'}"><a class="sh-item-link" href="${s.link}" data-sh-item="${i}" data-set="${set}"${set === 1 ? '' : ' aria-hidden="true" tabindex="-1"'}><span class="sh-item-title">${esc(s.title)}</span><span class="sh-item-meta">${esc(s.meta)}</span></a></li>`;
  const strip = [0, 1, 2].map((set) => S.map((s, i) => item(s, i, set)).join('')).join('');
  return `<section class="sh" id="hero" aria-roledescription="carousel" aria-label="Our services" data-sh>
  <h1 class="sr-only">BTGC Group — MEP, civil and interior fit-out contractor in Abu Dhabi and Dubai</h1>
  <button type="button" class="sh-skip" data-sh-skip>Skip to next section</button>
  <div class="sh-stage" data-sh-stage>${slides}
    <span class="sh-slash" data-sh-slash aria-hidden="true"></span>
    <span class="sh-curtain" data-sh-curtain aria-hidden="true"></span>
  </div>
  <nav class="sh-strip-wrap" aria-label="Services" data-sh-strip-wrap><ul class="sh-strip" data-sh-strip>${strip}</ul></nav>
  <div class="sh-progress" aria-hidden="true"><div class="sh-track" data-sh-track><i data-sh-progress></i></div></div>
  <button type="button" class="sh-pill" data-sh-pill aria-label="Scroll down to next section"><span>Scroll down</span>${icon('chevron-down', 'ic')}</button>
  <div class="sh-cursor" data-sh-cursor aria-hidden="true">
    <svg class="sh-cursor-ring" viewBox="0 0 100 100" focusable="false"><defs><path id="sh-circle" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#sh-circle" textLength="236" lengthAdjust="spacing">SCROLL DOWN • SCROLL DOWN • </textPath></text></svg>
    <span class="sh-cursor-arrow" data-sh-cursor-arrow>${icon('chevron-down', 'ic')}</span>
  </div>
  <p class="sr-only" aria-live="polite" data-sh-live></p>
</section>`;
}

/* =========================== HOME =========================== */
function home() {
  const p = '';
  const body = `
${heroSlider()}

<section class="sec sec-mist about-teaser" id="after-hero">
  <picture class="about-bg" aria-hidden="true"><source type="image/webp" srcset="assets/img/about-bg-layer.webp"><img src="assets/img/about-bg-layer.png" alt="" width="791" height="576" loading="lazy" decoding="async"></picture>
  <div class="container-x about-grid">
    <div class="about-photos" data-reveal>
      <picture class="ap ap--a"><source type="image/webp" srcset="assets/img/about-photo-a.webp"><img src="assets/img/about-photo-a.jpg" alt="Completed BTGC interior fit-out" width="920" height="720" loading="lazy" decoding="async"></picture>
      <picture class="ap ap--b"><source type="image/webp" srcset="assets/img/about-photo-b.webp"><img src="assets/img/about-photo-b.jpg" alt="Building envelope with engineered services by BTGC" width="840" height="1000" loading="lazy" decoding="async"></picture>
      <div class="about-badge"><strong><span data-count="${new Date().getFullYear() - 2018}">${new Date().getFullYear() - 2018}</span></strong><span>Years<br>Experience</span></div>
    </div>
    <div class="about-text">
      <p class="pill-tag" data-reveal><span aria-hidden="true"></span>Since 2018</p>
      <h2 class="h-display about-title" data-split>MEP And <em>Interiors,</em> <em>Our Dual</em> Expertise</h2>
      <p class="about-lead" data-reveal>Established in 2018, BTGC is a leading interior fit-out and contracting company in the UAE, recognised for innovative design, superior craftsmanship and turnkey project execution. Every project is delivered with precision, ensuring the highest standards of quality, safety, functionality and timely delivery.</p>
      <div class="about-feats" data-batch>
        <div><h3>MEP Engineering</h3><p>Mechanical, electrical, plumbing, fire protection and ELV — designed, installed, tested and commissioned by one team.</p></div>
        <div><h3>Interior Fit-out</h3><p>Design, joinery and turnkey fit-out for commercial, retail, hospitality, healthcare and government spaces.</p></div>
      </div>
      <a href="about.html" class="btn-pill" data-reveal><span>Discover More</span><i aria-hidden="true">${icon('arrow-up-right', 'ic ic-sm')}</i></a>
    </div>
  </div>
</section>

<section class="sec sec-light stats" aria-label="BTGC at a glance">
  <div class="container-x">
    <ul class="stat-grid" data-batch>
      ${D.stats.map((s) => `<li class="stat"><p class="stat-num">${s.prefix}<span data-count="${s.value}" ${s.from ? `data-from="${s.from}"` : ''}>${s.value}</span>${s.suffix}</p><h3 class="stat-title">${s.title}</h3><p class="stat-desc">${s.desc}</p></li>`).join('')}
    </ul>
    <div class="stats-visual" aria-hidden="true">
      <span class="stats-mark">BTGC</span>
      <picture data-reveal><source type="image/webp" srcset="assets/img/stats-floorplan.webp"><img class="stats-img" src="assets/img/stats-floorplan.png" alt="" width="1018" height="594" loading="lazy" decoding="async"></picture>
    </div>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top svc-sec" id="services">
  <div class="container-x">
    <div class="svc-head">
      <div class="sec-head">
        ${eyebrow('What we do')}
        <h2 class="h-display h-display--lg" data-split>Seven disciplines. <em>One accountable team.</em></h2>
      </div>
      <div class="svc-head-side" data-reveal>
        <p>From heat-load calculations to final handover, we cover every engineering domain a fit-out or refurbishment needs — under one contract and one point of contact.</p>
        <a class="link-arrow" href="services.html">View all services ${icon('arrow-right', 'ic ic-sm')}</a>
      </div>
    </div>
    <ul class="svc-grid" data-batch>
      ${services.map((s, i) => `<li><a class="svc-card" href="services/${s.slug}.html">
        <span class="svc-media"><picture><source type="image/webp" srcset="assets/img/services/${s.slug}.webp"><img src="assets/img/services/${s.slug}.jpg" alt="" width="640" height="420" loading="lazy" decoding="async"></picture><span class="svc-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="svc-icon" aria-hidden="true">${icon(s.icon)}</span></span>
        <span class="svc-body">
          <h3>${s.title}</h3>
          <p>${s.short}</p>
          <ul class="svc-list" aria-label="Key capabilities">${s.caps.slice(0, 3).map((c) => `<li>${c}</li>`).join('')}${s.caps.length > 3 ? `<li class="svc-more">+${s.caps.length - 3} more capabilities</li>` : ''}</ul>
          <span class="svc-go">Explore<i aria-hidden="true">${icon('arrow-up-right', 'ic ic-sm')}</i></span>
        </span>
      </a></li>`).join('')}
      <li><div class="svc-card svc-card--cta">
        <span class="svc-cta-slashes" aria-hidden="true"><i></i><i></i></span>
        <h3>Not sure which service you need?</h3>
        <p>Tell us about your site and scope. A senior engineer will recommend the right approach and respond within one business day.</p>
        ${btn('contact.html', 'Request a Quote', 'light')}
        <a class="svc-cta-phone" href="${site.phoneHref}">${icon('phone', 'ic ic-sm')}${site.phone}</a>
      </div></li>
    </ul>
  </div>
</section>

<section class="hscroll sec-navy bp-grid bp-grid--dark" id="featured" data-hscroll>
  <div class="hscroll-glow" aria-hidden="true"></div>
  <div class="hscroll-pin">
    <div class="container-x hscroll-head">
      <div>
        ${eyebrow('Featured projects', true)}
        <h2 class="h-display h-display--lg" data-split>Delivered in live buildings. <em>On programme.</em></h2>
      </div>
      <div class="hscroll-meta">
        <p class="hs-count" aria-hidden="true"><b data-hscroll-count>01</b><span>/ ${String(featured.length).padStart(2, '0')}</span></p>
        <a class="link-arrow link-arrow--light" href="projects.html">All projects ${icon('arrow-right', 'ic ic-sm')}</a>
      </div>
    </div>
    <div class="hscroll-viewport">
      <ul class="hscroll-track" data-hscroll-track>
        ${featured.map((f, i) => `<li class="hs-card" data-hs-card><a href="projects/${f.slug}.html" data-cursor="View">
          <picture class="hs-photo"><source type="image/webp" srcset="assets/img/projects/${f.slug}.webp"><img src="assets/img/projects/${f.slug}.jpg" alt="${esc(f.short)} — ${esc(f.loc)}" width="760" height="960" decoding="async"></picture>
          <span class="hs-shade" aria-hidden="true"></span>
          <span class="hs-chip">${esc(f.scope)}</span>
          <span class="hs-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="hs-info"><h3>${esc(f.short)}</h3><span class="hs-meta">${icon('map-pin', 'ic ic-xs')}${esc(f.loc)}</span><span class="hs-meta">${icon('clock', 'ic ic-xs')}${esc(f.dur)}</span><span class="hs-go">View case study<i aria-hidden="true">${icon('arrow-up-right', 'ic ic-sm')}</i></span></span>
        </a></li>`).join('')}
        <li class="hs-card hs-card--end"><a href="projects.html">
          <span class="hs-end-num">${projects.length}</span>
          <span class="hs-end-text"><strong>projects delivered</strong> across Abu Dhabi — from MEP retrofits and fire &amp; life-safety upgrades to complete fit-outs.</span>
          <span class="btn btn-light"><span class="btn-label">Browse all projects</span>${icon('arrow-right', 'ic btn-ic')}</span>
        </a></li>
      </ul>
    </div>
    <div class="hscroll-bar" aria-hidden="true"><i data-hscroll-progress></i></div>
  </div>
</section>

<section class="sec sec-light why">
  <div class="container-x why-grid">
    <div class="why-intro">
      ${secHead({ kicker: 'Why BTGC', title: 'A contractor that <em>reduces</em> your risk.', intro: 'Technical depth, scalable manpower and a dedicated point of contact — so you manage less and get more certainty on cost, quality and time.' })}
    </div>
    <ol class="why-list" data-batch>
      ${D.why.map((w, i) => `<li><span class="why-n">${String(i + 1).padStart(2, '0')}</span><span class="why-ic">${icon(w.i)}</span><span>${w.t}</span></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top proc-sec">
  <div class="container-x">
    <div class="proc-head">
      <div class="sec-head">
        ${eyebrow('Our approach')}
        <h2 class="h-display h-display--lg" data-split>Five phases. <em>Zero guesswork.</em></h2>
      </div>
      <div class="proc-head-side" data-reveal>
        <p>A structured work-breakdown from initiation to handover keeps scope, cost and quality under control at every stage.</p>
        <a class="link-arrow" href="about.html#approach">Full work breakdown ${icon('arrow-right', 'ic ic-sm')}</a>
      </div>
    </div>
    <div class="phases" data-phases data-reveal>
      <div class="phase-tabs-wrap">
        <div class="phase-tabs" role="tablist" aria-label="Project phases">
          <div class="phase-line" aria-hidden="true"><i data-pfill></i></div>
          ${phases.map((ph, i) => `<button class="phase-tab" type="button" role="tab" id="pt-${ph.n}" aria-controls="ph-${ph.n}" aria-selected="${i === 0}" data-ptab><span class="pt-n">${String(ph.n).padStart(2, '0')}</span><span class="pt-t">${ph.title}</span></button>`).join('')}
        </div>
      </div>
      <div class="phase-stage">
        ${phases.map((ph) => `<article class="phase-panel" role="tabpanel" id="ph-${ph.n}" aria-labelledby="pt-${ph.n}" data-ppanel>
          <div class="phase-media"><picture><source type="image/webp" srcset="assets/img/phases/p${ph.n}.webp"><img src="assets/img/phases/p${ph.n}.jpg" alt="" width="900" height="980" loading="lazy" decoding="async"></picture></div>
          <div class="phase-body">
            <span class="phase-big" aria-hidden="true">${String(ph.n).padStart(2, '0')}</span>
            <p class="phase-k">Phase ${ph.n} of ${phases.length}</p>
            <h3>${ph.title}</h3>
            <p class="phase-lead">${ph.lead}</p>
            <ul class="phase-tasks">${ph.tasks.map((t) => `<li>${icon('check', 'ic ic-sm')}<span>${t}</span></li>`).join('')}</ul>
          </div>
        </article>`).join('')}
        <div class="phase-nav" aria-label="Phase navigation">
          <button type="button" class="phase-arrow" data-pprev aria-label="Previous phase">${icon('arrow-left', 'ic')}</button>
          <p aria-hidden="true"><b data-pcur>01</b> / ${String(phases.length).padStart(2, '0')}</p>
          <button type="button" class="phase-arrow" data-pnext aria-label="Next phase">${icon('arrow-right', 'ic')}</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;

  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': ['GeneralContractor', 'LocalBusiness'], '@id': `${site.url}/#organization`, name: site.legal, alternateName: 'BTGC Group', url: site.url, telephone: site.phone, email: site.email,
    image: `${site.url}/assets/img/hero-abu-dhabi-skyline.jpg`, logo: `${site.url}/assets/img/logo-color.webp`, foundingDate: '2018', numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 60 },
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Abu Dhabi' }, { '@type': 'AdministrativeArea', name: 'Dubai' }],
    address: { '@type': 'PostalAddress', streetAddress: 'Office #203, 2nd Floor, FAB Properties, Tower A, behind City Season Hotel, Najda Street', addressLocality: 'Abu Dhabi', addressCountry: 'AE', postOfficeBoxNumber: '114176' },
    // Dubai branch: add streetAddress once confirmed
    department: { '@type': 'GeneralContractor', name: `${site.legal} — Dubai Branch`, telephone: site.phone, address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' } },
  })}</script>\n`;
  page('index.html', {
    title: 'BTGC Group — MEP, Civil & Interior Fit-out Contractor, Abu Dhabi & Dubai',
    desc: 'BTGC Group (Bright Theme General Contracting SP LLC): MEP, civil and interior fit-out contracting in Abu Dhabi and Dubai since 2018. ISO 9001, 14001 and 45001 certified.',
    body, jsonld,
    preload: `<link rel="preload" as="image" type="image/avif" media="(min-width: 1281px)" href="assets/img/hero/${D.heroSlides[0].img}.avif" fetchpriority="high">
<link rel="preload" as="image" type="image/webp" media="(max-width: 1280px)" href="assets/img/hero/${D.heroSlides[0].img}-1280.webp" imagesrcset="assets/img/hero/${D.heroSlides[0].img}-1280.webp 1280w, assets/img/hero/${D.heroSlides[0].img}.webp 1920w" imagesizes="100vw" fetchpriority="high">
`,
    extraScripts: '<script defer src="assets/js/hero-slider.js"></script>',
  });
}

/* =========================== ABOUT =========================== */
function about() {
  const p = '';
  const orgChart = `<div class="org" data-org>
  <div class="org-top">
    <div class="org-node org-node--md"><small>Managing Director</small></div>
    <span class="org-vline" aria-hidden="true"></span>
    <div class="org-node org-node--ceo"><small>Chief Executive Officer</small></div>
    <span class="org-vline" aria-hidden="true"></span>
  </div>
  <div class="org-depts" data-batch>
    ${D.org.map((d) => `<details class="org-dept" data-org-dept open><summary><span>${d.dept}<small> Dept.</small></span>${icon('chevron-down', 'ic ic-sm org-chev')}</summary><ul>${d.roles.map((r) => `<li>${r}</li>`).join('')}</ul></details>`).join('')}
  </div>
</div>`;
  const wbs = `<section class="wbs sec-navy bp-grid bp-grid--dark" id="approach" data-wbs>
  <div class="container-x">
    ${secHead({ kicker: 'Our approach · Work breakdown structure', title: 'From initiation to handover — <em>every phase accounted for.</em>', light: true })}
    <div class="wbs-stage">
      <svg class="wbs-line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="wbs-base" d="M0 10H1000"/><path class="wbs-draw" data-wbs-draw d="M0 10H1000"/></svg>
      <ol class="wbs-steps">${phases.map((ph) => `<li data-wbs-step><span class="wbs-dot"></span><span class="wbs-n">0${ph.n}</span><span class="wbs-t">${ph.title}</span></li>`).join('')}</ol>
      <div class="wbs-panels">
        ${phases.map((ph) => `<article class="wbs-panel" data-wbs-panel>
          <h3><span>0${ph.n}</span>${ph.title}</h3>
          <ul>${ph.tasks.map((t) => `<li>${icon('check', 'ic ic-sm')}${t}</li>`).join('')}</ul>
        </article>`).join('')}
      </div>
    </div>
  </div>
</section>`;
  const body = `${pageHero({ p, kicker: 'About us', title: 'Built on precision.<br>Driven by people.', sub: 'A UAE contractor with MEP depth, fit-out craft and the accountability of one team from kick-off to handover.', imgFile: 'hero-about-bright-theme-team', imgAlt: 'BTGC site team at work in Abu Dhabi', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'About' }] })}

<section class="sec sec-light">
  <div class="container-x split split--rev">
    <div class="split-text">
      ${eyebrow('Our story')}
      <h2 class="h-display h-display--lg" data-split>Established 2018. <em>Trusted by the UAE’s leading names.</em></h2>
      <p data-reveal>BTGC is a leading interior fit-out and contracting company in the United Arab Emirates, recognised for exceptional interior environments delivered through innovative design, superior craftsmanship and turnkey project execution.</p>
      <p data-reveal>We provide design &amp; build, fit-out contracting, bespoke joinery, renovation and general maintenance across commercial, corporate, retail, hospitality, healthcare and government sectors — every project executed with precision, safety and timely delivery.</p>
      <p data-reveal>Over the years we have earned the trust of renowned organisations including the Ministry of Presidential Affairs, ICT, Aldar, Brand Folio and Dalma Mall. As we grow, we remain dedicated to setting new benchmarks in the UAE’s fit-out industry with tailored, value-driven solutions.</p>
    </div>
    <div class="split-media"><div class="slash-mask slash-mask--lg slash-mask--r" data-mirror data-reveal="clip">${img(p, 'about-company-story-fitout', 'Completed BTGC interior fit-out', { w: 1200, h: 1000, cls: 'cover', attrs: 'data-parallax' })}</div></div>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top">
  <div class="container-x">
    <div class="mission" data-reveal>
      ${eyebrow('Mission')}
      <p class="mission-text">To transform our clients’ visions into inspiring, functional spaces — delivering tailored, value-driven solutions that exceed expectations and build enduring relationships.</p>
    </div>
    ${secHead({ kicker: 'Values', title: 'Four principles. <em>No exceptions.</em>' })}
    <ul class="value-grid" data-batch>${D.values.map((v, i) => `<li class="value-card"><span class="value-n">0${i + 1}</span>${icon(v.i, 'ic ic-lg')}<h3>${v.t}</h3><p>${v.d}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="sec sec-light" id="leadership">
  <div class="container-x">
    ${secHead({ kicker: 'Leadership', title: 'Strong ownership. <em>Hands-on engineering leadership.</em>' })}
    <div class="leader-grid" data-batch>
      ${D.leaders.map((l) => `<article class="leader-card">
        <div class="leader-photo slash-mask">${img(p, l.img, `Portrait placeholder — ${l.name}`, { w: 800, h: 1000, cls: 'cover' })}</div>
        <div class="leader-body"><h3>${l.name}</h3><p class="leader-role">${l.role}</p><p>${l.bio}</p></div>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec-navy bp-grid bp-grid--dark cut-top" id="group">
  <div class="container-x">
    ${secHead({ kicker: 'Group companies & resources', title: 'Two emirates. <em>One integrated group.</em>', light: true, intro: 'More than 60 staff, a warehouse/store and labour camps in both Abu Dhabi and Dubai keep resources close to every site.' })}
    <div class="group-grid" data-batch>
      ${D.resources.map((r) => `<div class="group-card"><h3>${r.city}</h3><ol>${r.items.map((i) => `<li>${i}</li>`).join('')}</ol></div>`).join('')}
      <div class="group-card group-card--stat"><strong><span data-count="60">60</span>+</strong><span>staff across Abu Dhabi &amp; Dubai</span></div>
    </div>
  </div>
</section>

<section class="sec sec-light">
  <div class="container-x strengths">
    <div>
      ${secHead({ kicker: 'Strengths & capability', title: 'Local depth. <em>Group stability.</em>' })}
      <ul class="capacity" data-batch>
        <li><strong>AED 30M</strong><span>total projects in hand (approx.)</span></li>
        <li><strong>AED 18M</strong><span>major projects in hand for 2024/2025</span></li>
        <li><strong>Ready</strong><span>adequate resource and team for additional work</span></li>
      </ul>
    </div>
    <ul class="check-list check-list--lg" data-batch>${D.strengths.map((s) => `<li>${icon('check', 'ic')}<span>${s}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top" id="organisation">
  <div class="container-x">
    ${secHead({ kicker: 'Organisation structure', title: 'Clear lines of <em>responsibility.</em>', intro: 'Six departments under the CEO give every project a dedicated technical, quality, commercial and logistics backbone.' })}
    ${orgChart}
  </div>
</section>

${wbs}`;
  page('about.html', { title: 'About BTGC Group — Contractor in Abu Dhabi & Dubai', desc: 'Established 2018, BTGC Group delivers MEP, civil and interior fit-out projects across Abu Dhabi and Dubai. Meet our leadership, group companies and approach.', body, active: 'about' });
}

/* =========================== SERVICES =========================== */
function servicesOverview() {
  const p = '';
  const blocks = services.map((s, i) => `<article class="svc-block${i % 2 ? ' svc-block--rev' : ''}" id="${s.slug}">
    <div class="svc-media"><div class="slash-mask slash-mask--lg${i % 2 ? ' slash-mask--r' : ''}" ${i % 2 ? 'data-mirror ' : ''}data-reveal="clip">${img(p, s.img, `${s.title} works by BTGC`, { w: 1200, h: 900, cls: 'cover', attrs: 'data-parallax' })}</div></div>
    <div class="svc-text">
      <span class="svc-n">${String(i + 1).padStart(2, '0')}</span>
      <h2 class="h-display h-display--md" data-split>${s.title}</h2>
      <p data-reveal>${s.overview}</p>
      <ul class="cap-chips" data-reveal>${s.caps.map((c) => `<li>${icon('check', 'ic ic-xs')}${c}</li>`).join('')}</ul>
      <div data-reveal><a class="link-arrow" href="services/${s.slug}.html">Learn more about ${s.title} ${icon('arrow-right', 'ic ic-sm')}</a></div>
    </div>
  </article>`).join('');
  const body = `${pageHero({ p, kicker: 'Services', title: 'Every discipline.<br>One accountable team.', sub: 'MEP, civil and interior fit-out — designed, built, tested and maintained by BTGC.', imgFile: 'hero-services-mep-overview', imgAlt: 'HVAC ductwork and MEP services overview', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Services' }] })}
<section class="sec sec-light">
  <div class="container-x services-intro">
    ${secHead({ kicker: 'Overview', title: 'Seven service lines, <em>coordinated as one.</em>', intro: 'Because we carry mechanical, electrical, plumbing, fire, ELV, civil and interior capability in-house, there are fewer hand-offs, fewer clashes and a single point of accountability for programme, cost and quality.' })}
    <nav class="svc-jump" aria-label="Jump to service" data-reveal><ul>${services.map((s) => `<li><a href="#${s.slug}">${icon(s.icon, 'ic ic-sm')}${s.title}</a></li>`).join('')}</ul></nav>
  </div>
  <div class="container-x svc-blocks">${blocks}</div>
</section>`;
  page('services.html', { title: 'Services — MEP, Civil & Interior Fit-out', desc: 'Mechanical (HVAC), electrical, PHE & fire protection, ELV / low current, civil, interior fit-out and maintenance services across Abu Dhabi and Dubai.', body, active: 'services' });
}

function serviceDetail() {
  const p = '../';
  services.forEach((s, idx) => {
    const prev = services[(idx + services.length - 1) % services.length];
    const next = services[(idx + 1) % services.length];
    const rel = s.related.map((slug) => projBySlug[slug]).filter(Boolean);
    const body = `${pageHero({ p, kicker: 'Services', title: s.title, sub: s.short, imgFile: s.img, imgAlt: `${s.title} works by BTGC`, crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Services', href: 'services.html' }, { label: s.title }] })}

<section class="sec sec-light">
  <div class="container-x detail-grid">
    <div class="detail-main">
      ${eyebrow('Overview')}
      <h2 class="h-display h-display--md" data-split>${s.title}, <em>engineered end to end.</em></h2>
      <p class="lead" data-reveal>${s.overview}</p>
      <div data-reveal>${btn(p + 'contact.html', 'Discuss your project', 'primary')}</div>
    </div>
    <aside class="detail-side" data-reveal>
      <span class="sc-icon">${icon(s.icon, 'ic ic-lg')}</span>
      <h3>Quick facts</h3>
      <dl><div><dt>Coverage</dt><dd>Abu Dhabi &amp; Dubai</dd></div><div><dt>Delivery</dt><dd>Design &amp; build, installation, commissioning</dd></div><div><dt>Standards</dt><dd>ISO 9001 · 14001 · 45001</dd></div></dl>
    </aside>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top">
  <div class="container-x">
    ${secHead({ kicker: 'Capabilities', title: 'What we deliver in <em>' + s.title + '.</em>' })}
    <ol class="cap-grid" data-batch>${s.caps.map((c, i) => `<li><span class="cap-n">${String(i + 1).padStart(2, '0')}</span><h3>${c}</h3></li>`).join('')}</ol>
  </div>
</section>

<section class="sec sec-light">
  <div class="container-x">
    ${secHead({ kicker: 'Related projects', title: 'See it <em>delivered.</em>' })}
    <div class="projects-grid projects-grid--4" data-batch>${rel.map((r) => projectCard(p, r, { link: !!r.case })).join('')}</div>
    <div class="sec-foot" data-reveal><a class="link-arrow" href="${p}projects.html">All projects ${icon('arrow-right', 'ic ic-sm')}</a></div>
  </div>
</section>

<section class="sec sec-navy bp-grid bp-grid--dark cut-top process-snippet">
  <div class="container-x">
    ${secHead({ kicker: 'How we deliver', title: 'The same five-phase discipline on <em>every job.</em>', light: true })}
    ${processStrip(p, phases)}
    <div class="sec-foot" data-reveal><a class="link-arrow link-arrow--light" href="${p}about.html#approach">Full work breakdown structure ${icon('arrow-right', 'ic ic-sm')}</a></div>
  </div>
</section>

<section class="sec sec-light pager-sec">
  <div class="container-x">
    <nav class="pager" aria-label="Other services">
      <a href="${prev.slug}.html" class="pager-link">${icon('arrow-left')}<span><small>Previous</small>${prev.title}</span></a>
      <a href="${next.slug}.html" class="pager-link pager-link--next"><span><small>Next</small>${next.title}</span>${icon('arrow-right')}</a>
    </nav>
  </div>
</section>`;
    page(`services/${s.slug}.html`, { depth: 1, title: `${s.title} Contractor in Abu Dhabi & Dubai`, desc: `${s.overview.slice(0, 150).replace(/\s\S*$/, '')}…`, body, active: 'services' });
  });
}

/* =========================== PROJECTS =========================== */
function projectsPage() {
  const p = '';
  const body = `${pageHero({ p, kicker: 'Projects', title: 'Proof, not promises.', sub: 'Twenty delivered projects across malls, towers, schools and villas in Abu Dhabi.', imgFile: 'hero-projects-portfolio', imgAlt: 'BTGC project portfolio — plans and completed works', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Projects' }] })}
<section class="sec sec-light">
  <div class="container-x">
    <h2 class="sr-only">Project list</h2>
    <div class="filter-bar" role="group" aria-label="Filter projects by scope" data-filter-bar>
      ${D.projectFilters.map((f, i) => `<button type="button" class="filter-btn" data-filter="${f.key}" aria-pressed="${i === 0}">${f.label}</button>`).join('')}
      <p class="filter-count" aria-live="polite"><span data-filter-count>${projects.length}</span> projects</p>
    </div>
    <div class="projects-grid" data-grid data-batch>
      ${projects.map((pr) => projectCard(p, pr, { link: !!pr.case })).join('')}
    </div>
  </div>
</section>`;
  page('projects.html', { title: 'Projects — MEP, Fit-out & Renovation in Abu Dhabi', desc: 'Selected BTGC projects: ADNOC Tower 3, WTC Mall, Yas Mall, Nation Towers Mall, Dalma Mall and more — MEP, fire & life safety, fit-out and renovation.', body, active: 'projects' });
}

function caseStudies() {
  const p = '../';
  featured.forEach((pr, idx) => {
    const c = cases[pr.slug];
    const prev = featured[(idx + featured.length - 1) % featured.length];
    const next = featured[(idx + 1) % featured.length];
    const gallery = [1, 2, 3].map((n) => `<li><button type="button" class="gallery-item slash-mask" data-lightbox data-src="${p}assets/img/project-${pr.slug}-${n}.svg" data-alt="${esc(pr.short)} — gallery image ${n}" aria-label="Open gallery image ${n}">${img(p, `project-${pr.slug}-${n}`, `${pr.short} — gallery image ${n}`, { w: 1200, h: 800, cls: 'cover' })}<span class="gallery-zoom">${icon('plus')}</span></button></li>`).join('');
    const body = `${pageHero({ p, kicker: pr.scope, title: pr.title, sub: `${pr.loc} · ${pr.dur}`, imgFile: `project-${pr.slug}`, imgAlt: `${pr.title} — ${pr.loc}`, tall: true, crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Projects', href: 'projects.html' }, { label: pr.short }] })}
<section class="sec sec-light">
  <div class="container-x case-grid">
    <aside class="case-meta" data-reveal>
      <h2>Project details</h2>
      <dl>
        <div><dt>Client / location</dt><dd>${esc(c.client)}<br><span>${esc(pr.loc)}</span></dd></div>
        <div><dt>Duration</dt><dd>${esc(pr.dur)}</dd></div>
        <div><dt>Scope</dt><dd>${esc(pr.scope)}</dd></div>
        <div><dt>Delivery model</dt><dd>${esc(c.model)}</dd></div>
        <div><dt>Services</dt><dd><ul>${c.services.map((s) => `<li><a href="${p}services/${s}.html">${svcBySlug[s].title}</a></li>`).join('')}</ul></dd></div>
      </dl>
      ${btn(p + 'contact.html', 'Start a similar project', 'primary')}
    </aside>
    <div class="case-main">
      <p class="lead" data-reveal>${c.lead}</p>
      <ol class="narrative">
        <li data-reveal><span class="nar-n">01</span><div><h2>The challenge</h2><p>${c.challenge}</p></div></li>
        <li data-reveal><span class="nar-n">02</span><div><h2>Our solution</h2><p>${c.solution}</p></div></li>
        <li data-reveal><span class="nar-n">03</span><div><h2>The result</h2><p>${c.result}</p></div></li>
      </ol>
    </div>
  </div>
</section>
<section class="sec sec-mist bp-grid cut-top">
  <div class="container-x">
    ${secHead({ kicker: 'Gallery', title: 'On site <em>and handed over.</em>' })}
    <ul class="gallery" data-batch>${gallery}</ul>
  </div>
</section>
<section class="sec sec-light pager-sec">
  <div class="container-x">
    <nav class="pager" aria-label="More case studies">
      <a href="${prev.slug}.html" class="pager-link">${icon('arrow-left')}<span><small>Previous project</small>${esc(prev.short)}</span></a>
      <a href="${next.slug}.html" class="pager-link pager-link--next"><span><small>Next project</small>${esc(next.short)}</span>${icon('arrow-right')}</a>
    </nav>
  </div>
</section>`;
    page(`projects/${pr.slug}.html`, { depth: 1, title: `${pr.title} — ${pr.loc}`, desc: `${c.lead} ${pr.loc}, ${pr.dur}.`, body, active: 'projects' });
  });
}

/* =========================== QUALITY & HSE =========================== */
function quality() {
  const p = '';
  const body = `${pageHero({ p, kicker: 'Quality, Health & Safety', title: 'Safe. Certified.<br>Delivered on time.', sub: 'A well-established in-house Quality Management System and a 26-point HSE framework on every project.', imgFile: 'hero-quality-hse-site', imgAlt: 'Quality and safety inspection on a BTGC site', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Quality & HSE' }] })}

<section class="sec sec-light" id="quality">
  <div class="container-x policy-grid">
    <div>
      ${secHead({ kicker: 'Quality policy', title: 'Quality at <em>every stage.</em>' })}
      <ol class="policy-list" data-batch>${D.qualityPolicy.map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><p>${t}</p></li>`).join('')}</ol>
    </div>
    <div class="policy-side" data-reveal>
      <h3>Quality management</h3>
      <ul class="check-list" >${D.qualityMgmt.map((t) => `<li>${icon('check', 'ic')}<span>${t}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec sec-mist bp-grid cut-top" id="hse">
  <div class="container-x">
    ${secHead({ kicker: 'Health & safety policy', title: 'A special focus on <em>Health &amp; Safety.</em>', intro: 'M/S. BTGC’s HSE policy is governed by 26 factors, grouped here into four areas.' })}
    ${D.hse.map((g, gi) => `<div class="hse-group">
      <h3 class="hse-cat"><span>0${gi + 1}</span>${g.cat}<em>${g.items.length}</em></h3>
      <ul class="hse-grid" data-batch>${g.items.map(([t, ic]) => `<li>${icon(ic, 'ic ic-lg')}<span>${t}</span></li>`).join('')}</ul>
    </div>`).join('')}
  </div>
</section>

<section class="sec sec-navy bp-grid bp-grid--dark cut-top" id="on-time">
  <div class="container-x split">
    <div class="split-text">
      ${eyebrow('Completion on time', true)}
      <h2 class="h-display h-display--lg" data-split>On-time delivery is <em>a core strength.</em></h2>
      <p data-reveal>We are strongly committed to completing every project within the agreed contractual timelines while maintaining the highest standards of quality, safety and efficiency. Through effective planning, proactive project management, efficient resource allocation and continuous monitoring of progress, we consistently achieve project milestones and minimise delays.</p>
      <p data-reveal>Our experienced team works collaboratively with clients, consultants and stakeholders to promptly address challenges and ensure smooth execution — earning us the trust of our clients as a reliable and dependable contracting partner.</p>
    </div>
    <div class="split-media"><div class="slash-mask slash-mask--lg" data-reveal="clip">${img(p, 'quality-completion-on-time', 'Programme monitoring and project handover', { w: 1200, h: 1000, cls: 'cover', attrs: 'data-parallax' })}</div></div>
  </div>
</section>

<section class="sec sec-light">
  <div class="container-x">
    ${secHead({ kicker: 'Management systems', title: 'Independently <em>certified.</em>' })}
    <ul class="iso-badges" data-batch>
      ${[['ISO 9001:2015', 'Quality Management', 'award'], ['ISO 14001:2015', 'Environmental Management', 'leaf'], ['ISO 45001:2018', 'Occupational Health & Safety', 'shield-check']].map(([t, s, i]) => `<li>${icon(i, 'ic ic-xl')}<strong>${t}</strong><span>${s}</span><small>GIQ-CIS · valid to May 2029</small></li>`).join('')}
    </ul>
    <p class="sec-foot" data-reveal><a class="link-arrow" href="certifications.html">View all licences &amp; certificates ${icon('arrow-right', 'ic ic-sm')}</a></p>
  </div>
</section>`;
  page('quality-hse.html', { title: 'Quality, Health & Safety — ISO Certified Contractor', desc: 'BTGC’s quality policy, quality management, 26-point HSE framework and on-time delivery commitment. ISO 9001:2015, 14001:2015 and 45001:2018 certified.', body, active: 'quality' });
}

/* =========================== CERTIFICATIONS =========================== */
function certifications() {
  const p = '';
  const group = (key, kicker, title) => `<div class="cert-group">
    <h2 class="cert-group-h">${eyebrow(kicker)}<span class="sr-only">${title}</span></h2>
    <ul class="cert-grid" data-batch>${D.certs.filter((c) => c.group === key).map((c) => `<li><button type="button" class="cert-card" data-cert data-title="${esc(c.title)}" data-sub="${esc(c.sub)} · ${esc(c.meta)}" data-img="assets/img/cert-${c.slug}.svg" data-pdf="assets/docs/${c.slug}.pdf" aria-haspopup="dialog">
      <span class="cert-ic">${icon(c.icon, 'ic ic-lg')}</span><strong>${c.title}</strong><span class="cert-sub">${c.sub}</span><span class="cert-meta">${c.meta}</span><span class="cert-open">Preview ${icon('arrow-up-right', 'ic ic-xs')}</span></button></li>`).join('')}</ul>
  </div>`;
  const body = `${pageHero({ p, kicker: 'Licences & certifications', title: 'Licensed, classified,<br>certified.', sub: 'Management-system certification, government classification and trade licences in Abu Dhabi and Dubai.', imgFile: 'hero-certifications', imgAlt: 'BTGC licences and certificates', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Certifications' }] })}
<section class="sec sec-light">
  <div class="container-x">
    ${group('iso', 'ISO management systems', 'ISO management systems')}
    ${group('gov', 'Government classification & ICV', 'Government classification and ICV')}
    ${group('lic', 'Trade licences', 'Trade licences')}
  </div>
</section>
<dialog class="modal cert-modal" data-cert-modal aria-labelledby="cert-modal-title">
  <div class="modal-panel">
    <button type="button" class="modal-close" data-modal-close aria-label="Close preview">${icon('x')}</button>
    <div class="modal-media"><img alt="" src="" width="900" height="1200" data-cert-img></div>
    <div class="modal-body"><h2 id="cert-modal-title" data-cert-title></h2><p data-cert-sub></p>
      <!-- Place the real PDFs at assets/docs/<slug>.pdf (e.g. assets/docs/iso-9001-2015.pdf) -->
      <a class="btn btn-primary" data-cert-pdf href="#" download><span class="btn-label">Download PDF</span>${icon('download', 'ic btn-ic')}</a></div>
  </div>
</dialog>`;
  page('certifications.html', { title: 'Licences & Certifications — ISO, ICV, DMT Classification', desc: 'ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, ICV certificate (26.23%), Abu Dhabi DMT contractor classification and trade licences.', body, active: 'certs' });
}

/* =========================== CONTACT =========================== */
function contact() {
  const p = '';
  const field = (id, label, type = 'text', { req = false, ac = '', ph = '' } = {}) => `<div class="field" data-field>
    <label for="${id}">${label}${req ? '<span class="req" aria-hidden="true"> *</span>' : ''}</label>
    <input id="${id}" name="${id}" type="${type}" ${req ? 'required aria-required="true"' : ''} ${ac ? `autocomplete="${ac}"` : ''} ${ph ? `placeholder="${ph}"` : ''} aria-describedby="${id}-err">
    <p class="field-error" id="${id}-err" role="alert"></p></div>`;
  const select = (id, label, opts, req = false) => `<div class="field" data-field>
    <label for="${id}">${label}${req ? '<span class="req" aria-hidden="true"> *</span>' : ''}</label>
    <select id="${id}" name="${id}" ${req ? 'required aria-required="true"' : ''} aria-describedby="${id}-err"><option value="">Select…</option>${opts.map((o) => `<option>${o}</option>`).join('')}</select>
    <p class="field-error" id="${id}-err" role="alert"></p></div>`;
  const body = `${pageHero({ p, kicker: 'Contact · Request a quote', title: 'Let’s build it right.', sub: 'Tell us about your project. A senior engineer will respond with a clear next step.', imgFile: 'hero-contact-abu-dhabi', imgAlt: 'Abu Dhabi skyline', crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Contact' }] })}
<section class="sec sec-light">
  <div class="container-x contact-grid">
    <div class="contact-form-wrap">
      <h2 class="h-display h-display--md" data-split>Request a quote</h2>
      <p class="muted" data-reveal>Fields marked * are required. We typically reply within one business day.</p>
      <!-- FORM ENDPOINT: replace YOUR_FORM_ID with your Formspree (or similar) form id. -->
      <form class="quote-form" data-quote-form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" enctype="multipart/form-data" novalidate>
        <div class="form-grid">
          ${field('name', 'Full name', 'text', { req: true, ac: 'name' })}
          ${field('company', 'Company', 'text', { ac: 'organization' })}
          ${field('email', 'Email', 'email', { req: true, ac: 'email' })}
          ${field('phone', 'Phone', 'tel', { ac: 'tel', ph: '+971 …' })}
          ${select('service', 'Service required', [...services.map((s) => s.title), 'Multiple / not sure yet'], true)}
          ${select('location', 'Project location', ['Abu Dhabi', 'Dubai', 'Other'], true)}
          ${select('budget', 'Budget range', ['Under AED 100,000', 'AED 100,000 – 500,000', 'AED 500,000 – 1M', 'AED 1M – 5M', 'Above AED 5M', 'Not sure yet'])}
          ${select('timeline', 'Timeline', ['Urgent (under 1 month)', '1 – 3 months', '3 – 6 months', '6+ months', 'Planning stage'])}
        </div>
        <div class="field field--full" data-field>
          <label for="message">Project details<span class="req" aria-hidden="true"> *</span></label>
          <textarea id="message" name="message" rows="5" required aria-required="true" aria-describedby="message-err" placeholder="Scope, site, key dates…"></textarea>
          <p class="field-error" id="message-err" role="alert"></p>
        </div>
        <div class="field field--full" data-field>
          <label for="file">Attach drawings / brief <span class="muted">(optional · PDF, DWG, ZIP · max 10 MB)</span></label>
          <label class="file-drop" for="file">${icon('upload', 'ic')}<span data-file-name>Choose a file…</span></label>
          <input id="file" name="attachment" type="file" class="sr-only" data-file-input accept=".pdf,.dwg,.dxf,.zip,.doc,.docx,.xls,.xlsx,.jpg,.png" aria-describedby="file-err">
          <p class="field-error" id="file-err" role="alert"></p>
        </div>
        <input type="text" name="_gotcha" class="hp" data-hp tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="form-actions"><button class="btn btn-primary" type="submit" data-submit><span class="btn-label">Send request</span>${icon('arrow-right', 'ic btn-ic')}</button><p class="form-status" role="status" aria-live="polite" data-form-status></p></div>
      </form>
      <div class="form-success" data-form-success hidden tabindex="-1" role="status">
        <span class="success-ic">${icon('check', 'ic ic-xl')}</span>
        <h3>Thank you — request received.</h3>
        <p>Our team will review your project details and contact you shortly. For urgent enquiries call <a href="${site.phoneHref}">${site.phone}</a>.</p>
      </div>
    </div>
    <aside class="offices">
      <article class="office-card" data-reveal>
        <span class="oc-tag">Head Office</span>
        <h3>Abu Dhabi</h3>
        <address>${site.adAddress.join('<br>')}</address>
        <p><a href="${site.phoneHref}">${icon('phone', 'ic ic-sm')}${site.phone}</a></p>
      </article>
      <article class="office-card" data-reveal>
        <span class="oc-tag oc-tag--alt">Branch</span>
        <h3>Dubai</h3>
        <address>${site.dubaiAddress}</address>
      </article>
      <article class="office-card office-card--plain" data-reveal>
        <ul>
          <li>${icon('globe', 'ic ic-sm')}<a href="${site.url}">${site.web}</a></li>
          <li>${icon('mail', 'ic ic-sm')}<a href="mailto:${site.email}">${site.email}</a></li>
        </ul>
      </article>
    </aside>
  </div>
</section>
<section class="map-sec" aria-label="Map — Abu Dhabi head office">
  <iframe title="Map: BTGC head office, FAB Properties Tower A, Najda Street, Abu Dhabi" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=FAB+Properties+Tower+A+Najda+Street+Abu+Dhabi&amp;output=embed" allowfullscreen></iframe>
</section>`;
  page('contact.html', { noCta: true, title: 'Contact & Request a Quote — Abu Dhabi & Dubai', desc: 'Request a quote from BTGC Group. Head office: Office #203, FAB Properties Tower A, Najda Street, Abu Dhabi. Tel +971 50 969 9436.', body });
}

/* =========================== 404 =========================== */
function notFound() {
  const body = `<section class="nf bp-grid bp-grid--dark">
  <div class="nf-slashes" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="container-x nf-inner">
    <p class="eyebrow eyebrow--light"><span class="eyebrow-slash" aria-hidden="true"></span>Error 404</p>
    <h1 class="nf-code" aria-label="404">4<span>0</span>4</h1>
    <p class="nf-title">This page isn’t on the drawings.</p>
    <p class="nf-sub">The page you’re looking for has moved or never existed. Let’s get you back on site.</p>
    <div class="hero-ctas">${btn('index.html', 'Back to home', 'light')}${btn('contact.html', 'Request a Quote', 'ghost-light')}</div>
  </div>
</section>`;
  write('404.html', layout({ file: '404.html', title: 'Page not found', desc: 'Page not found — BTGC Group.', body, noTrust: true, noCta: true }));
}

/* =========================== RUN =========================== */
const nImg = makeImages();
home(); about(); servicesOverview(); serviceDetail(); projectsPage(); caseStudies(); quality(); certifications(); contact(); notFound();

// Site search index (loaded on demand by assets/js/main.js). Paths are relative to the site root.
const searchIndex = [
  ...[['Home', 'index.html', 'Page', 'home welcome btgc group'], ['About us', 'about.html', 'Page', 'company story leadership team organisation structure approach wbs values'],
    ['Services', 'services.html', 'Page', 'mep civil fit-out maintenance overview'], ['Projects', 'projects.html', 'Page', 'portfolio case studies work'],
    ['Quality, Health & Safety', 'quality-hse.html', 'Page', 'hse iso policy safety quality'], ['Licences & Certifications', 'certifications.html', 'Page', 'iso 9001 14001 45001 icv dmt licence'],
    ['Contact / Request a Quote', 'contact.html', 'Page', 'quote enquiry phone email office address map']].map(([t, u, c, k]) => ({ t, u, c, k })),
  ...services.map((s) => ({ t: s.title, u: `services/${s.slug}.html`, c: 'Service', d: s.short, k: s.caps.join(' ') })),
  ...projects.map((p) => ({ t: p.title, u: p.case ? `projects/${p.slug}.html` : 'projects.html', c: 'Project', d: `${p.loc} · ${p.dur}`, k: `${p.scope} ${p.cats.join(' ')}` })),
  ...D.certs.map((c) => ({ t: c.title, u: 'certifications.html', c: 'Certificate', d: c.sub, k: c.meta })),
];
write('assets/js/search-data.js', `// GENERATED by tools/build-pages.mjs — do not edit. Classic script so it also works from file://\nwindow.BTGC_SEARCH = ${JSON.stringify(searchIndex)};\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((f) => `  <url><loc>${site.url}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${pages.length + 1} pages and ${nImg} placeholder images.`);
