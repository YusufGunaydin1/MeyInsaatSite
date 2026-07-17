import type { ImageMetadata } from 'astro';
import {
  gallerySelection,
  saleContent,
  type ApartmentSlug,
} from '../satilik-daireler/data';
import {
  getSaleMedia,
  getSaleMediaList,
  type GalleryGroup,
  type MediaArea,
  type SaleMediaItem,
} from '../satilik-daireler/media';

export const FINAL_SALE_ROOT = '/showcases/satilik-daireler';

export type FinalSalePage =
  | ''
  | ApartmentSlug
  | 'el-ele-apartmani'
  | 'galeri'
  | 'iletisim';

export const finalSalePath = (page: FinalSalePage = '') =>
  `${FINAL_SALE_ROOT}${page ? `/${page}` : ''}`;

export const mainNavigation: ReadonlyArray<{ href: string; label: string; active?: boolean }> = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/projeler', label: 'Projeler' },
  { href: FINAL_SALE_ROOT, label: 'Satılık Daireler', active: true },
  { href: '/kurumsal', label: 'Kurumsal' },
  { href: '/hizmetler', label: 'Hizmetler' },
  { href: '/iletisim', label: 'İletişim' },
];

export const buyerNavigation = [
  { href: finalSalePath(), label: 'Genel Bakış' },
  { href: finalSalePath('daire-1'), label: 'Daire 1' },
  { href: finalSalePath('daire-2'), label: 'Daire 2' },
  { href: finalSalePath('el-ele-apartmani'), label: 'El Ele Apartmanı' },
  { href: finalSalePath('galeri'), label: 'Galeri' },
  { href: finalSalePath('iletisim'), label: 'Randevu' },
] as const;

export const compactSaleContent = saleContent;

export type DetailSectionKey =
  | 'living'
  | 'kitchen'
  | 'bedrooms'
  | 'bathrooms'
  | 'stairs'
  | 'outdoor';

export interface DetailSection {
  key: DetailSectionKey;
  eyebrow: string;
  title: string;
  body: string;
  mediaIds: readonly string[];
}

export interface FinalApartmentPresentation {
  slug: ApartmentSlug;
  visualCue: string;
  cardMediaId: string;
  heroMediaIds: readonly string[];
  lowerMediaIds: readonly string[];
  upperMediaIds: readonly string[];
  sections: readonly DetailSection[];
}

