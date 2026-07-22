/*
  SATILIK DAİRELER — KOMPAKT veri modeli.

  D-12 (satıştaki TEK daire) 100% GERÇEK — sahibinden ilanı 1317631166
  (21.07.2026): 160/135 m², 5. kat çatı dubleksi, 5 katlı sıfır bina,
  13.750.000 TL. Bu dairenin hiçbir alanı tahmin değildir.

  Diğer sayılar İÇ TAHMİNDİR (D-11 dışındaki 8 daire ve m²'leri, D-11'in m²/kat'ı,
  oda ölçüleri, çevre mesafeleri, kat planı m², ödeme oranları). `mock: true` bunu
  KOD düzeyinde işaretler; kullanıcıya "temsilî" olarak SUNULMAZ — arayüzdeki
  temsilî çip ve notlar kaldırıldı. Yeni doğrulanan bilgi geldikçe ilgili tahmini
  gerçek değerle değiştir (D-12 gibi).

  Gerçek çekirdek ../data.ts'ten gelir: El Ele Apartmanı, Mey İnşaat, iki 3+2
  dubleks; D-11 yakın zamanda satıldı, D-12 satışta.
*/
import { daire1, daire2, building } from '../data';
import type { MapCoordinates } from '../../../../lib/maps';
import elEleProjectData from '../../../../../content/projects/el-ele-apartmani/data.json';

const verifiedElEle = elEleProjectData as {
  location: string;
  coordinates: MapCoordinates;
};

export const RECENTLY_SOLD_LABEL = 'YAKIN ZAMANDA SATILDI';

export const tl = (n: number) => n.toLocaleString('tr-TR') + ' TL';

/* ─── Proje üst bilgisi (stat bar) ─── */
export const proje = {
  ad: building.name,
  slug: 'el-ele-apartmani',
  lokasyon: 'Batı Mah., Pendik / İstanbul',
  /** MEY'in doğruladığı açık adres — harita bağlantıları bundan türetilir */
  adres: verifiedElEle.location,
  coordinates: verifiedElEle.coordinates,
  toplamDaire: 10,
  blok: 1,
  kat: 6,
  teslim: 'Hazır — sıfır',
  durum: 'Tamamlandı',
};

/* ─── Daire envanteri ───
   D-12 = 13.750.000 TL, müsait, sahibinden ilanıyla GERÇEK (160/135 m², 5. kat).
   D-11 = yakın zamanda satıldı (gerçek); m²/kat İÇ TAHMİN (D-12'nin ikizi).
   Kalan 8 daire İÇ TAHMİN doluluk — satılmış gösterilir, fiyat taşımaz;
   arayüzde tahmin olduğu belirtilmez. */
export type Durum = 'musait' | 'rezerve' | 'satildi';

export interface KUnit {
  id: string;
  mock: true;
  /** gerçek vitrin dairesi ise ../data.ts kimliği */
  apartmentId?: 'daire-1' | 'daire-2';
  no: string;
  kat: string;
  /** filtre anahtarı */
  katKey: '1' | '2' | '3' | '4' | '5-6';
  tip: '3+1' | '3+2 Dubleks';
  oda: '3+1' | '3+2';
  brut: number;
  net: number;
  fiyat: number | null;
  durum: Durum;
  cephe: string;
  badge?: string;
  /** manifest media anahtarı (yalnız gerçek daireler) */
  foto?: string;
  /** detay sayfası (yalnız gerçek daireler) */
  detay?: 'daire-1' | 'daire-2';
}

