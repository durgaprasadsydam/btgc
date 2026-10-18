// Builds the fallbacks the hero <picture> needs from each hero source image.
// Usage: put <stem>.avif (any size ≥1920px wide, ideally 2560) in assets/img/hero/, then run:  npm run hero-images
// Output per stem: <stem>.webp + <stem>.jpg (1920w) and <stem>-1280.webp + <stem>-1280.jpg (1280w). The .avif is served as-is to wide screens.
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img', 'hero');
const stems = readdirSync(dir).filter((f) => f.endsWith('.avif')).map((f) => f.slice(0, -5));
for (const stem of stems) {
  for (const [w, suf] of [[1920, ''], [1280, '-1280']]) {
    const img = () => sharp(join(dir, `${stem}.avif`)).resize({ width: w, withoutEnlargement: true });
    await img().webp({ quality: 78 }).toFile(join(dir, `${stem}${suf}.webp`));
    await img().jpeg({ quality: 78, mozjpeg: true }).toFile(join(dir, `${stem}${suf}.jpg`));
  }
  console.log('✓', stem);
}

// Service card thumbnails for the home page (640×420 WebP + JPG) cropped from the same photos.
// Civil uses a different region of its photo so it does not look identical to ELV (images 4 and 5 are the same file).
import { mkdirSync } from 'node:fs';
const out = join(dir, '..', 'services');
mkdirSync(out, { recursive: true });
const thumbs = [
  ['mechanical', '1', null], ['electrical', '2', null], ['phe-fire', '3', null], ['elv', '4', null],
  ['civil', '5', { left: 1150, top: 380, width: 1250, height: 820 }], ['interior-fitout', 'interior', null], ['maintenance', '6', null],
];
for (const [slug, stem, region] of thumbs) {
  const src = () => { const i = sharp(join(dir, `${stem}.avif`)); return region ? i.extract(region) : i; };
  await src().resize(640, 420, { fit: 'cover', position: 'attention' }).webp({ quality: 78 }).toFile(join(out, `${slug}.webp`));
  await src().resize(640, 420, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile(join(out, `${slug}.jpg`));
  console.log('✓ service thumb', slug);
}

// Featured project cards on the home page: portrait crops (760×960) of the best-fitting photos.
// These are stand-ins — replace with real project photos of the same names (assets/img/projects/<slug>.webp|jpg).
const pOut = join(dir, '..', 'projects');
mkdirSync(pOut, { recursive: true });
const projectPhotos = [
  ['adnoc-t3-emergency-power', '2'], ['wtc-hvac-bms-delta-t', '1'], ['yas-mall-fls-retrofit', 'interior'],
  ['bmbr-pool-mep', '3'], ['kpmg-office-demerging', '6'], ['office-square-modification', '5'],
];
for (const [slug, stem] of projectPhotos) {
  const src = () => sharp(join(dir, `${stem}.avif`)).resize(760, 960, { fit: 'cover', position: 'attention' });
  await src().webp({ quality: 78 }).toFile(join(pOut, `${slug}.webp`));
  await src().jpeg({ quality: 78, mozjpeg: true }).toFile(join(pOut, `${slug}.jpg`));
  console.log('✓ project photo', slug);
}

// Home "Our approach" phase explorer: one photo per phase (900×980 WebP + JPG). Stand-ins — replace with real site photos.
const phOut = join(dir, '..', 'phases');
mkdirSync(phOut, { recursive: true });
for (const [n, stem] of [[1, '2'], [2, '1'], [3, '5'], [4, '6'], [5, '3']]) {
  const src = () => sharp(join(dir, `${stem}.avif`)).resize(900, 980, { fit: 'cover', position: 'attention' });
  await src().webp({ quality: 78 }).toFile(join(phOut, `p${n}.webp`));
  await src().jpeg({ quality: 78, mozjpeg: true }).toFile(join(phOut, `p${n}.jpg`));
  console.log('✓ phase photo', n);
}