export const apartmentPresentations: Record<ApartmentSlug, FinalApartmentPresentation> = {
  'daire-1': {
    slug: 'daire-1',
    visualCue: 'Teras, açık ufuk ve iki ayrı yaşam alanı',
    cardMediaId: 'd1:d2-salon-alt.png',
    heroMediaIds: [
      'd1:d1-teras-3.png',
      'd1:d2-salon-alt.png',
      'd1:d2-salon-ust.png',
      'd1:d1-mutfak-1.png',
    ],
    lowerMediaIds: ['d1:d2-salon-alt.png', 'd1:d1-mutfak-1.png'],
    upperMediaIds: ['d1:d2-salon-ust.png', 'd1:d1-teras-1.png'],
    sections: [
      {
        key: 'living',
        eyebrow: 'Yaşam alanları',
        title: 'İki katta iki farklı buluşma alanı',
        body: 'Alt ve üst kattaki salon kareleri, evin iki katındaki yaşam alanlarını ayrı ayrı gösteriyor.',
        mediaIds: ['d1:d2-salon-alt.png', 'd1:d2-salon-ust.png'],
      },
      {
        key: 'kitchen',
        eyebrow: 'Mutfaklar',
        title: 'Alt ve üst kat mutfakları',
        body: 'Fotoğraflar iki kattaki mutfak yüzeylerini ve mekânlarla kurdukları bağlantıyı gösterir; ölçü ve marka bilgisi içermez.',
        mediaIds: ['d1:d1-mutfak-1.png', 'd1:d2-mutfak-ust.png'],
      },
      {
        key: 'bedrooms',
        eyebrow: 'Odalar',
        title: 'Düz ve eğimli tavanlı oda karakterleri',
        body: 'Alt kattaki oda ile üst kattaki eğimli tavanlı oda, farklı mekânsal karakterleri fotoğraflarla görünür kılıyor.',
        mediaIds: ['d1:d1-oda-1.png', 'd1:d1-oda-3a.png'],
      },
      {
        key: 'bathrooms',
        eyebrow: 'Banyolar',
        title: 'İki banyo görünümü',
        body: 'Banyo kareleri mevcut yüzeyleri ve düzeni gösterir; teknik ürün veya malzeme markası iddiası taşımaz.',
        mediaIds: ['d1:d1-banyo-1.png', 'd1:d2-banyo-1.png'],
      },
      {
        key: 'stairs',
        eyebrow: 'Merdiven',
        title: 'Katları bağlayan görünür geçiş',
        body: 'Ahşap basamaklı merdiven, alt ve üst kat anlatıları arasındaki bağlantıyı açıkça kuruyor.',
        mediaIds: ['d1:d1-merdiven.png'],
      },
      {
        key: 'outdoor',
        eyebrow: 'Balkon, teras ve görünüm',
        title: 'Açık hava kareleriyle tamamlanan seçki',
        body: 'Balkon, teras ve pencere görünümü mevcut fotoğraflara dayanır; yön, mesafe veya manzara sürekliliği iddiası içermez.',
        mediaIds: ['d1:d2-balkon.png', 'd1:d1-teras-1.png', 'd1:d1-manzara-1.png'],
      },
    ],
  },
  'daire-2': {
    slug: 'daire-2',
    visualCue: 'Belirgin merdiven hattı ve üst kat yaşam düzeni',
    cardMediaId: 'd2:d2-salon-ust-1.png',
    heroMediaIds: [
      'd2:d2-merdiven-1.png',
      'd2:d2-salon-ust-1.png',
      'd2:d2-salon-alt-1.png',
      'd2:d2-mutfak-alt.png',
    ],
    lowerMediaIds: ['d2:d2-salon-alt-1.png', 'd2:d2-mutfak-alt.png'],
    upperMediaIds: ['d2:d2-salon-ust-1.png', 'd2:d2-teras.png'],
    sections: [
      {
        key: 'stairs',
        eyebrow: 'Merdiven',
        title: 'İki katı tek bir hat üzerinde okuyun',
        body: 'Merdiven ve koridor kareleri, alt kattan üst kattaki odalara ve yaşam alanına ilerleyen geçişi gösteriyor.',
        mediaIds: ['d2:d2-merdiven-1.png', 'd2:d2-koridor.png'],
      },
      {
        key: 'living',
        eyebrow: 'Yaşam alanları',
        title: 'Alt ve üst katta farklı salon düzenleri',
        body: 'İki salon fotoğrafı, düz tavanlı alt kat ile eğimli tavanlı üst katın görsel farkını yan yana getiriyor.',
        mediaIds: ['d2:d2-salon-alt-1.png', 'd2:d2-salon-ust-1.png'],
      },
      {
        key: 'kitchen',
        eyebrow: 'Mutfaklar',
        title: 'Doğrusal alt mutfak, kompakt üst mutfak',
        body: 'Mutfak kareleri görünen yerleşimi anlatır; ölçü, donanım ve malzeme markaları için bilgi bekleniyor.',
        mediaIds: ['d2:d2-mutfak-alt.png', 'd2:d2-mutfak-ust.png'],
      },
      {
        key: 'bedrooms',
        eyebrow: 'Odalar',
        title: 'Üst kattaki çatı geometrisi',
        body: 'Oda seçkisi, düz tavanlı bir oda ile çatı pencereli ve eğimli tavanlı üst kat odalarını gösteriyor.',
        mediaIds: ['d2:d2-oda-1a.png', 'd2:d2-oda-2a.png', 'd2:d2-oda-3a.png'],
      },
      {
        key: 'bathrooms',
        eyebrow: 'Banyolar',
        title: 'Mevcut iki banyo karesi',
        body: 'Fotoğraflar banyo düzenlerini gösterir; teknik sistem, ürün ve marka bilgileri ayrıca teyit edilmelidir.',
        mediaIds: ['d2:d2-banyo-1a.png', 'd2:d2-banyo-2.png'],
      },
      {
        key: 'outdoor',
        eyebrow: 'Balkon ve teras',
        title: 'İki katta açık hava bağlantısı',
        body: 'Balkon ve teras görselleri mevcut alanları gösterir; yön, alan veya manzara iddiası eklenmez.',
        mediaIds: ['d2:d2-balkon.png', 'd2:d2-teras.png'],
      },
    ],
  },
};

