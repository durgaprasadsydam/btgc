import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, nav, services, certs, trusted } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- Icons (Lucide-style, 24px, stroke 1.75) ---------- */
const I = {
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'hard-hat': '<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'bar-chart': '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  'clipboard-check': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  bug: '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6 13H2"/><path d="M22 13h-4"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  graduation: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  'life-buoy': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  trending: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
  mouse: '<path d="M12 12 3 3l1 14 4-4 3 7 3-1-3-7z"/>',
};
export const icon = (name, cls = 'ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${I[name] || I.check}</svg>`;

/* ---------- Logo (official artwork: assets/img/logo.png → optimised WebP variants) ---------- */
// "color" = original navy/red for light backgrounds; "light" = navy turned white for dark backgrounds.
export const logoImg = (p, variant = 'color', cls = '') =>
  `<img src="${p}assets/img/logo-${variant}.webp" alt="" width="640" height="336" class="logo-img logo-img--${variant} ${cls}" decoding="async">`;

/* ---------- Helpers ---------- */
export const img = (p, file, alt, { w = 1600, h = 1000, cls = '', lazy = true, ext = 'svg', attrs = '' } = {}) =>
  `<img src="${p}assets/img/${file}.${ext}" alt="${esc(alt)}" width="${w}" height="${h}" class="${cls}" ${lazy ? 'loading="lazy"' : 'loading="eager"'} decoding="async" ${attrs}>`;

export const eyebrow = (t, light = false) => `<p class="eyebrow${light ? ' eyebrow--light' : ''}"><span class="eyebrow-slash" aria-hidden="true"></span>${esc(t)}</p>`;

export const btn = (href, label, variant = 'primary', extra = '') =>
  `<a href="${href}" class="btn btn-${variant}" data-magnetic ${extra}><span class="btn-label">${esc(label)}</span>${icon('arrow-right', 'ic btn-ic')}</a>`;


/* ---------- "Trusted by" strip (sits directly above the footer on every page) ---------- */
// Uses assets/img/clients/<slug>.(svg|png|webp|avif|jpg) when present; otherwise a text wordmark.
const logoFile = (slug) => ['svg', 'webp', 'png', 'avif', 'jpg'].map((e) => `${slug}.${e}`).find((f) => existsSync(join(ROOT, 'assets', 'img', 'clients', f)));
export function trustStrip(p) {
  const tiles = trusted.map((c) => {
    const f = logoFile(c.slug);
    return f
      ? `<li class="trust-tile"><img src="${p}assets/img/clients/${f}" alt="${esc(c.name)} logo" height="44" loading="lazy" decoding="async"></li>`
      : `<li class="trust-tile"><span class="trust-word">${esc(c.name)}</span></li>`;
  }).join('');
  return `<section class="trust" aria-labelledby="trusted-h">
  <div class="container-x">
    <div class="trust-head" data-reveal><h2 id="trusted-h" class="trust-label">Trusted by</h2><p>Organisations we have delivered for across Abu Dhabi</p></div>
    <ul class="trust-grid" data-batch>${tiles}<li class="trust-tile trust-tile--fill" aria-hidden="true"></li></ul>
  </div>
</section>`;
}

/* ---------- Header / footer (identical on every page) ---------- */
// Minimal bar: menu button (left) · centred logo · search (right). Everything else lives in the full-screen menu.
export function header(p, active) {
  const links = [['Home', 'index.html', 'home'], ...nav.map((n) => [n.label, n.href, n.key]), ['Contact', 'contact.html', 'contact']];
  const menu = links.map(([l, h, k], i) => `<li><a href="${p}${h}"${active === k ? ' aria-current="page"' : ''}><span class="mm-num">${String(i + 1).padStart(2, '0')}</span>${l}</a></li>`).join('');
  const fallback = links.map(([l, h]) => `<a href="${p}${h}">${l}</a>`).join('');
  return `<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header" data-nav>
  <div class="nav-bar">
    <button class="menu-btn" data-menu-btn type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
    <a class="brand" href="${p}index.html" aria-label="BTGC Group — home">${logoImg(p, 'color')}${logoImg(p, 'light')}</a>
    <button class="nav-search" data-search-btn type="button" aria-haspopup="dialog" aria-label="Search the site">${icon('search', 'ic')}</button>
  </div>
  <nav class="nav-fallback" aria-label="Primary">${fallback}</nav>
</header>
<div id="site-menu" class="mobile-menu" data-menu aria-hidden="true" inert>
  <div class="mm-slash" aria-hidden="true"></div>
  <div class="mm-body">
    <nav class="mm-main" aria-label="Main menu"><ul>${menu}</ul></nav>
    <div class="mm-side">
      <h2 class="mm-h">Services</h2>
      <ul class="mm-services">${services.map((s) => `<li><a href="${p}services/${s.slug}.html">${icon(s.icon, 'ic ic-sm')}${s.title}</a></li>`).join('')}</ul>
    </div>
  </div>
  <div class="mm-foot">
    <a class="btn btn-light" href="${p}contact.html"><span class="btn-label">Request a Quote</span>${icon('arrow-right', 'ic btn-ic')}</a>
    <p><a href="${site.phoneHref}">${site.phone}</a> · <a href="mailto:${site.email}">${site.email}</a><br>${site.web}</p>
  </div>
</div>
<dialog class="search-dlg" data-search aria-label="Search the site">
  <div class="search-panel">
    <form class="search-form" role="search" data-search-form>
      ${icon('search', 'ic ic-lg')}
      <label class="sr-only" for="site-search">Search services, projects and pages</label>
      <input id="site-search" type="search" data-search-input placeholder="Search services, projects, pages…" autocomplete="off" enterkeyhint="search">
      <button class="search-close" type="button" data-search-close aria-label="Close search">${icon('x', 'ic ic-lg')}</button>
    </form>
    <ul class="search-results" data-search-results aria-live="polite"></ul>
  </div>
</dialog>`;
}

export function footer(p) {
  return `<footer class="site-footer bp-grid bp-grid--dark">
  <div class="container-x footer-top">
    <div class="footer-about">
      <a class="brand brand--light" href="${p}index.html" aria-label="BTGC Group — home">${logoImg(p, 'light')}</a>
      <p>${site.legal} — MEP, civil and interior fit-out contracting across Abu Dhabi and Dubai since 2018.</p>
      <a class="footer-cta" href="${p}contact.html">Request a Quote ${icon('arrow-up-right', 'ic ic-sm')}</a>
    </div>
    <div>
      <h2 class="footer-h">Company</h2>
      <ul class="footer-list">
        <li><a href="${p}about.html">About us</a></li>
        <li><a href="${p}projects.html">Projects</a></li>
        <li><a href="${p}quality-hse.html">Quality, Health &amp; Safety</a></li>
        <li><a href="${p}certifications.html">Licences &amp; Certifications</a></li>
        <li><a href="${p}contact.html">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Services</h2>
      <ul class="footer-list">${services.map((s) => `<li><a href="${p}services/${s.slug}.html">${s.title}</a></li>`).join('')}</ul>
    </div>
    <div class="footer-contact">
      <h2 class="footer-h">Contact</h2>
      <ul class="footer-list">
        <li>${icon('phone', 'ic ic-sm')}<a href="${site.phoneHref}">${site.phone}</a></li>
        <li>${icon('mail', 'ic ic-sm')}<a href="mailto:${site.email}">${site.email}</a></li>
        <li>${icon('globe', 'ic ic-sm')}<a href="${site.url}">${site.web}</a></li>
      </ul>
      <h2 class="footer-h footer-h--sp">Offices</h2>
      <address class="footer-address">
        <strong>Abu Dhabi — Head Office</strong>
        ${site.adAddress.join('<br>')}
      </address>
      <address class="footer-address">
        <strong>Dubai Office</strong>
        ${site.dubaiAddress}
      </address>
    </div>
  </div>
  <div class="container-x">
    <ul class="cert-strip" aria-label="Certifications">
      <li>ISO 9001:2015</li><li>ISO 14001:2015</li><li>ISO 45001:2018</li><li>ICV 26.23%</li><li>Abu Dhabi DMT Classified Contractor</li>
    </ul>
    <div class="footer-bottom">
      <p>© ${site.year} ${site.legal}. All rights reserved.</p>
      <p><a href="#top" data-top>Back to top ${icon('arrow-up-right', 'ic ic-sm')}</a></p>
    </div>
  </div>
</footer>`;
}

/* shell elements that live on every page */
export const shell = (p) => `<div class="preloader" data-preloader aria-hidden="true">
  <div class="pre-inner">${logoImg(p, 'light', 'pre-logo').replace('<img ', '<img data-pre-logo ')}<div class="pre-count"><span data-pre-count>0</span><i>%</i></div></div>
</div>
<div class="page-wipe" data-wipe aria-hidden="true"><span class="pw pw-navy" data-wipe-panel></span><span class="pw pw-red" data-wipe-panel></span><span class="pw pw-navy2" data-wipe-panel></span></div>`;

/* ---------- Page layout ---------- */
let _crumbs = [];
export function layout({ file, title, desc, body, depth = 0, active = '', jsonld = '', ogImage = 'hero-abu-dhabi-skyline.jpg', preload = '', extraScripts = '', noTrust = false, noCta = false }) {
  const p = '../'.repeat(depth);
  // BreadcrumbList structured data from the page hero's breadcrumb trail
  if (_crumbs.length > 1) {
    const items = _crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${site.url}/${c.href ? (c.href === 'index.html' ? '' : c.href) : file}` }));
    jsonld += `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items })}</script>\n`;
  }
  _crumbs = [];
  const full = title.includes('BTGC') ? title : `${title} | BTGC Group — MEP, Civil & Fit-out, UAE`;
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0B2E6F">
<link rel="canonical" href="${site.url}/${file}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BTGC Group">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${site.url}/assets/img/${ogImage}">
<meta property="og:url" content="${site.url}/${file === 'index.html' ? '' : file}">
<meta property="og:locale" content="en_AE">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${site.url}/assets/img/${ogImage}">
<link rel="icon" type="image/png" sizes="64x64" href="${p}assets/img/favicon-64.png">
<link rel="apple-touch-icon" href="${p}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggmxSuXd.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap"></noscript>
${preload}<script>
/* Progressive-enhancement gate: content stays visible unless JS + motion libs are running. */
(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');
try{if(sessionStorage.getItem('btgc-pt'))h.classList.add('pt');else if(!sessionStorage.getItem('btgc-pre'))h.classList.add('preload')}catch(e){}
setTimeout(function(){if(!window.__btgcReady){h.classList.remove('js','preload','pt')}},6000)})(document);
</script>
<!-- Production CSS. For quick DEV preview without building, swap this for the Tailwind v4 browser build (see README):
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> -->
<link rel="stylesheet" href="${p}dist/output.css">
${jsonld}</head>
<body id="top" data-depth="${depth}">
${shell(p)}
${header(p, active)}
<div class="cursor" data-cursor-root aria-hidden="true"><span class="cursor-dot" data-cursor-dot></span><span class="cursor-ring" data-cursor-ring></span></div>
<div id="page-content">
<main id="main">
${body}
</main>
${noTrust ? '' : trustStrip(p)}
${noCta ? '' : ctaBand(p)}
${footer(p)}
</div>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>
<script defer src="${p}assets/js/motion.js"></script>
<script defer src="${p}assets/js/main.js"></script>
${extraScripts}
</body>
</html>
`;
}