export const units: KUnit[] = [
  // D-11 — gerçek (yakın zamanda satıldı); brut/net/kat İÇ TAHMİN (D-12'nin ikizi).
  {
    id: 'd11', mock: true, apartmentId: 'daire-1', no: 'D-11', kat: '5. Kat', katKey: '5-6',
    tip: '3+2 Dubleks', oda: '3+2', brut: 182, net: 148, fiyat: null, durum: 'satildi',
    cephe: 'Deniz — teras katı', badge: RECENTLY_SOLD_LABEL, foto: 'daire-1/d1-salon-alt.png', detay: 'daire-1',
  },
  // D-12 — 100% GERÇEK (sahibinden ilan 1317631166): 160/135 m², 5. kat çatı dubleksi.
  {
    id: 'd12', mock: true, apartmentId: 'daire-2', no: 'D-12', kat: '5. Kat', katKey: '5-6',
    tip: '3+2 Dubleks', oda: '3+2', brut: 160, net: 135, fiyat: 13_750_000, durum: 'musait',
    cephe: 'Çatı avlusu — şehir', badge: 'SON DAİRE', foto: 'daire-2/d2-salon-ust-1.png', detay: 'daire-2',
  },
  ...([
    ['d41', 'D-8', '4. Kat', '4', 'Güney'], ['d42', 'D-7', '4. Kat', '4', 'Kuzey'],
    ['d31', 'D-6', '3. Kat', '3', 'Güney'], ['d32', 'D-5', '3. Kat', '3', 'Kuzey'],
    ['d21', 'D-4', '2. Kat', '2', 'Güney'], ['d22', 'D-3', '2. Kat', '2', 'Kuzey'],
    ['d1a', 'D-2', '1. Kat', '1', 'Güney'], ['d1b', 'D-1', '1. Kat', '1', 'Kuzey'],
  ] as const).map(([id, no, kat, katKey, cephe]): KUnit => ({
    id, mock: true, no, kat, katKey, tip: '3+1', oda: '3+1',
    brut: 128, net: 104, fiyat: null, durum: 'satildi', cephe,
  })),
];

export const unitById = (id: string) => units.find((u) => u.id === id);
export const satistakiDaireler = units.filter((u) => u.apartmentId && u.durum === 'musait');
export const satistakiDaireSayisi = satistakiDaireler.length;

/* ─── Müsaitlik matrisi (kat × daire) ─── */
export interface MatrixCell {
  label: string;
  sub?: string;
  durum: Durum | 'yok';
}
export interface MatrixRow {
  kat: string;
  cells: [MatrixCell, MatrixCell];
}

export const matris: { rows: MatrixRow[]; legend: { durum: Durum; label: string }[] } = {
  rows: [
    { kat: 'ÇATI', cells: [
      { label: 'D-11 üst kat', sub: 'teras', durum: 'satildi' },
      { label: 'D-12 üst kat', sub: 'teras', durum: 'musait' },
    ] },
    { kat: '5. KAT', cells: [
      { label: 'D-11', sub: '3+2 dubleks', durum: 'satildi' },
      { label: 'D-12', sub: '3+2 dubleks', durum: 'musait' },
    ] },
    { kat: '4. KAT', cells: [
      { label: 'D-8', sub: '3+1', durum: 'satildi' },
      { label: 'D-7', sub: '3+1', durum: 'satildi' },
    ] },
    { kat: '3. KAT', cells: [
      { label: 'D-6', sub: '3+1', durum: 'satildi' },
      { label: 'D-5', sub: '3+1', durum: 'satildi' },
    ] },
    { kat: '2. KAT', cells: [
      { label: 'D-4', sub: '3+1', durum: 'satildi' },
      { label: 'D-3', sub: '3+1', durum: 'satildi' },
    ] },
    { kat: '1. KAT', cells: [
      { label: 'D-2', sub: '3+1', durum: 'satildi' },
      { label: 'D-1', sub: '3+1', durum: 'satildi' },
    ] },
    { kat: 'ZEMİN', cells: [
      { label: 'Giriş', durum: 'yok' },
      { label: 'Kapalı otopark', durum: 'yok' },
    ] },
  ],
  legend: [
    { durum: 'musait', label: 'Müsait' },
    { durum: 'rezerve', label: 'Rezerve' },
    { durum: 'satildi', label: 'Satıldı' },
  ],
};

/* ─── Yakın çevre — mesafeler İÇ TAHMİN (arayüzde temsilî denmez; netleşince değiştir) ─── */
export interface Yer { ad: string; mesafe: string; icon: string }
export const yakinCevre: Yer[] = [
  { ad: 'Sahil & yürüyüş parkuru', mesafe: '350 m', icon: 'park' },
  { ad: 'Market & fırın', mesafe: '400 m', icon: 'cart' },
  { ad: 'Eczane', mesafe: '300 m', icon: 'plus' },
  { ad: 'İlkokul', mesafe: '650 m', icon: 'school' },
  { ad: 'Marmaray / metro', mesafe: '1,4 km', icon: 'train' },
  { ad: 'Devlet hastanesi', mesafe: '2,1 km', icon: 'hospital' },
];

