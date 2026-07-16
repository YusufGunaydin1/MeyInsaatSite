/*
  Medya yükleyici — kaynak fotoğraflar images/for_sale/El_Ele/ altında YERİNDE kalır
  (taşıma/kopyalama yok); Vite glob'u proje kökünden içe aktarır, astro:assets
  build'de WebP + duyarlı boyutlar üretir.

  publicAsset(): üçüncü taraf filigranlı kareleri YAPISAL olarak engeller —
  yanlışlıkla bile render edilemesinler (manifest BLOCKED_KEYS).
*/
import type { ImageMetadata } from 'astro';
import { BLOCKED_KEYS, byKey, type MediaEntry } from './manifest';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/images/for_sale/El_Ele/daire-*/*.{png,jpeg}',
  { eager: true }
);

const PREFIX = '/images/for_sale/El_Ele/';

const files = new Map<string, ImageMetadata>(
  Object.entries(modules).map(([path, mod]) => [path.slice(PREFIX.length), mod.default])
);

const blocked = new Set(BLOCKED_KEYS);

/** Vitrinde gösterilecek bir karenin görüntü verisi. Filigranlılarda BİLEREK patlar. */
export function publicAsset(key: string): ImageMetadata {
  if (blocked.has(key)) {
    throw new Error(
      `[satilik] "${key}" üçüncü taraf filigran taşır — public vitrinde kullanılamaz (manifest.ts).`
    );
  }
  const img = files.get(key);
  if (!img) throw new Error(`[satilik] Görsel bulunamadı: ${key} (images/for_sale/El_Ele/ altında bekleniyordu)`);
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
