import type { ImageMetadata } from 'astro';

export type MediaOwner = 'daire-1' | 'daire-2';
export type MediaFloor = 'lower' | 'upper' | 'shared' | 'unknown';
export type MediaOrientation = 'landscape' | 'portrait';
export type MediaQuality = 'excellent' | 'good' | 'fair' | 'excluded';
export type DuplicateStatus = 'unique' | 'alternate-angle' | 'near-duplicate' | 'excluded';
export type RecommendedUse = 'hero' | 'gallery' | 'supporting' | 'exclude';
export type GalleryGroup = 'daire-1' | 'daire-2' | 'bina' | 'ortak' | 'cevre';

export type MediaArea =
  | 'lower-living'
  | 'upper-living'
  | 'bedroom'
  | 'lower-kitchen'
  | 'upper-kitchen'
  | 'bathroom'
  | 'stairs'
  | 'corridor'
  | 'balcony'
  | 'terrace'
  | 'view'
  | 'building-exterior'
  | 'entrance'
  | 'parking'
  | 'shared-area'
  | 'neighbourhood-coastline';

export interface SaleMediaItem {
  id: string;
  apartment: MediaOwner;
  file: string;
  sourcePath: string;
  area: MediaArea;
  floor: MediaFloor;
  angle: string;
  orientation: MediaOrientation;
  quality: MediaQuality;
  duplicateStatus: DuplicateStatus;
  duplicateOf?: string;
  recommendedUse: RecommendedUse;
  galleryGroup?: GalleryGroup;
  alt: string;
  note?: string;
  exclusionReason?: string;
  assetFile?: string;
  image?: ImageMetadata;
}

type MediaDraft = Omit<SaleMediaItem, 'id' | 'apartment' | 'file' | 'sourcePath' | 'image'>;

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '../../../assets/showcase/satilik-daireler/*.webp',
  { eager: true }
);

const imageFor = (assetFile?: string) => {
  if (!assetFile) return undefined;
  const key = `../../../assets/showcase/satilik-daireler/${assetFile}`;
  const image = assets[key]?.default;
  if (!image) throw new Error(`Satılık daire medya türevi bulunamadı: ${assetFile}`);
  return image;
};

const item = (apartment: MediaOwner, file: string, draft: MediaDraft): SaleMediaItem => ({
  id: `${apartment === 'daire-1' ? 'd1' : 'd2'}:${file}`,
  apartment,
  file,
  sourcePath: `images/for_sale/El_Ele/${apartment}/${file}`,
  ...draft,
  image: imageFor(draft.assetFile),
});

const d1LegacyNote =
  'Dosya adı eski d2 öneki taşısa da üst klasör yetkilidir; bu görsel Daire 1 envanteridir.';