/* ─── Neden El Ele (foto destekli nitelikler — ../data.ts karakteriyle uyumlu) ─── */
export const nedenler: { icon: string; title: string; sub: string }[] = [
  { icon: 'sea', title: 'Deniz manzarası', sub: 'Teras ve çatı pencereleri' },
  { icon: 'stairs', title: 'İki katlı yaşam', sub: 'Dubleks + ikinci mutfak' },
  { icon: 'rail', title: 'Ferforje balkonlar', sub: 'El işi korkuluklar' },
  { icon: 'car', title: 'Kapalı otopark', sub: 'Numaralı park cepleri' },
  { icon: 'key', title: 'Müteahhitten sıfır', sub: 'Aracısız, ilk sahibi siz' },
];

/* ─── Daire tipleri (landing tip kartları) ─── */
export interface Tip {
  ad: string;
  ozet: string;
  m2: string;
  fiyatText: string;
  durum: 'musait' | 'tukendi';
  adet: string;
}
export const tipler: Tip[] = [
  { ad: '3+2 Dubleks', ozet: 'İki kat, iki salon, teras', m2: '160 m² brüt',
    fiyatText: tl(13_750_000), durum: 'musait', adet: `${satistakiDaireSayisi} daire müsait` },
  // 3+1 m² İÇ TAHMİN — bu tipten satılık kalmadı.
  { ad: '3+1', ozet: 'Tek kat aile dairesi', m2: '128 m² brüt',
    fiyatText: 'Tümü teslim edildi', durum: 'tukendi', adet: '8 daire — satıldı' },
];

/* ─── Detay sayfası spec ızgaraları ─── */
export interface SpecItem { label: string; value: string }

/* Bina + daire künyesi. D-12 için TÜM değerler sahibinden ilanıyla birebir;
   Cephe (ikisinde) ve D-11'in brüt/net/kat'ı İÇ TAHMİN. */
function commonSpecs(u: KUnit): SpecItem[] {
  return [
    { label: 'Brüt / Net', value: `${u.brut} m² / ${u.net} m²` },
    { label: 'Oda / Salon', value: '3+2 / 2 salon' },
    { label: 'Tip', value: u.tip },
    { label: 'Bulunduğu Kat', value: u.kat + ' (çatı dubleksi)' },
    { label: 'Bina Kat Sayısı', value: '5' },
    { label: 'Bina Yaşı', value: '0 (Oturuma Hazır)' },
    { label: 'Banyo Sayısı', value: '2' },
    { label: 'Mutfak', value: 'Kapalı' },
    { label: 'Isıtma', value: 'Kombi (doğalgaz)' },
    { label: 'Balkon', value: 'Var' },
    { label: 'Asansör', value: 'Var' },
    { label: 'Otopark', value: 'Kapalı otopark' },
    { label: 'Eşyalı', value: 'Hayır' },
    { label: 'Kullanım Durumu', value: u.durum === 'satildi' ? 'Yakın zamanda satıldı' : 'Boş — teslime hazır' },
    { label: 'Site İçinde', value: 'Hayır' },
    { label: 'Tapu Durumu', value: 'Kat mülkiyeti' },
    { label: 'Krediye Uygun', value: 'Evet' },
    { label: 'Takas', value: 'Hayır' },
    { label: 'Aidat', value: 'Belirtilmemiş' },
    { label: 'Cephe', value: u.cephe },
  ];
}
export const specsD1 = commonSpecs(units[0]);
// D-12'ye gerçek sahibinden ilan kimliği eklenir (yalnız bu daireye özel).
export const specsD2: SpecItem[] = [
  ...commonSpecs(units[1]),
  { label: 'İlan No', value: '1317631166' },
  { label: 'İlan Tarihi', value: '21 Temmuz 2026' },
];

/* ─── Ödeme planı — oranlar İÇ TAHMİN senaryosu (30/40/30); toplam gerçek fiyata
   eşittir. Şu an arayüzde render EDİLMİYOR (PaymentPlan kaldırıldı). ─── */
