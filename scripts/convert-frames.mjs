/*
  Asset curation: pulls ONLY the images the site uses from the local git-ignored
  images/ library into src/assets (kebab-case), pre-optimized. Rerunnable.

  Frames: 720x1280 JPG -> 720x1200 WebP (bottom 80px cropped: removes the
  generator watermark; static camera makes a uniform crop safe).
  Budget: 26 frames <= ~1.2MB total (brief §11).
*/
import { access, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/* The library evolves (dirs get reorganized/removed); a missing source must not
   abort the whole run — skip it loudly and keep the existing curated output. */
async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
async function requireSrc(p) {
  if (await exists(p)) return true;
  console.warn(`SKIP (source missing): ${path.relative(LIB, p)}`);
  return false;
}

const ROOT = new URL('..', import.meta.url).pathname;
const LIB = path.join(ROOT, 'images');
const FRAMES_IN = path.join(
  LIB,
  'frames_for_3d/Apartment_building_construction___202607060915_frames'
);
const FRAMES_OUT = path.join(ROOT, 'src/assets/frames');
const PHOTOS_OUT = path.join(ROOT, 'src/assets/photos');
const SHOWCASE_OUT = path.join(ROOT, 'src/assets/showcase');
const PROJECTS_OUT = path.join(ROOT, 'src/assets/projects');
const BRAND_OUT = path.join(ROOT, 'src/assets/brand');
const PUBLIC = path.join(ROOT, 'public');

const FRAME_QUALITY = 61;

async function convertFrames() {
  if (!(await requireSrc(FRAMES_IN))) return;
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
  // Adopted into the homepage (2026-07): the red architectural-lines CTA
  // backdrop and the six real construction stages. (before-after retired.)
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
    if (!(await requireSrc(path.join(LIB, src)))) continue;
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

// The three real MEY buildings delivered so far. Each has a finished render
// (Buildings_Main_Images) and — for two of them — a real construction time-lapse
// (frames_for_3d/<Building>) powering the per-project "kazıdan teslime" story.
const PROJECT_RENDERS = [
  ['Buildings_Main_Images/Ali.png', 'ali.webp', 1200, 82],
  ['Buildings_Main_Images/El_Ele_Apartmani.jpeg', 'el-ele-apartmani.webp', 1200, 82],
  ['Buildings_Main_Images/Spanbaglari.png', 'sapanbaglari.webp', 1200, 82],
  // Cutaway ("x-ray") twins of the covers above: same camera, same 1086x1448
  // frame, facade removed to show furnished flats. Pixel-aligned with the base
  // render so a hover lens can reveal the interior at the exact cursor spot.
  ['Buildings_Main_Images/hover/ali.png', 'ali-xray.webp', 1200, 82],
  ['Buildings_Main_Images/hover/elele.png', 'el-ele-apartmani-xray.webp', 1200, 82],
  ['Buildings_Main_Images/hover/sapanbaglari.png', 'sapanbaglari-xray.webp', 1200, 82],
];
// Curated stage frames (excavation → delivered) from each building's own
// sequence. Bottom watermark cropped (same top-crop trick as the hero frames).
// Frame picks tuned so each stage frame actually shows its named phase (kazı →
// kaba inşaat → duvar → cephe → tamamlanma), not one phase behind the label.
const PROJECT_STAGES = [
  ['El_Ele_Building', 'el-ele', [2, 11, 16, 20, 24]],
  ['Sapanbaglari_Building', 'sapanbaglari', [2, 12, 17, 22, 26]],
];

// The cutaway twins must coincide with the base covers pixel for pixel; AI
// regenerations sometimes drift a row (e.g. 1086x1449) — force the canonical
// cover frame so the lens overlay never misaligns.
const XRAY_SIZE = { width: 1086, height: 1448, fit: 'cover' };

async function convertProjects() {
  await mkdir(PROJECTS_OUT, { recursive: true });
  for (const [src, dst, width, quality] of PROJECT_RENDERS) {
    if (!(await requireSrc(path.join(LIB, src)))) continue;
    const out = path.join(PROJECTS_OUT, dst);
    await sharp(path.join(LIB, src))
      .resize(dst.includes('-xray') ? XRAY_SIZE : { width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);
    console.log(`project: ${dst} ${((await stat(out)).size / 1024).toFixed(0)} KB`);
  }
  for (const [dir, prefix, frames] of PROJECT_STAGES) {
    for (let i = 0; i < frames.length; i++) {
      const n = String(frames[i]).padStart(3, '0');
      const out = path.join(PROJECTS_OUT, `${prefix}-stage-${i + 1}.webp`);
      await sharp(path.join(LIB, 'frames_for_3d', dir, `frame_${n}.jpg`))
        .extract({ left: 0, top: 0, width: 720, height: 1120 })
        .resize({ width: 900, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
      console.log(`project: ${prefix}-stage-${i + 1}.webp ${((await stat(out)).size / 1024).toFixed(0)} KB`);
    }
  }
}

// El Ele Apartmanı — DETAY SAHNESİ seti. Ali'nin yatay detay sahnesini bu bina
// için de açar: hasStage, slug türevli 10 kareyi (salon/mutfak/cephe/izometrik/
// vaziyet/malzeme + 4 malzeme çipi) ARAR. Kaynak = binanın kendi galerisi
// (galllery/el_ele, git-ignored). Kareler yalnız YENİDEN BOYUTLANIR; her slotun
// oranını sayfadaki CSS object-cover kırpar (Ali karelerindeki gibi). Malzeme
// çipleri (48px) gerçek dokulardan kare kırpımdır. Rerunnable, additive.
const ELELE_IN = path.join(LIB, 'Buildings_Main_Images/galllery/el_ele');
const ELELE_SLUG = 'el-ele-apartmani';
// Dağınık üretici adları → anlamlı slot eşlemesi (görsel içerikle doğrulandı).
const ELELE_SRC = {
  ferforje: 'ChatGPT Image Jul 12, 2026, 11_29_18 AM.png', // köşe ferforje detayı
  facade: 'ChatGPT Image Jul 12, 2026, 11_29_23 AM.png', // geniş tekrar eden cephe
  iso: 'ChatGPT Image Jul 12, 2026, 12_01_27 PM.png', // aksonometrik bina render (beyaz zemin)
  stair: 'ChatGPT Image Jul 12, 2026, 12_01_44 PM.png', // merdiven / hol iç mekan
  bath: 'ChatGPT Image Jul 12, 2026, 12_01_48 PM.png', // banyo (taş dokulu seramik, cam)
  room: 'ChatGPT Image Jul 12, 2026, 12_01_52 PM.png', // manzaralı oda (yaşam)
};

async function eleleFit(src, name, width, quality = 80) {
  const out = path.join(PROJECTS_OUT, `${ELELE_SLUG}-${name}.webp`);
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out);
  return (await stat(out)).size;
}
// Ortalı kare doku çipi: kenar = min(W,H)*k, (fx,fy) oransal merkezde; kenara taşarsa kırpılır.
async function eleleSwatch(src, name, fx, fy, k) {
  const m = await sharp(src).metadata();
  const side = Math.round(Math.min(m.width, m.height) * k);
  const left = Math.max(0, Math.min(Math.round(fx * m.width - side / 2), m.width - side));
  const top = Math.max(0, Math.min(Math.round(fy * m.height - side / 2), m.height - side));
  const out = path.join(PROJECTS_OUT, `${ELELE_SLUG}-${name}.webp`);
  await sharp(src).extract({ left, top, width: side, height: side }).resize({ width: 352 }).webp({ quality: 82 }).toFile(out);
  return (await stat(out)).size;
}

async function convertElEleDetail() {
  if (!(await requireSrc(ELELE_IN))) return;
  await mkdir(PROJECTS_OUT, { recursive: true });
  const S = (f) => path.join(ELELE_IN, f);
  let total = 0;
  // Ana kareler — yalnız resize; oranı slotun CSS'i kırpar.
  total += await eleleFit(S(ELELE_SRC.room), 'salon', 1200);
  total += await eleleFit(S(ELELE_SRC.stair), 'mutfak', 1200); // "İÇ MEKÂN" — hol/merdiven
  total += await eleleFit(S(ELELE_SRC.facade), 'cephe-cizim', 1200);
  total += await eleleFit(S(ELELE_SRC.iso), 'izometrik', 900);
  total += await eleleFit(S(ELELE_SRC.iso), 'vaziyet', 1100);
  total += await eleleFit(S(ELELE_SRC.ferforje), 'malzeme', 900);
  // Malzeme paleti çipleri — gerçek dokulardan kare kırpım (fraksiyonlar
  // üretilen çıktı 48px'te görsel doğrulandı: her çip malzemesini okutur).
  total += await eleleSwatch(S(ELELE_SRC.room), 'doku-beton', 0.82, 0.3, 0.11); // beyaz sıva (düz duvar)
  total += await eleleSwatch(S(ELELE_SRC.bath), 'doku-tugla', 0.6, 0.46, 0.13); // doğal taş (bej seramik)
  total += await eleleSwatch(S(ELELE_SRC.room), 'doku-cam', 0.17, 0.38, 0.12); // cam (koyu doğrama + pencere)
  total += await eleleSwatch(S(ELELE_SRC.ferforje), 'doku-metal', 0.45, 0.55, 0.26); // ferforje
  console.log(`el-ele detail: 10 webp, total ${(total / 1024).toFixed(0)} KB`);
}

// Sapanbağları — DETAY SAHNESİ seti. El Ele ile AYNI desen: hasStage'in aradığı
// slug türevli 10 kareyi (salon/mutfak/cephe/izometrik/vaziyet/malzeme + 4 malzeme
// çipi) binanın kendi galerisinden üretir. Karakter KENDİNE ait: beyaz-antrasit
// iki tonlu modern cephe (beyaz beton · antrasit panel · cam · metal). Ana kareler
// yalnız YENİDEN BOYUTLANIR; her slotun oranını sayfadaki CSS object-cover kırpar.
// Malzeme çipleri (48px) gerçek malzeme alanlarından kare kırpımdır. Rerunnable, additive.
const SAPAN_IN = path.join(LIB, 'Buildings_Main_Images/galllery/Sapanbaglari');
const SAPAN_SLUG = 'sapanbaglari';
// Dağınık üretici adları → içerikle doğrulanmış slot eşlemesi.
const SAPAN_SRC = {
  facade: 'ChatGPT Image Jul 12, 2026, 08_39_45 PM.png', // beyaz+antrasit köşe cephe (cam korkuluk, metal doğrama)
  roomWarm: 'ChatGPT Image Jul 12, 2026, 08_39_55 PM.png', // sıcak ışıklı salon, siyah balkon kapısı
  roomWindow: 'ChatGPT Image Jul 12, 2026, 08_39_58 PM.png', // oda + net manzaralı pencere (cam)
  salon: 'ChatGPT Image Jul 12, 2026, 08_41_56 PM.png', // geniş aydınlık salon, kaset tavan
  roomGlass: 'ChatGPT Image Jul 12, 2026, 08_46_31 PM.png', // salon, cam korkuluklu kapı
  iso: 'ChatGPT Image Jul 12, 2026, 08_56_58 PM.png', // aksonometrik bina render (beyaz zemin)
};

async function sapanFit(src, name, width, quality = 80) {
  const out = path.join(PROJECTS_OUT, `${SAPAN_SLUG}-${name}.webp`);
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out);
  return (await stat(out)).size;
}
// Ortalı kare doku çipi: kenar = min(W,H)*k, (fx,fy) oransal merkezde; kenara taşarsa kırpılır.
async function sapanSwatch(src, name, fx, fy, k) {
  const m = await sharp(src).metadata();
  const side = Math.round(Math.min(m.width, m.height) * k);
  const left = Math.max(0, Math.min(Math.round(fx * m.width - side / 2), m.width - side));
  const top = Math.max(0, Math.min(Math.round(fy * m.height - side / 2), m.height - side));
  const out = path.join(PROJECTS_OUT, `${SAPAN_SLUG}-${name}.webp`);
  await sharp(src).extract({ left, top, width: side, height: side }).resize({ width: 352 }).webp({ quality: 82 }).toFile(out);
  return (await stat(out)).size;
}

async function convertSapanbaglariDetail() {
  if (!(await requireSrc(SAPAN_IN))) return;
  await mkdir(PROJECTS_OUT, { recursive: true });
  const S = (f) => path.join(SAPAN_IN, f);
  let total = 0;
  // Ana kareler — yalnız resize; oranı slotun CSS'i kırpar.
  total += await sapanFit(S(SAPAN_SRC.salon), 'salon', 1200); // geniş salon (3:4 + YAŞAM şeridi)
  total += await sapanFit(S(SAPAN_SRC.roomWarm), 'mutfak', 1200); // "İÇ MEKÂN" — sıcak ışıklı salon
  total += await sapanFit(S(SAPAN_SRC.facade), 'cephe-cizim', 1200); // beyaz-antrasit cephe şeridi
  total += await sapanFit(S(SAPAN_SRC.iso), 'izometrik', 900);
  total += await sapanFit(S(SAPAN_SRC.iso), 'vaziyet', 1100); // iso'yu vaziyet için yeniden kullan (El Ele gibi)
  total += await sapanFit(S(SAPAN_SRC.facade), 'malzeme', 900); // cephe detayı (1:1 kolaj)
  // Malzeme paleti çipleri — gerçek malzeme alanlarından kare kırpım (48px'te doğrulandı).
  total += await sapanSwatch(S(SAPAN_SRC.facade), 'doku-beton', 0.41, 0.55, 0.09); // beyaz beton (düz açık cephe dokusu)
  total += await sapanSwatch(S(SAPAN_SRC.facade), 'doku-tugla', 0.75, 0.47, 0.09); // antrasit panel (düz koyu cephe)
  total += await sapanSwatch(S(SAPAN_SRC.roomWindow), 'doku-cam', 0.24, 0.27, 0.15); // cam (manzaralı pencere camı)
  total += await sapanSwatch(S(SAPAN_SRC.roomWarm), 'doku-metal', 0.26, 0.45, 0.1); // metal (siyah doğrama + kol)
  console.log(`sapanbaglari detail: 10 webp, total ${(total / 1024).toFixed(0)} KB`);
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

// `--el-ele-detail` / `--sapanbaglari-detail`: yalnız o binanın detay setini üret
// (tam boru hattını çalıştırıp diğer varlıkları yeniden yazmadan). Argümansız çağrı
// tüm varlıkları küratör eder.
if (process.argv.includes('--el-ele-detail')) {
  await convertElEleDetail();
} else if (process.argv.includes('--sapanbaglari-detail')) {
  await convertSapanbaglariDetail();
} else {
  await convertFrames();
  await convertPhotos();
  await convertShowcase();
  await convertProjects();
  await convertBrand();
  await convertElEleDetail();
  await convertSapanbaglariDetail();
}