export const saleMediaManifest: SaleMediaItem[] = [
  item('daire-1', 'bina-dis.png', {
    area: 'building-exterior', floor: 'shared', angle: 'Yüksek açıdan ön cephe', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'hero', galleryGroup: 'bina',
    alt: 'El Ele Apartmanı’nın beyaz cephesi, koyu balkon korkulukları ve çatı katı',
    assetFile: 'project-building-exterior.webp',
  }),
  item('daire-1', 'bina-giris.jpeg', {
    area: 'entrance', floor: 'shared', angle: 'Giriş holünden merdiven ve asansöre bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'ortak',
    alt: 'El Ele Apartmanı giriş holü, merdiven ve asansör kapısı', assetFile: 'project-entrance.webp',
    note: 'Kaynak görselde Mey İnşaat markası bulunur; üçüncü taraf filigranı değildir.',
  }),
  item('daire-1', 'cevre-manzara.png', {
    area: 'neighbourhood-coastline', floor: 'shared', angle: 'Geniş kıyı ve kent görünümü', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'cevre',
    alt: 'Çevreden kıyı, yeşil alan ve kent silueti görünümü', assetFile: 'project-neighbourhood-view.webp',
  }),
  item('daire-1', 'd1-banyo-1.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Kapı eşiğinden geniş banyo görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1’de açık renk yüzeyli banyo ve siyah çerçeveli duş alanı', assetFile: 'd1-bathroom-1.webp',
  }),
  item('daire-1', 'd1-banyo-2.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Lavabo tarafından banyo görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd1:d1-banyo-1.png', recommendedUse: 'exclude',
    alt: 'Daire 1 banyosunun ikinci açısı',
  }),
  item('daire-1', 'd1-manzara-1.png', {
    area: 'view', floor: 'upper', angle: 'Pencere açıklığından su ve ufuk görünümü', orientation: 'landscape',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting', galleryGroup: 'daire-1',
    alt: 'Daire 1 üst kat penceresinden görülen açık ufuk', assetFile: 'd1-window-view.webp',
  }),
  item('daire-1', 'd1-manzara-2.png', {
    area: 'view', floor: 'unknown', angle: 'Pencereden kent dokusuna bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting',
    alt: 'Daire 1 penceresinden kent görünümü',
  }),
  item('daire-1', 'd1-merdiven.png', {
    area: 'stairs', floor: 'shared', angle: 'Alt kattan ahşap basamaklı merdivene bakış', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1’in iki katını bağlayan ahşap basamaklı merdiven', assetFile: 'd1-stairs.webp',
  }),
  item('daire-1', 'd1-mutfak-1.png', {
    area: 'lower-kitchen', floor: 'lower', angle: 'Tezgâh hattı ve balkon kapısını gösteren geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 alt katta açık renk dolaplı uzun mutfak', assetFile: 'd1-lower-kitchen.webp',
  }),
  item('daire-1', 'd1-mutfak-2.png', {
    area: 'lower-kitchen', floor: 'lower', angle: 'Mutfak tezgâhına yakın açı', orientation: 'landscape',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd1:d1-mutfak-1.png', recommendedUse: 'exclude',
    alt: 'Daire 1 alt kat mutfağında tezgâh ve dolaplar',
  }),
  item('daire-1', 'd1-mutfak-balkon.png', {
    area: 'balcony', floor: 'lower', angle: 'Mutfaktan balkon kapısına bakış', orientation: 'landscape',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting',
    alt: 'Daire 1 mutfağından balkona açılan kapı',
  }),
  item('daire-1', 'd1-oda-1.png', {
    area: 'bedroom', floor: 'lower', angle: 'Odanın pencere ve kapı bağlantısını gösteren geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 alt katta pencereli oda', assetFile: 'd1-bedroom-1.webp',
  }),
  item('daire-1', 'd1-oda-2a.png', {
    area: 'bedroom', floor: 'unknown', angle: 'Pencereye doğru oda görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1’de açık renk zeminli ikinci oda', assetFile: 'd1-bedroom-2.webp',
  }),
  item('daire-1', 'd1-oda-2b.png', {
    area: 'bedroom', floor: 'unknown', angle: 'Aynı odanın çok yakın ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd1:d1-oda-2a.png', recommendedUse: 'exclude',
    alt: 'Daire 1 ikinci odanın alternatif görünümü',
  }),
  item('daire-1', 'd1-oda-3a.png', {
    area: 'bedroom', floor: 'upper', angle: 'Eğimli tavan ve çatı penceresini gösteren açı', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 üst katta eğimli tavanlı oda', assetFile: 'd1-bedroom-3.webp',
  }),
  item('daire-1', 'd1-oda-3b.png', {
    area: 'bedroom', floor: 'upper', angle: 'Aynı üst odanın karşı açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd1:d1-oda-3a.png', recommendedUse: 'exclude',
    alt: 'Daire 1 üst kat odasının ikinci açısı',
  }),
  item('daire-1', 'd1-salon-alt.png', {
    area: 'lower-living', floor: 'lower', angle: 'Balkon kapısı ve iki pencereyi alan geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'hero', galleryGroup: 'daire-1',
    alt: 'Daire 1 alt kat salonu, balkon kapısı ve geniş pencereler', assetFile: 'd1-lower-living.webp',
  }),
  item('daire-1', 'd1-salon-ust-1.png', {
    area: 'upper-living', floor: 'upper', angle: 'Üst salonun terasa doğru geniş görünümü', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 üst kat salonu ve terasa açılan kapı', assetFile: 'd1-upper-living.webp',
  }),
  item('daire-1', 'd1-salon-ust-2.png', {
    area: 'upper-living', floor: 'upper', angle: 'Üst salonun mutfak tarafından görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', duplicateOf: 'd1:d1-salon-ust-1.png', recommendedUse: 'supporting',
    alt: 'Daire 1 üst kat salonunun ikinci görünümü',
  }),
  item('daire-1', 'd1-teras-1.png', {
    area: 'terrace', floor: 'upper', angle: 'Teras köşesinden açık ufka bakış', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 terası ve açık ufuk görünümü', assetFile: 'd1-terrace-sea.webp',
  }),
  item('daire-1', 'd1-teras-2.png', {
    area: 'terrace', floor: 'upper', angle: 'Korkuluk üzerinden kıyı yönüne bakış', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', duplicateOf: 'd1:d1-teras-3.png', recommendedUse: 'supporting',
    alt: 'Daire 1 terasından çevre görünümü',
  }),
  item('daire-1', 'd1-teras-3.png', {
    area: 'terrace', floor: 'upper', angle: 'Teras ve çevreyi birlikte gösteren panoramik açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'hero', galleryGroup: 'daire-1',
    alt: 'Daire 1’in geniş terası ve panoramik çevre görünümü', assetFile: 'd1-terrace-panorama.webp',
  }),
  item('daire-1', 'd2-balkon.png', {
    area: 'balcony', floor: 'unknown', angle: 'Balkon boyunca dışa bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting', galleryGroup: 'daire-1',
    alt: 'Daire 1 balkon alanı ve ferforje korkuluk', assetFile: 'd1-balcony.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-banyo-1.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Yüksek açıdan duş, lavabo ve klozet görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1’de siyah çerçeveli duş bölümü bulunan ikinci banyo', assetFile: 'd1-bathroom-2.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-banyo-2.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Aynı banyonun geniş ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd1:d2-banyo-1.png', recommendedUse: 'exclude',
    alt: 'Daire 1 ikinci banyosunun alternatif açısı', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-koridor.png', {
    area: 'corridor', floor: 'lower', angle: 'Merdiven ve odaları bağlayan uzun koridor', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 alt katta merdiven ve odalara uzanan koridor', assetFile: 'd1-corridor.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-merdiven.png', {
    area: 'stairs', floor: 'shared', angle: 'Merdiven basamaklarına yandan yakın bakış', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'supporting',
    alt: 'Daire 1 ahşap basamaklı merdiveninin yan görünümü', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-mutfak-ust.png', {
    area: 'upper-kitchen', floor: 'upper', angle: 'Eğimli tavan altında mutfak hattı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 üst katta eğimli tavan altındaki ikinci mutfak', assetFile: 'd1-upper-kitchen.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-oda-1.png', {
    area: 'bedroom', floor: 'unknown', angle: 'Pencereye doğru geniş oda açısı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'supporting',
    alt: 'Daire 1’de geniş pencereli oda', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-oda-2.png', {
    area: 'bedroom', floor: 'upper', angle: 'Eğimli tavanlı odaya giriş açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting',
    alt: 'Daire 1 üst katta eğimli tavanlı oda', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-salon-alt.png', {
    area: 'lower-living', floor: 'lower', angle: 'Salonun pencere ve balkon kapısını alan geniş açısı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 alt katta iki cepheden ışık alan salon', assetFile: 'd1-lower-living-wide.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-salon-ust.png', {
    area: 'upper-living', floor: 'upper', angle: 'Merdiven boşluğu ve üst yaşam alanı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-1',
    alt: 'Daire 1 üst katta merdiven çevresindeki ikinci salon', assetFile: 'd1-upper-living-wide.webp', note: d1LegacyNote,
  }),
  item('daire-1', 'd2-teras.png', {
    area: 'terrace', floor: 'upper', angle: 'Uzun teras boyunca bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting',
    alt: 'Daire 1 üst kattaki uzun teras alanı', note: d1LegacyNote,
  }),
  item('daire-1', 'otopark.png', {
    area: 'parking', floor: 'shared', angle: 'Kapalı otoparkın genel görünümü', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'ortak',
    alt: 'El Ele Apartmanı kapalı otopark ortak alanı', assetFile: 'project-parking.webp',
  }),

  item('daire-2', 'cevre-deniz.png', {
    area: 'neighbourhood-coastline', floor: 'shared', angle: 'Kıyı çizgisinden deniz görünümü', orientation: 'landscape',
    quality: 'excluded', duplicateStatus: 'excluded', recommendedUse: 'exclude',
    alt: 'Kıyıdan deniz görünümü',
    exclusionReason: 'Üçüncü taraf emlak filigranı ve referans numarası içerdiği için halka açık vitrinde kullanılamaz.',
  }),
  item('daire-2', 'cevre-sahil-1.png', {
    area: 'neighbourhood-coastline', floor: 'shared', angle: 'Sahil yeşil alanı boyunca geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'cevre',
    alt: 'Çevreden sahil kenarındaki ağaçlı yeşil alan', assetFile: 'environment-coast-1.webp',
  }),
  item('daire-2', 'cevre-sahil-2.png', {
    area: 'neighbourhood-coastline', floor: 'shared', angle: 'Yürüyüş yolundan park görünümü', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', duplicateOf: 'd2:cevre-sahil-1.png', recommendedUse: 'gallery', galleryGroup: 'cevre',
    alt: 'Çevreden sahil parkı ve yürüyüş yolu görünümü', assetFile: 'environment-coast-2.webp',
  }),
  item('daire-2', 'd2-balkon.png', {
    area: 'balcony', floor: 'unknown', angle: 'Balkon köşesinden korkuluğa bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'supporting', galleryGroup: 'daire-2',
    alt: 'Daire 2 balkon alanı ve ferforje korkuluk', assetFile: 'd2-balcony.webp',
  }),
  item('daire-2', 'd2-banyo-1a.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Kapı eşiğinden lavabo, duş ve klozet görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 açık renk banyosu ve siyah çerçeveli duş alanı', assetFile: 'd2-bathroom-1.webp',
  }),
  item('daire-2', 'd2-banyo-1b.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Aynı banyonun çok yakın ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd2:d2-banyo-1a.png', recommendedUse: 'exclude',
    alt: 'Daire 2 birinci banyosunun alternatif açısı',
  }),
  item('daire-2', 'd2-banyo-2.png', {
    area: 'bathroom', floor: 'unknown', angle: 'Köşeden ikinci banyo görünümü', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 ikinci banyosu, duş alanı ve lavabo', assetFile: 'd2-bathroom-2.webp',
  }),
  item('daire-2', 'd2-koridor.png', {
    area: 'corridor', floor: 'upper', angle: 'Merdiven korkuluğundan odalara doğru bakış', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst kat koridoru ve oda kapıları', assetFile: 'd2-corridor.webp',
  }),
  item('daire-2', 'd2-merdiven-1.png', {
    area: 'stairs', floor: 'shared', angle: 'Koridorla birlikte tüm merdiven hattı', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2’de alt ve üst katı bağlayan ahşap basamaklı merdiven', assetFile: 'd2-stairs.webp',
  }),
  item('daire-2', 'd2-merdiven-2.png', {
    area: 'stairs', floor: 'shared', angle: 'Basamaklara yakın yandan görünüm', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', duplicateOf: 'd2:d2-merdiven-1.png', recommendedUse: 'supporting',
    alt: 'Daire 2 merdiveninin yakın görünümü', assetFile: 'd2-stairs-detail.webp',
  }),
  item('daire-2', 'd2-mutfak-alt.png', {
    area: 'lower-kitchen', floor: 'lower', angle: 'Uzun tezgâh hattından balkon kapısına bakış', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 alt katta açık renk dolaplı uzun mutfak', assetFile: 'd2-lower-kitchen.webp',
  }),
  item('daire-2', 'd2-mutfak-ust.png', {
    area: 'upper-kitchen', floor: 'upper', angle: 'Eğimli tavan altında mutfak nişi', orientation: 'landscape',
    quality: 'good', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst katta eğimli tavan altındaki mutfak', assetFile: 'd2-upper-kitchen.webp',
  }),
  item('daire-2', 'd2-oda-1a.png', {
    area: 'bedroom', floor: 'unknown', angle: 'Pencereyi karşılayan oda görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2’de pencereli birinci oda', assetFile: 'd2-bedroom-1.webp',
  }),
  item('daire-2', 'd2-oda-1b.png', {
    area: 'bedroom', floor: 'unknown', angle: 'Aynı odanın çok yakın ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd2:d2-oda-1a.png', recommendedUse: 'exclude',
    alt: 'Daire 2 birinci odanın alternatif açısı',
  }),
  item('daire-2', 'd2-oda-2a.png', {
    area: 'bedroom', floor: 'upper', angle: 'Eğimli tavan ve çatı penceresini gösteren geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst katta eğimli tavanlı ikinci oda', assetFile: 'd2-bedroom-2.webp',
  }),
  item('daire-2', 'd2-oda-2b.png', {
    area: 'bedroom', floor: 'upper', angle: 'Aynı odanın dikey ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd2:d2-oda-2a.png', recommendedUse: 'exclude',
    alt: 'Daire 2 ikinci odanın alternatif açısı',
  }),
  item('daire-2', 'd2-oda-3a.png', {
    area: 'bedroom', floor: 'upper', angle: 'Çatı penceresine doğru geniş oda açısı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst katta çatı pencereli üçüncü oda', assetFile: 'd2-bedroom-3.webp',
  }),
  item('daire-2', 'd2-oda-3b.png', {
    area: 'bedroom', floor: 'upper', angle: 'Aynı odanın dikey ikinci açısı', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'near-duplicate', duplicateOf: 'd2:d2-oda-3a.png', recommendedUse: 'exclude',
    alt: 'Daire 2 üçüncü odanın alternatif açısı',
  }),
  item('daire-2', 'd2-salon-alt-1.png', {
    area: 'lower-living', floor: 'lower', angle: 'Salonun tamamını kapıdan pencereye gösteren geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'hero', galleryGroup: 'daire-2',
    alt: 'Daire 2 alt kat salonunun geniş görünümü', assetFile: 'd2-lower-living.webp',
  }),
  item('daire-2', 'd2-salon-alt-2.png', {
    area: 'lower-living', floor: 'lower', angle: 'Balkon kapısı ve pencereyi karşılayan salon açısı', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'alternate-angle', duplicateOf: 'd2:d2-salon-alt-1.png', recommendedUse: 'supporting',
    alt: 'Daire 2 alt kat salonu ve balkon kapısı', assetFile: 'd2-lower-living-alt.webp',
  }),
  item('daire-2', 'd2-salon-ust-1.png', {
    area: 'upper-living', floor: 'upper', angle: 'Mutfak nişi ve teras kapısını alan geniş açı', orientation: 'landscape',
    quality: 'excellent', duplicateStatus: 'alternate-angle', recommendedUse: 'hero', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst kat salonu, mutfak nişi ve teras kapısı', assetFile: 'd2-upper-living.webp',
  }),
  item('daire-2', 'd2-salon-ust-2.png', {
    area: 'upper-living', floor: 'upper', angle: 'Üst salonun karşı köşeden görünümü', orientation: 'portrait',
    quality: 'good', duplicateStatus: 'alternate-angle', duplicateOf: 'd2:d2-salon-ust-1.png', recommendedUse: 'supporting',
    alt: 'Daire 2 üst kat salonunun ikinci açısı', assetFile: 'd2-upper-living-alt.webp',
  }),
  item('daire-2', 'd2-teras.png', {
    area: 'terrace', floor: 'upper', angle: 'Terasın köşeden genel görünümü', orientation: 'portrait',
    quality: 'excellent', duplicateStatus: 'unique', recommendedUse: 'gallery', galleryGroup: 'daire-2',
    alt: 'Daire 2 üst kat teras alanı', assetFile: 'd2-terrace.webp',
  }),
];

const mediaIndex = new Map(saleMediaManifest.map((media) => [media.id, media]));

export const getSaleMedia = (id: string) => {
  const media = mediaIndex.get(id);
  if (!media) throw new Error(`Satılık daire medya kaydı bulunamadı: ${id}`);
  return media;
};

export const getSaleMediaList = (ids: readonly string[]) => ids.map(getSaleMedia);

export const publicSaleMedia = saleMediaManifest.filter(
  (media) => media.image && media.recommendedUse !== 'exclude' && media.quality !== 'excluded'
);

export const mediaInventorySummary = {
  total: saleMediaManifest.length,
  daire1: saleMediaManifest.filter((media) => media.apartment === 'daire-1').length,
  daire2: saleMediaManifest.filter((media) => media.apartment === 'daire-2').length,
  selected: publicSaleMedia.length,
  excluded: saleMediaManifest.filter((media) => media.recommendedUse === 'exclude').length,
  watermarkedExcluded: saleMediaManifest.some(
    (media) => media.file === 'cevre-deniz.png' && media.recommendedUse === 'exclude' && !media.image
  ),
};
