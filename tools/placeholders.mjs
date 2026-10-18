// Generates lightweight blueprint-style SVG placeholders. Replace each file with a real photo (same name, any web format
// — then update the extension in the markup, or keep an .svg wrapper). Descriptive filenames are intentional.

function rng(seed) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

const line = (x1, y1, x2, y2, o = 0.35, w = 2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#fff" stroke-opacity="${o}" stroke-width="${w}" fill="none"/>`;
const rect = (x, y, w, h, o = 0.3, sw = 2, fill = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" stroke="#fff" stroke-opacity="${o}" stroke-width="${sw}" fill="${fill}" ${fill !== 'none' ? 'fill-opacity="0.05"' : ''}/>`;
const circ = (x, y, r, o = 0.35, sw = 2) => `<circle cx="${x}" cy="${y}" r="${r}" stroke="#fff" stroke-opacity="${o}" stroke-width="${sw}" fill="none"/>`;

function art(kind, W, H, r) {
  const g = [];
  const gy = H * 0.78;
  switch (kind) {
    case 'skyline': {
      let x = W * 0.05;
      while (x < W * 0.95) {
        const w = 70 + r() * 110, h = H * (0.22 + r() * 0.5);
        g.push(rect(x, gy - h, w, h, 0.32, 2, '#fff'));
        for (let k = 1; k < h / 46; k++) g.push(line(x + 8, gy - h + k * 46, x + w - 8, gy - h + k * 46, 0.12, 1.5));
        x += w + 14 + r() * 26;
      }
      g.push(line(0, gy, W, gy, 0.4, 2));
      break;
    }
    case 'duct': {
      let y = H * 0.3;
      for (let i = 0; i < 3; i++) {
        const x0 = W * (0.08 + r() * 0.1), x1 = W * (0.7 + r() * 0.25), h = 54 - i * 10;
        g.push(rect(x0, y, x1 - x0, h, 0.38, 2.5, '#fff'));
        g.push(rect(x1, y - 40, 64, h + 80, 0.38, 2.5));
        for (let k = 0; k < 6; k++) { const gx = x0 + 60 + k * ((x1 - x0 - 120) / 5); g.push(line(gx, y + h, gx, y + h + 60, 0.3, 2)); g.push(rect(gx - 30, y + h + 60, 60, 14, 0.4, 2)); }
        y += H * 0.24;
      }
      g.push(circ(W * 0.86, H * 0.64, 92, 0.3)); g.push(circ(W * 0.86, H * 0.64, 18, 0.45));
      for (let k = 0; k < 6; k++) g.push(line(W * 0.86, H * 0.64, W * 0.86 + Math.cos(k * 1.047) * 90, H * 0.64 + Math.sin(k * 1.047) * 90, 0.25, 2));
      break;
    }
    case 'panel': {
      const px = W * 0.18, py = H * 0.12, pw = W * 0.64, ph = H * 0.68;
      g.push(rect(px, py, pw, ph, 0.4, 3, '#fff'));
      const cols = 4, rows = 3, cw = pw / cols, rh = ph / rows;
      for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
        g.push(rect(px + c * cw + 18, py + rr * rh + 18, cw - 36, rh - 36, 0.3, 2));
        for (let k = 0; k < 4; k++) g.push(rect(px + c * cw + 36 + k * ((cw - 100) / 3), py + rr * rh + 44, 20, 38, 0.4, 2, '#fff'));
        g.push(line(px + c * cw + 36, py + rr * rh + 110, px + (c + 1) * cw - 36, py + rr * rh + 110, 0.25, 2));
      }
      for (let k = 0; k < 7; k++) g.push(line(px + 40 + k * 26, py + ph, px + 40 + k * 26, H, 0.3, 3));
      break;
    }
    case 'sprinkler': {
      g.push(line(0, H * 0.22, W, H * 0.22, 0.42, 7));
      g.push(line(W * 0.12, H * 0.22, W * 0.12, H * 0.08, 0.35, 5));
      for (let k = 0; k < 6; k++) {
        const x = W * (0.1 + k * 0.16);
        g.push(line(x, H * 0.22, x, H * 0.36, 0.38, 4));
        g.push(rect(x - 14, H * 0.36, 28, 12, 0.5, 2, '#fff'));
        g.push(circ(x, H * 0.36 + 26, 7, 0.45));
        for (let d = -2; d <= 2; d++) g.push(line(x + d * 6, H * 0.36 + 34, x + d * 46, H * 0.66, 0.14, 1.5));
      }
      g.push(line(0, H * 0.8, W, H * 0.8, 0.35, 2));
      break;
    }
    case 'fitout': {
      g.push(line(0, H * 0.72, W, H * 0.72, 0.4, 2));
      g.push(line(0, H * 0.18, W * 0.12, H * 0.3, 0.25, 2)); g.push(line(W, H * 0.18, W * 0.88, H * 0.3, 0.25, 2));
      g.push(rect(W * 0.12, H * 0.3, W * 0.76, H * 0.42, 0.28, 2));
      g.push(rect(W * 0.22, H * 0.52, W * 0.34, H * 0.12, 0.42, 2.5, '#fff'));
      g.push(rect(W * 0.22, H * 0.64, W * 0.34, H * 0.08, 0.3, 2));
      for (let k = 0; k < 5; k++) { const x = W * (0.26 + k * 0.075); g.push(circ(x, H * 0.46, 16, 0.4)); g.push(line(x, H * 0.3, x, H * 0.44, 0.3, 1.5)); }
      g.push(rect(W * 0.64, H * 0.4, W * 0.18, H * 0.32, 0.36, 2.5, '#fff'));
      for (let k = 1; k < 4; k++) g.push(line(W * 0.64, H * (0.4 + k * 0.08), W * 0.82, H * (0.4 + k * 0.08), 0.25, 1.5));
      break;
    }
    case 'plan': {
      const x0 = W * 0.12, y0 = H * 0.14, w = W * 0.76, h = H * 0.66;
      g.push(rect(x0, y0, w, h, 0.5, 6));
      g.push(line(x0 + w * 0.38, y0, x0 + w * 0.38, y0 + h * 0.62, 0.45, 5));
      g.push(line(x0, y0 + h * 0.62, x0 + w * 0.62, y0 + h * 0.62, 0.45, 5));
      g.push(line(x0 + w * 0.62, y0 + h * 0.3, x0 + w, y0 + h * 0.3, 0.45, 5));
      g.push(`<path d="M${x0 + w * 0.38} ${y0 + h * 0.62} a56 56 0 0 1 56 -56" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>`);
      for (let k = 0; k < 9; k++) g.push(line(x0 + k * (w / 8), y0 + h + 24, x0 + k * (w / 8), y0 + h + 40, 0.3, 2));
      g.push(line(x0, y0 + h + 32, x0 + w, y0 + h + 32, 0.3, 2));
      g.push(rect(x0 + w * 0.7, y0 + h * 0.4, w * 0.18, h * 0.3, 0.3, 2, '#fff'));
      break;
    }
    case 'portrait':
      g.push(circ(W / 2, H * 0.36, W * 0.17, 0.4, 3));
      g.push(`<path d="M${W * 0.18} ${H} C${W * 0.18} ${H * 0.66} ${W * 0.34} ${H * 0.58} ${W / 2} ${H * 0.58} C${W * 0.66} ${H * 0.58} ${W * 0.82} ${H * 0.66} ${W * 0.82} ${H}" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>`);
      break;
    case 'doc':
      g.push(rect(W * 0.12, H * 0.08, W * 0.76, H * 0.84, 0.5, 3, '#fff'));
      g.push(rect(W * 0.18, H * 0.14, W * 0.64, H * 0.08, 0.35, 2));
      for (let k = 0; k < 9; k++) g.push(line(W * 0.2, H * (0.3 + k * 0.05), W * (0.8 - (k % 3) * 0.08), H * (0.3 + k * 0.05), 0.2, 3));
      g.push(circ(W * 0.7, H * 0.8, W * 0.08, 0.4, 3)); g.push(circ(W * 0.7, H * 0.8, W * 0.05, 0.25, 2));
      break;
  }
  return g.join('');
}

export function placeholder({ file, label, kind = 'skyline', w = 1600, h = 1000 }) {
  const r = rng(file);
  const hue = [['#061738', '#0B2E6F'], ['#0A2558', '#1E4FB8'], ['#061738', '#0A2558'], ['#0B2E6F', '#1E4FB8']][Math.floor(r() * 4)];
  const ang = Math.floor(r() * 40) + 20;
  const small = w < 1000;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label.replace(/"/g, '')}">
<defs>
<linearGradient id="g" gradientTransform="rotate(${ang})"><stop offset="0" stop-color="${hue[0]}"/><stop offset="1" stop-color="${hue[1]}"/></linearGradient>
<pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="1"/></pattern>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#p)"/>
<g>${art(kind, w, h, r)}</g>
<path d="M${w * 0.78} ${h} L${w * 0.9} 0 h${w * 0.018} L${w * 0.798} ${h}z" fill="#E2231A" fill-opacity=".85"/>
<path d="M${w * 0.82} ${h} L${w * 0.94} 0 h${w * 0.008} L${w * 0.828} ${h}z" fill="#fff" fill-opacity=".5"/>
<text x="${small ? 28 : 40}" y="${h - (small ? 30 : 44)}" font-family="Inter,Arial,sans-serif" font-size="${small ? 24 : 28}" font-weight="600" fill="#fff" fill-opacity=".85">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
<text x="${small ? 28 : 40}" y="${h - (small ? 62 : 82)}" font-family="Inter,Arial,sans-serif" font-size="${small ? 16 : 18}" letter-spacing="3" fill="#fff" fill-opacity=".5">PLACEHOLDER — REPLACE WITH REAL PHOTO</text>
</svg>
`;
}