export interface OdemeSatiri { ad: string; oran: string; tutar: number }
export function odemePlani(fiyat: number): { rows: OdemeSatiri[]; toplam: number } {
  const pesinat = Math.round(fiyat * 0.3);
  const ara = Math.round(fiyat * 0.4);
  const kalan = fiyat - pesinat - ara;
  return {
    rows: [
      { ad: 'Peşinat (sözleşmede)', oran: '%30', tutar: pesinat },
      { ad: 'Ara ödeme (teslimde)', oran: '%40', tutar: ara },
      { ad: 'Kalan (tapuda)', oran: '%30', tutar: kalan },
    ],
    toplam: fiyat,
  };
}

/* Finansman şeridi (detay B) — banka kredisi senaryosu */
export function finansman(fiyat: number) {
  const pesinat = Math.round(fiyat * 0.3);
  const kalan = fiyat - pesinat;
  const taksit = Math.ceil(kalan / 120 / 250) * 250;
  return { pesinatOran: '%30', pesinat, kalanOran: '%70', kalan, vade: '120 Ay', taksit };
}

/* ─── Oda ölçüleri (detay B "kat planı" paneli) — ölçüler İÇ TAHMİN; plan görseli
   hazır değil. Kesin ölçüler gelince değiştir (arayüzde tahmin olduğu belirtilmez). ─── */
export const odaOlculeriD2: { grup: string; odalar: SpecItem[] }[] = [
  { grup: 'Alt kat', odalar: [
    { label: 'Salon', value: '27,4 m²' },
    { label: 'Mutfak', value: '11,8 m²' },
    { label: 'Yatak odası 1', value: '13,6 m²' },
    { label: 'Yatak odası 2', value: '11,2 m²' },
    { label: 'Banyo + hol', value: '9,4 m²' },
    { label: 'Balkon', value: '4,2 m²' },
  ] },
  { grup: 'Üst kat (çatı)', odalar: [
    { label: 'İkinci salon', value: '21,6 m²' },
    { label: 'Mutfak nişi', value: '6,8 m²' },
    { label: 'Çatı odası', value: '12,4 m²' },
    { label: 'Banyo', value: '4,6 m²' },
    { label: 'Teras', value: '19,5 m²' },
  ] },
];

/* ─── SSS ─── */
export const sss: { soru: string; cevap: string }[] = [
  { soru: 'Daireler hemen teslim mi?',
    cevap: 'Satıştaki D-12 sıfır ve boştur; tapu işlemleriyle birlikte teslim edilir. D-11 yakın zamanda satılmıştır.' },
  { soru: 'Konut kredisi kullanılabilir mi?',
    cevap: 'Kat mülkiyetli sıfır konutlar kredi kullanımına uygundur; oran ve vade bankanıza göre değişir.' },
  { soru: 'Aracı komisyonu var mı?',
    cevap: 'Hayır. Daireler binayı yapan Mey İnşaat’tan doğrudan satın alınır; süreç tek muhatapla ilerler.' },
  { soru: 'Daireyi yerinde görebilir miyim?',
    cevap: 'Evet — formdan randevu bırakın, satıştaki D-12’yi size uyan saatte gezdirelim.' },
];

/* ─── Benzer daireler / proje teaser kartları ─── */
export interface Teaser {
  ad: string;
  konum: string;
  not: string;
  slug: string; // /projeler/<slug>
}
export const projeTeasers: Teaser[] = [
  { ad: 'Maşuk Apartmanı', konum: 'Pendik, İstanbul', not: 'Tümü satıldı', slug: 'masuk-apartmani' },
  { ad: 'Çamoğlu Apartmanı', konum: 'Pendik, İstanbul', not: 'Tümü satıldı', slug: 'camoglu-apartmani' },
];

/* ─── LİSTELEME SAYFASI (liste-ref.png) — dürüst envanter ───
   Izgara = 2 gerçek daire kaydı (D-11 satıldı, D-12 satışta) + 3 proje kartı
   (listingProjeler). Ali ve Çamoğlu Apartmanı'nda satılık daire YOK (gerçek durum) —
   kırmızı TÜMÜ SATILDI bandı taşır, proje sayfasına çıkar. Uydurma ilan üretme:
   önceki temsilî Ali/Çamoğlu Apartmanı satırları bu yüzden silindi. */