/* ---------- Reusable blocks ---------- */
export function pageHero({ p, kicker, title, sub = '', imgFile, imgAlt, crumbs = [], ext = 'svg', tall = false, extra = '' }) {
  _crumbs = crumbs;
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => (c.href ? `<li><a href="${p}${c.href}">${c.label}</a></li>` : `<li aria-current="page">${c.label}</li>`)).join('')}</ol></nav>`
    : '';
  return `<section class="page-hero${tall ? ' page-hero--tall' : ''}" data-hero>
  <div class="page-hero-bg" aria-hidden="true">${img(p, imgFile, imgAlt, { cls: 'hero-img', lazy: false, ext, attrs: 'data-hero-bg' })}</div>
  <div class="hero-veil" aria-hidden="true"></div>
  <div class="hero-slashes" aria-hidden="true"><i data-hero-slash></i><i data-hero-slash></i></div>
  <div class="container-x page-hero-inner">
    ${crumbHtml}
    ${kicker ? eyebrow(kicker, true) : ''}
    <h1 class="h-display h-display--hero" data-hero-title>${title}</h1>
    ${sub ? `<p class="hero-sub">${sub}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

export function projectCard(p, pr, { link = true } = {}) {
  const inner = `<div class="pc-media slash-mask" ${link ? '' : ''}>${img(p, `project-${pr.slug}`, `${pr.title} — ${pr.loc}`, { w: 1200, h: 800, cls: 'pc-img' })}<span class="pc-tag">${esc(pr.scope)}</span></div>
    <div class="pc-body"><h3>${esc(pr.title)}</h3><p class="pc-loc">${icon('map-pin', 'ic ic-xs')}${esc(pr.loc)}</p>
    <p class="pc-meta">${icon('clock', 'ic ic-xs')}${esc(pr.dur)}${link ? `<span class="pc-more">View case study ${icon('arrow-right', 'ic ic-xs')}</span>` : ''}</p></div>`;
  return link
    ? `<a class="project-card" href="${p}projects/${pr.slug}.html" data-project data-cat="${pr.cats.join(' ')}" data-cursor="View">${inner}</a>`
    : `<article class="project-card project-card--static" data-project data-cat="${pr.cats.join(' ')}">${inner}</article>`;
}

// Closing call-to-action: sits directly above the footer on every page (rendered by layout()).
export const ctaBand = (p, title = 'Have a project in mind? <em>Let’s build it right.</em>', sub = 'Tell us about your scope, location and timeline. A senior engineer will respond with a clear next step.') => `<section class="cta-band" data-cta aria-labelledby="cta-h">
  <picture class="cta-photo" aria-hidden="true"><source type="image/webp" srcset="${p}assets/img/hero/3-1280.webp"><img src="${p}assets/img/hero/3-1280.jpg" alt="" width="1280" height="720" loading="lazy" decoding="async"></picture>
  <div class="cta-veil" aria-hidden="true"></div>
  <div class="cta-slashes" data-cta-slashes aria-hidden="true"><i data-cta-slash></i><i data-cta-slash></i></div>
  <div class="container-x cta-inner">
    <div class="cta-copy">
      ${eyebrow('Start a project', true)}
      <h2 id="cta-h" class="h-display" data-split>${title}</h2>
      <p data-reveal>${sub}</p>
      <ul class="cta-points" data-reveal>
        <li>${icon('user-check', 'ic ic-sm')}Dedicated point of contact</li>
        <li>${icon('map-pin', 'ic ic-sm')}Abu Dhabi &amp; Dubai</li>
        <li>${icon('shield-check', 'ic ic-sm')}ISO 9001 · 14001 · 45001</li>
      </ul>
    </div>
    <div class="cta-card" data-reveal>
      <p class="cta-card-k">Talk to our team</p>
      <a class="cta-card-phone" href="${site.phoneHref}"><i aria-hidden="true">${icon('phone', 'ic')}</i>${site.phone}</a>
      <a class="cta-card-mail" href="mailto:${site.email}">${icon('mail', 'ic ic-sm')}${site.email}</a>
      <p class="cta-card-addr">${icon('map-pin', 'ic ic-sm')}Head office: Najda Street, Abu Dhabi</p>
      <a href="${p}contact.html" class="btn btn-primary" data-magnetic><span class="btn-label">Request a Quote</span>${icon('arrow-right', 'ic btn-ic')}</a>
    </div>
  </div>
</section>`;

export const processStrip = (p, phases) => `<ol class="process-strip" data-batch>
${phases.map((ph) => `<li><span class="ps-n">${String(ph.n).padStart(2, '0')}</span><h3>${ph.title}</h3></li>`).join('')}
</ol>`;

export const certBadges = certs.filter((c) => c.group === 'iso');
