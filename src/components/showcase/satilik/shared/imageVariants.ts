/*
  Lightbox adasına geçen düz veri: astro:assets optimizasyonu SUNUCUDA yapılır,
  React adası yalnız hazır URL'leri alır (adada ImageMetadata taşınmaz).
  getImage tek-genişlik çağrılarıyla kullanılır → dönen nesnenin yalnız .src
  alanına güvenilir (API yüzeyi en garantili biçim).
*/
import { getImage } from 'astro:assets';
import { shot } from '../media';
import type { GalleryGroup } from '../data';

export interface LightboxItem {
  key: string;
  thumb: string;
  thumbSet: string;
  full: string;
  fullSet: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  group: GalleryGroup;
  groupLabel: string;
}

const THUMB_WIDTHS = [360, 640];
const FULL_WIDTHS = [960, 1440];

async function variants(img: Parameters<typeof getImage>[0]['src'], widths: number[]) {
  const out: { src: string; w: number }[] = [];
  for (const width of widths) {
    const g = await getImage({ src: img, width, format: 'webp' });
    out.push({ src: g.src, w: width });
  }
  return out;
}

export async function lightboxItem(
  key: string,
  group: GalleryGroup,
  groupLabel: string
): Promise<LightboxItem> {
  const { img, alt, caption } = shot(key);
  const thumbs = await variants(img, THUMB_WIDTHS);
  const fulls = await variants(img, FULL_WIDTHS);
  return {
    key,
    thumb: thumbs[0].src,
    thumbSet: thumbs.map((v) => `${v.src} ${v.w}w`).join(', '),
    full: fulls[fulls.length - 1].src,
    fullSet: fulls.map((v) => `${v.src} ${v.w}w`).join(', '),
    width: img.width,
    height: img.height,
    alt,
    caption,
    group,
    groupLabel,
  };
}

export async function lightboxItems(
  groups: { group: GalleryGroup; keys: string[] }[],
  labels: Record<string, string>
): Promise<LightboxItem[]> {
  const items: LightboxItem[] = [];
  for (const g of groups) {
    for (const key of g.keys) {
      items.push(await lightboxItem(key, g.group, labels[g.group] ?? g.group));
    }
  }
  return items;
}
