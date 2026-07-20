/*
  Kompakt adalara (React) geçen düz görsel verisi — astro:assets optimizasyonu
  SUNUCUDA yapılır, ada yalnız hazır URL alır (shared/imageVariants.ts ile aynı
  disiplin; buradaki boyut setleri kart/karusel kullanımına göre küçük tutuldu).
  publicAsset() üzerinden geçtiği için filigranlı kareler yapısal olarak kapalı.
*/
import { getImage } from 'astro:assets';
import { shot } from '../media';

export interface FlatImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export interface CarouselItem extends FlatImage {
  key: string;
  caption: string;
  thumb: string;
}

async function widthSet(
  img: Parameters<typeof getImage>[0]['src'],
  widths: number[],
  quality: number
) {
  const out: { src: string; w: number }[] = [];
  for (const width of widths) {
    const g = await getImage({ src: img, width, format: 'webp', quality });
    out.push({ src: g.src, w: width });
  }
  return out;
}

/** Kart görseli: ~400px kolonda keskin, 2x dahil. */
export async function cardImage(key: string): Promise<FlatImage> {
  const { img, alt } = shot(key);
  const set = await widthSet(img, [400, 720], 74);
  return {
    src: set[0].src,
    srcset: set.map((v) => `${v.src} ${v.w}w`).join(', '),
    width: img.width,
    height: img.height,
    alt,
  };
}

/** Karusel karesi: büyük sahne + küçük şerit küçük resmi + tam ekran. */
export async function carouselItem(key: string): Promise<CarouselItem> {
  const { img, alt, caption } = shot(key);
  const main = await widthSet(img, [480, 880, 1440], 76);
  const thumb = await getImage({ src: img, width: 144, format: 'webp', quality: 68 });
  return {
    key,
    src: main[1].src,
    srcset: main.map((v) => `${v.src} ${v.w}w`).join(', '),
    width: img.width,
    height: img.height,
    alt,
    caption,
    thumb: thumb.src,
  };
}

export async function carouselItems(keys: string[]): Promise<CarouselItem[]> {
  const items: CarouselItem[] = [];
  for (const key of keys) items.push(await carouselItem(key));
  return items;
}