export const buildingMedia = {
  exterior: getSaleMedia('d1:bina-dis.png'),
  entrance: getSaleMedia('d1:bina-giris.jpeg'),
  parking: getSaleMedia('d1:otopark.png'),
  neighbourhood: getSaleMedia('d1:cevre-manzara.png'),
  coast: getSaleMedia('d2:cevre-sahil-1.png'),
};

export const homeGalleryMedia = getSaleMediaList([
  'd1:d2-salon-alt.png',
  'd2:d2-salon-ust-1.png',
  'd1:d1-teras-3.png',
  'd2:d2-merdiven-1.png',
  'd1:bina-giris.jpeg',
  'd1:otopark.png',
]);

const areaLabels: Partial<Record<MediaArea, string>> = {
  'lower-living': 'Alt kat salonu',
  'upper-living': 'Üst kat salonu',
  bedroom: 'Oda',
  'lower-kitchen': 'Alt kat mutfağı',
  'upper-kitchen': 'Üst kat mutfağı',
  bathroom: 'Banyo',
  stairs: 'Merdiven',
  corridor: 'Koridor',
  balcony: 'Balkon',
  terrace: 'Teras',
  view: 'Görünüm',
  'building-exterior': 'Bina dışı',
  entrance: 'Giriş ve ortak alan',
  parking: 'Kapalı otopark',
  'neighbourhood-coastline': 'Çevre',
};

export interface FinalPhotoItem {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  group: GalleryGroup;
  groupLabel: string;
}

export const toFinalPhoto = (
  media: SaleMediaItem,
  group: GalleryGroup,
  groupLabel: string,
): FinalPhotoItem => {
  if (!media.image) throw new Error(`Kompakt galeri için medya türevi bulunamadı: ${media.id}`);
  return {
    id: media.id,
    src: media.image.src,
    width: media.image.width,
    height: media.image.height,
    alt: media.alt,
    label: areaLabels[media.area] ?? groupLabel,
    group,
    groupLabel,
  };
};

const galleryGroupLabels: Record<GalleryGroup, string> = {
  'daire-1': 'Daire 1',
  'daire-2': 'Daire 2',
  bina: 'Bina',
  ortak: 'Ortak alanlar',
  cevre: 'Çevre',
};

const orderedGalleryGroups: GalleryGroup[] = ['daire-1', 'daire-2', 'bina', 'ortak', 'cevre'];

export const fullGalleryItems = orderedGalleryGroups.flatMap((group) =>
  getSaleMediaList(gallerySelection[group]).map((media) =>
    toFinalPhoto(media, group, galleryGroupLabels[group]),
  ),
);

export const galleryFilters = [
  { id: 'all', label: 'Tümü' },
  ...orderedGalleryGroups.map((id) => ({ id, label: galleryGroupLabels[id] })),
] as const;

export const detailPhotos = (slug: ApartmentSlug) => {
  const groupLabel = compactSaleContent.apartments[slug].name;
  return getSaleMediaList(apartmentPresentations[slug].heroMediaIds).map((media) =>
    toFinalPhoto(media, slug, groupLabel),
  );
};

export const imageMetadata = (media: SaleMediaItem): ImageMetadata => {
  if (!media.image) throw new Error(`Kompakt sayfa için medya türevi bulunamadı: ${media.id}`);
  return media.image;
};