export interface ListingUnit {
  id: string;
  mock: true;
  tip: 'daire' | 'dubleks';
  baslik: string;
  proje: string;
  projeKey: 'el-ele' | 'masuk' | 'camoglu';
  blokKat: string;
  oda: string;
  brut: number;
  banyo: number;
  balkon: number;
  kat: string;
  katKey: '1' | '2' | '3' | '4' | '5-6';
  fiyat: number | null;
  durum: Durum;
  badge?: string;
  /** El Ele gerçek daireleri: manifest anahtarı + detay sayfası */
  imgKey?: string;
  detay?: 'daire-1' | 'daire-2';
}

export const listing: ListingUnit[] = [
  { id: 'd11', mock: true, tip: 'dubleks', baslik: '3+2 Dubleks', proje: 'El Ele Apartmanı', projeKey: 'el-ele',
    blokKat: 'A Blok · 5. Kat', oda: units[0].oda, brut: units[0].brut, banyo: 2, balkon: 2, kat: units[0].kat, katKey: units[0].katKey,
    fiyat: units[0].fiyat, durum: units[0].durum, badge: units[0].badge, imgKey: units[0].foto, detay: units[0].detay },
  { id: 'd12', mock: true, tip: 'dubleks', baslik: '3+2 Dubleks', proje: 'El Ele Apartmanı', projeKey: 'el-ele',
    blokKat: 'A Blok · 5. Kat', oda: units[1].oda, brut: units[1].brut, banyo: 2, balkon: 2, kat: units[1].kat, katKey: units[1].katKey,
    fiyat: units[1].fiyat, durum: units[1].durum, badge: units[1].badge, imgKey: units[1].foto, detay: units[1].detay },
];

/* Proje kartları — sayı içermez, durumları gerçektir (mock kapsamı dışı). */
export interface ListingProje {
  id: string;
  ad: string;
  projeKey: 'el-ele' | 'masuk' | 'camoglu';
  konum: string;
  /** true → kartta kırmızı TÜMÜ SATILDI bandı */
  sold: boolean;
  not: string;
  /** satışı açık projede foto rozeti */
  rozet?: string;
  slug: string; // /projeler/<slug>
}

export const listingProjeler: ListingProje[] = [
  { id: 'p-el-ele', ad: 'El Ele Apartmanı', projeKey: 'el-ele', konum: 'Pendik, İstanbul',
    sold: false, not: `${satistakiDaireSayisi} satılık dubleks bu binada`, rozet: `${satistakiDaireSayisi} DAİRE SATILIK`, slug: 'el-ele-apartmani' },
  { id: 'p-masuk', ad: 'Maşuk Apartmanı', projeKey: 'masuk', konum: 'Pendik, İstanbul',
    sold: true, not: 'Bu projede satılık daire kalmadı', slug: 'masuk-apartmani' },
  { id: 'p-camoglu', ad: 'Çamoğlu Apartmanı', projeKey: 'camoglu', konum: 'Pendik, İstanbul',
    sold: true, not: 'Bu projede satılık daire kalmadı', slug: 'camoglu-apartmani' },
];

/* Kat planı bandı — plan görselleri hazır değil; stilize şema. m² değerleri
   İÇ TAHMİN (arayüzde tahmin olduğu belirtilmez). Yalnız satıştaki tip: 3+2 dubleks. */
export const katPlanlari = [
  { ad: '3+2 Dubleks Alt Kat', m2: '96 m²' },
  { ad: '3+2 Dubleks Üst Kat', m2: '86 m²' },
];

/* Detay sayfası başlıkları + kart sıraları (klon değil: kendi vurgusu, kendi sırası) */
export const detay = {
  'daire-1': {
    unit: units[0],
    apt: daire1,
    baslik: 'El Ele Apartmanı’nda Deniz Manzaralı 3+2 Dubleks',
    genelBakis: daire1.character,
    /** karusel küratörlü sırası (kendi öne çıkan kareleri) */
    galeri: daire1.gallery,
    benzerSira: ['d12'],
  },
  'daire-2': {
    unit: units[1],
    apt: daire2,
    baslik: 'El Ele Apartmanı’nda Çatı Avlulu 3+2 Dubleks',
    genelBakis: daire2.character,
    galeri: daire2.gallery,
    benzerSira: ['d11'],
  },
} as const;
