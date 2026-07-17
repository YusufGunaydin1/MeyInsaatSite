/*
  Medya yükleyici — YAYINLANAN kareler src/assets/showcase/satilik/el-ele/
  altındaki izlenen webp kopyalardır; kaynak kütüphane images/for_sale/El_Ele/
  git-dışıdır (public repo) ve CI checkout'unda YOKTUR — deploy 2026-07-16'da bu
  yüzden kırıldı, glob o gün images/'ten buraya taşındı. Kaynak fotoğraflar
  yerinde kalır; yeni kare yayınlamak = scratch encode betiğiyle (sharp, webp
  q82, ≤2000px) buraya BİLEREK kopyalamak. Filigranlı iki kare (manifest
  BLOCKED_KEYS) hiç kopyalanmadı — graf dışı = yayım dışı; publicAsset()
  koruması yedek katmandır.

  Manifest anahtarları tarihsel .png uzantısı taşır; dosyalar artık .webp —
  eşleştirme uzantısız yapılır, anahtarlar her yerde değişmeden kalır.
*/
import type { ImageMetadata } from 'astro';
import { BLOCKED_KEYS, byKey, type MediaEntry } from './manifest';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/showcase/satilik/el-ele/daire-*/*.webp',
  { eager: true }
);

const PREFIX = '/src/assets/showcase/satilik/el-ele/';

/** 'daire-1/d1-salon-alt.png' ↔ 'daire-1/d1-salon-alt.webp' aynı anahtara iner */
const norm = (key: string) => key.replace(/\.(png|jpe?g|webp)$/i, '');

const files = new Map<string, ImageMetadata>(
  Object.entries(modules).map(([path, mod]) => [norm(path.slice(PREFIX.length)), mod.default])
);

const blocked = new Set(BLOCKED_KEYS.map(norm));

/** Vitrinde gösterilecek bir karenin görüntü verisi. Filigranlılarda BİLEREK patlar. */
export function publicAsset(key: string): ImageMetadata {
  if (blocked.has(norm(key))) {
    throw new Error(
      `[satilik] "${key}" üçüncü taraf filigran taşır — public vitrinde kullanılamaz (manifest.ts).`
    );
  }
  const img = files.get(norm(key));
  if (!img) throw new Error(`[satilik] Görsel bulunamadı: ${key} (src/assets/showcase/satilik/el-ele/ altında bekleniyordu)`);
  return img;
}

export function entry(key: string): MediaEntry {
  const e = byKey.get(key);
  if (!e) throw new Error(`[satilik] Manifest kaydı yok: ${key}`);
  return e;
}

/** Sayfalarda tek çağrıyla { img, alt, caption } */
export function shot(key: string): { img: ImageMetadata; alt: string; caption: string; key: string } {
  const e = entry(key);
  return { img: publicAsset(key), alt: e.alt, caption: e.caption, key };
}
