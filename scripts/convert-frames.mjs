/*
  Asset curation: pulls ONLY the images the site uses from the local git-ignored
  images/ library into src/assets (kebab-case), pre-optimized. Rerunnable.

  Frames: 720x1280 JPG -> 720x1200 WebP (bottom 80px cropped: removes the
  generator watermark; static camera makes a uniform crop safe).
  Budget: 26 frames <= ~1.2MB total (brief §11).
*/
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const LIB = path.join(ROOT, 'images');
const FRAMES_IN = path.join(
  LIB,
  'frames_for_3d/Apartment_building_construction___202607060915_frames'
);
const FRAMES_OUT = path.join(ROOT, 'src/assets/frames');
const PHOTOS_OUT = path.join(ROOT, 'src/assets/photos');
const SHOWCASE_OUT = path.join(ROOT, 'src/assets/showcase');
const BRAND_OUT = path.join(ROOT, 'src/assets/brand');
const PUBLIC = path.join(ROOT, 'public');

const FRAME_QUALITY = 61;

async function convertFrames() {
  await mkdir(FRAMES_OUT, { recursive: true });
  const files = (await readdir(FRAMES_IN))
    .filter((f) => /^frame_\d{3}\.jpg$/.test(f))
    .sort();
  let total = 0;
  for (const f of files) {
    const n = f.match(/(\d{3})/)[1];
    const out = path.join(FRAMES_OUT, `frame-${n.slice(1)}.webp`);
    await sharp(path.join(FRAMES_IN, f))
      .extract({ left: 0, top: 0, width: 720, height: 1120 })
      .webp({ quality: FRAME_QUALITY })
      .toFile(out);
    total += (await stat(out)).size;
  }
  console.log(
    `frames: ${files.length} -> WebP, total ${(total / 1024).toFixed(0)} KB`
  );
}

const PHOTOS = [
  ['hero/hero-residential-corner-building.png', 'hero-residential-corner-building.webp', 2400, 82],
  ['projects/residential-entrance-closeup.png', 'residential-entrance-closeup.webp', 1600, 80],
  ['projects/balcony-facade-closeup.png', 'balcony-facade-closeup.webp', 1600, 80],
  ['projects/facade-grid-detail.png', 'facade-grid-detail.webp', 1600, 80],
  ['interiors/lobby-elevator-stairwell.png', 'lobby-elevator-stairwell.webp', 1600, 80],
  ['boards/planning-design-desk.png', 'planning-design-desk.webp', 1600, 80],
  ['boards/materials-finish-palette.png', 'materials-finish-palette.webp', 1600, 80],
  // Adopted into the homepage (2026-07): before/after transformation, the red
  // architectural-lines CTA backdrop, and the six real construction stages.
  ['backgrounds/before-after-residential-render.png', 'before-after.webp', 1600, 80],
  ['backgrounds/minimal-red-architectural-lines.png', 'red-architectural-lines.webp', 1600, 80],
  ['process-scroll/01-site-preparation-groundworks.png', 'process-1.webp', 1280, 78],
  ['process-scroll/02-concrete-structural-frame.png', 'process-2.webp', 1280, 78],
  ['process-scroll/03-brick-infill-structure.png', 'process-3.webp', 1280, 78],
  ['process-scroll/04-facade-insulation-stage.png', 'process-4.webp', 1280, 78],
  ['process-scroll/05-completed-front-elevation.png', 'process-5.webp', 1280, 78],
  ['process-scroll/06-completed-side-elevation.png', 'process-6.webp', 1280, 78],
];

async function convertPhotos() {
  await mkdir(PHOTOS_OUT, { recursive: true });
  for (const [src, dst, width, quality] of PHOTOS) {
    const out = path.join(PHOTOS_OUT, dst);
    await sharp(path.join(LIB, src))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);
    console.log(`photo: ${dst} ${((await stat(out)).size / 1024).toFixed(0)} KB`);
  }
}

// /showcases/*-lab demo images (internal design vitrine). Real MEY project
// buildings + a brand-line background, curated from the library exactly like
// PHOTOS so the committed footprint stays small webp (not raw multi-MB source).
// Showcase-only sources (the /showcases/*-lab demos). Real project buildings for
// the projects/services variants; the icon set is globbed below. Anything adopted
// into production graduates to PHOTOS above.
const SHOWCASE = [
  ['Buildings_Main_Images/Ali.png', 'ali.webp', 1600, 80],
  ['Buildings_Main_Images/El_Ele_Apartmani.jpeg', 'el-ele-apartmani.webp', 1600, 80],
  ['Buildings_Main_Images/Spanbaglari.png', 'sanbaglari.webp', 1600, 80],
];

async function convertShowcase() {
  await mkdir(SHOWCASE_OUT, { recursive: true });
  for (const [src, dst, width, quality] of SHOWCASE) {
    const out = path.join(SHOWCASE_OUT, dst);
    await sharp(path.join(LIB, src))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);
    console.log(`showcase: ${dst} ${((await stat(out)).size / 1024).toFixed(0)} KB`);
  }
  // Custom 3D service icons keep messy source names → icon-<n>.webp (on white).
  const icons = (await readdir(path.join(LIB, 'Unique_icons')))
    .filter((f) => /\(\d+\)\.png$/.test(f))
    .sort((a, b) => Number(a.match(/\((\d+)\)/)[1]) - Number(b.match(/\((\d+)\)/)[1]));
  for (const f of icons) {
    const n = f.match(/\((\d+)\)/)[1];
    const out = path.join(SHOWCASE_OUT, `icon-${n}.webp`);
    await sharp(path.join(LIB, 'Unique_icons', f)).resize({ width: 480 }).webp({ quality: 82 }).toFile(out);
    console.log(`showcase: icon-${n}.webp ${((await stat(out)).size / 1024).toFixed(0)} KB`);
  }
}

async function convertBrand() {
  await mkdir(BRAND_OUT, { recursive: true });
  await mkdir(PUBLIC, { recursive: true });
  const logo = sharp(path.join(LIB, 'LOGO/MEY INSAAT LOGO.png')).trim();
  const buf = await logo.toBuffer();

  await sharp(buf).resize({ width: 1200 }).png().toFile(path.join(BRAND_OUT, 'mey-logo.png'));

  // Favicon/touch icon: the diamond mark only (left square of the lockup) —
  // the full wordmark lockup is unreadable at icon sizes.
  const meta = await sharp(buf).metadata();
  const mark = await sharp(buf)
    .extract({ left: 0, top: 0, width: meta.height, height: meta.height })
    .toBuffer();
  await sharp(mark)
    .resize({ width: 48, height: 48, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC, 'favicon.png'));
  await sharp(mark)
    .resize({ width: 150, height: 150, fit: 'contain', background: '#f4f4f2' })
    .extend({ top: 15, bottom: 15, left: 15, right: 15, background: '#f4f4f2' })
    .flatten({ background: '#f4f4f2' })
    .png()
    .toFile(path.join(PUBLIC, 'apple-touch-icon.png'));

  await sharp(path.join(LIB, 'hero/hero-residential-corner-building.png'))
    .resize({ width: 1200, height: 630, fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(path.join(PUBLIC, 'og-default.jpg'));
  console.log('brand: logo, favicon, apple-touch-icon, og-default done');
}

await convertFrames();
await convertPhotos();
await convertShowcase();
await convertBrand();
