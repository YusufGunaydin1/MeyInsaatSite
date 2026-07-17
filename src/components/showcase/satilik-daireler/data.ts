export const SALE_ROOT = '/showcases/satilik-daireler';

export const variationSlugs = ['editoryal', 'mimari', 'monolit'] as const;
export type VariationSlug = (typeof variationSlugs)[number];

export const nestedPageSlugs = [
  'daireler',
  'daire-1',
  'daire-2',
  'el-ele-apartmani',
  'galeri',
  'iletisim',
] as const;
export type NestedPageSlug = (typeof nestedPageSlugs)[number];
export type ApartmentSlug = 'daire-1' | 'daire-2';

export interface VariationDefinition {
  slug: VariationSlug;
  index: string;
  name: string;
  shortName: string;
  direction: string;
  impression: string;
  typography: string;
  imageStrategy: string;
  navigation: string;
  antiMarketplace: string;
  previewMediaId: string;
}

export const variations: Record<VariationSlug, VariationDefinition> = {
  editoryal: {
    slug: 'editoryal',
    index: '01',
    name: 'Kıyı Defteri',
    shortName: 'Editoryal',
    direction: 'Sıcak editoryal butik',
    impression:
      'Alıcıya iki ev için hazırlanmış kişisel bir mimari seçkiyi inceliyormuş hissi verir.',
    typography:
      'DM Sans; yumuşak cümle ritmi, büyük ama sakin başlıklar ve dergi benzeri kısa açıklamalar.',
    imageStrategy:
      'Asimetrik fotoğraf eşleşmeleri, teras ve yaşam alanı kareleri arasında doğal bir anlatı.',
    navigation:
      'İnce üst navigasyon, görünür geri bağlantıları ve her anlatının sonunda bir sonraki adım.',
    antiMarketplace:
      'İlan kartları yerine iki ayrı ev hikâyesi; filtre, fiyat rozeti ve promosyon kalabalığı yok.',
    previewMediaId: 'd1:d1-teras-3.png',
  },
  mimari: {
    slug: 'mimari',
    index: '02',
    name: 'Mekân Atlası',
    shortName: 'Mimari',
    direction: 'Mimari minimal',
    impression:
      'Plan, kat ve mekân ilişkilerini düzenli bir mimari dosya açıklığıyla sunar.',
    typography:
      'DM Sans; sıkı ölçü, numaralı başlıklar ve kontrollü teknik etiketlerle net bir hiyerarşi.',
    imageStrategy:
      'Keskin ızgara, tutarlı oranlar ve alt/üst katı sırayla okutan fotoğraf dizileri.',
    navigation:
      'Numaralı bölüm navigasyonu ve route boyunca aynı kalan proje indeksi.',
    antiMarketplace:
      'Karşılaştırma tablosu yerine mekânsal kayıtlar; yalnız iki bağımsız bölüm ve doğrulanmış bilgiler.',
    previewMediaId: 'd2:d2-merdiven-1.png',
  },
  monolit: {
    slug: 'monolit',
    index: '03',
    name: 'Sessiz Sahne',
    shortName: 'Çağdaş',
    direction: 'Çağdaş premium',
    impression:
      'Fotoğrafları sinematik bir sakinlikle öne çıkarır; premium hissi gösteriş yerine kontrasttan gelir.',
    typography:
      'DM Sans; koyu zemin üzerinde geniş başlıklar, kısa metin blokları ve güçlü yönlendirmeler.',
    imageStrategy:
      'Tam taşan kahraman kareleri, koyu geçişler ve tek tek nefes alan geniş mekân fotoğrafları.',
    navigation:
      'Koyu sabit başlık, doğrudan daire geçişleri ve görünür randevu çağrısı.',
    antiMarketplace:
      'Tek proje, iki ev ve bir görüşme hedefi; rozet yığını, arama ya da liste yoğunluğu kullanılmaz.',
    previewMediaId: 'd2:d2-salon-alt-1.png',
  },
};

export const pageNavigation: Array<{ slug: '' | NestedPageSlug; label: string; shortLabel: string }> = [
  { slug: '', label: 'Başlangıç', shortLabel: 'Ana sayfa' },
  { slug: 'daireler', label: 'Daireler', shortLabel: 'Daireler' },
  { slug: 'el-ele-apartmani', label: 'El Ele Apartmanı', shortLabel: 'Bina' },
  { slug: 'galeri', label: 'Galeri', shortLabel: 'Galeri' },
  { slug: 'iletisim', label: 'Görüşme', shortLabel: 'İletişim' },
];

export const salePath = (variation?: VariationSlug, page?: NestedPageSlug) => {
  if (!variation) return SALE_ROOT;
  return `${SALE_ROOT}/${variation}${page ? `/${page}` : ''}`;
};

export interface PlaceholderFact {
  label: string;
  value: string;
}

export interface ApartmentDefinition {
  slug: ApartmentSlug;
  index: string;
  name: string;
  confirmed: string;
  shortIntro: string;
  lead: string;
  lowerTitle: string;
  lowerStory: string;
  upperTitle: string;
  upperStory: string;
  characterTitle: string;
  character: string;
  heroMediaId: string;
  overviewMediaId: string;
  storyMediaIds: string[];
  galleryMediaIds: string[];
  facts: PlaceholderFact[];
}

const placeholderFacts: PlaceholderFact[] = [
  { label: 'Fiyat', value: 'Fiyat bilgisi için bize ulaşın' },
  { label: 'Net / brüt alan', value: 'Bilgi yakında' },
  { label: 'Kat bilgisi', value: 'Detaylar için iletişime geçin' },
  { label: 'Yön / cephe', value: 'Bilgi yakında' },
  { label: 'Isıtma', value: 'Bilgi yakında' },
  { label: 'Tapu ve teslim detayları', value: 'Detaylar için iletişime geçin' },
  { label: 'Otopark tahsisi', value: 'Bilgi yakında' },
];

export const saleContent = {
  meta: {
    title: 'Satılık Daireler — El Ele Apartmanı · Mey İnşaat',
    description:
      'El Ele Apartmanı’nda Mey İnşaat tarafından doğrudan sunulan iki yeni 3+2 dubleks daire için tasarım vitrini.',
  },
  project: {
    name: 'El Ele Apartmanı',
    builder: 'Mey İnşaat',
    collectionLabel: 'İki ev · Tek proje · Doğrudan müteahhitten',
    heroTitle: 'Müteahhitten sıfır 3+2 dubleks daireler',
    heroLead:
      'El Ele Apartmanı’nda satışa sunulan iki yeni dubleksi, fotoğrafları ve kat hikâyeleriyle sakin bir tempoda keşfedin.',
    directTitle: 'Aracı bir ilan akışı değil, doğrudan proje anlatısı.',
    directBody:
      'Daireleri, binayı ve mevcut bilgileri projeyi inşa eden Mey İnşaat ile konuşun. Eksik ticari bilgiler açıkça işaretlenir; görüşme öncesinde teyit edilir.',
    apartmentsIntro:
      'Aynı yapıda iki ayrı ev karakteri. Önce kısa seçkiyi görün, ardından size yakın olan dairenin katlarını ve fotoğraflarını ayrıntılı inceleyin.',
    trustTitle: 'Sorularınız, projeyi inşa eden ekibe gider.',
    trustBody:
      'Bu vitrin doğrudan satış yaklaşımını gösterir. Fiyat, alan, tapu, teknik sistemler ve hukuki koşullar için yayınlanmış bir iddia üretmez; güncel ayrıntılar görüşmede paylaşılmak üzere bekletilir.',
    buildingTitle: 'El Ele Apartmanı',
    buildingLead:
      'Beyaz cephe, koyu korkuluk çizgileri, sade giriş ve ortak alan fotoğrafları yapının güncel karakterini gösteriyor.',
    environmentTitle: 'Çevreden seçilmiş kareler',
    environmentLead:
      'Sahil ve açık alan fotoğrafları çevre atmosferini tanıtır. Kesin adres, mesafe ve ulaşım bilgileri henüz paylaşılmamıştır.',
    ctaTitle: 'Evi yerinde görmek ister misiniz?',
    ctaBody:
      'Daire seçiminizi ve uygun olduğunuz zamanı bırakın; bu vitrin gerçek iletişim kurmadan talep akışını simüle eder.',
  },
  apartments: {
    'daire-1': {
      slug: 'daire-1',
      index: '01',
      name: 'Daire 1',
      confirmed: 'Yeni · 3+2 · Dubleks',
      shortIntro:
        'Teras ve açık manzara kareleriyle öne çıkan; iki kata yayılan yaşam alanlarını yumuşak bir akışla bağlayan ev.',
      lead:
        'Daire 1’in fotoğraf seçkisi, alt kattaki aydınlık salon ve mutfaktan üst kattaki eğimli tavanlı odalara, ikinci salona ve terasa ilerliyor.',
      lowerTitle: 'Alt kat · Günlük yaşamın merkezi',
      lowerStory:
        'Salon, ayrı mutfak, oda, banyo ve koridor kareleri alt katın dolaşımını gösteriyor. Balkon bağlantısı ve geniş pencere açıklıkları fotoğraf anlatısının parçası.',
      upperTitle: 'Üst kat · İkinci yaşam alanı ve teras',
      upperStory:
        'Merdiven üst kata, eğimli tavanların tanımladığı odalara ve ikinci yaşam alanına ulaşıyor. Teras fotoğrafları açık hava kullanımını ve çevre görünümünü destekliyor.',
      characterTitle: 'Daire 1’in görsel karakteri',
      character:
        'Teras, manzara ve iki farklı salon kurgusu bu evin anlatısında öne çıkıyor. Ölçü ve yön bilgileri paylaşılana kadar fotoğraflar yalnız mekânsal izlenim vermek için kullanılır.',
      heroMediaId: 'd1:d1-teras-3.png',
      overviewMediaId: 'd1:d1-salon-alt.png',
      storyMediaIds: [
        'd1:d1-salon-alt.png',
        'd1:d1-mutfak-1.png',
        'd1:d2-koridor.png',
        'd1:d1-merdiven.png',
        'd1:d1-salon-ust-1.png',
        'd1:d1-teras-1.png',
      ],
      galleryMediaIds: [
        'd1:d2-salon-alt.png',
        'd1:d1-salon-alt.png',
        'd1:d1-mutfak-1.png',
        'd1:d1-oda-1.png',
        'd1:d1-oda-2a.png',
        'd1:d1-banyo-1.png',
        'd1:d1-merdiven.png',
        'd1:d2-salon-ust.png',
        'd1:d2-mutfak-ust.png',
        'd1:d1-oda-3a.png',
        'd1:d2-banyo-1.png',
        'd1:d1-teras-3.png',
      ],
      facts: placeholderFacts,
    },
    'daire-2': {
      slug: 'daire-2',
      index: '02',
      name: 'Daire 2',
      confirmed: 'Yeni · 3+2 · Dubleks',
      shortIntro:
        'Net merdiven hattı, dengeli salon oranları ve üst katta terasa açılan ikinci yaşam alanıyla daha çizgisel bir mekân deneyimi.',
      lead:
        'Daire 2, alt kattaki uzun mutfak ve sakin salon düzeninden başlıyor; merdiven hattı üst kattaki odalara, ikinci mutfağa, salona ve terasa bağlanıyor.',
      lowerTitle: 'Alt kat · Doğrusal ve okunaklı',
      lowerStory:
        'Koridor, merdiven, mutfak ve salon fotoğrafları alt kattaki hareketi ardışık biçimde gösteriyor. Balkon karesi dış mekân bağlantısını tamamlıyor.',
      upperTitle: 'Üst kat · Çatı geometrisiyle şekillenen mekânlar',
      upperStory:
        'Eğimli tavanlı odalar ve ikinci salon üst katın daha özel karakterini kuruyor. Üst mutfak ile terasa açılan yaşam alanı aynı hikâyede okunuyor.',
      characterTitle: 'Daire 2’nin görsel karakteri',
      character:
        'Merdivenin güçlü doğrultusu ve açık renkli iç yüzeyler mekânları birbirine bağlıyor. Fotoğraflar ölçü veya malzeme markası iddiası taşımaz.',
      heroMediaId: 'd2:d2-salon-alt-1.png',
      overviewMediaId: 'd2:d2-salon-ust-1.png',
      storyMediaIds: [
        'd2:d2-salon-alt-1.png',
        'd2:d2-mutfak-alt.png',
        'd2:d2-merdiven-1.png',
        'd2:d2-koridor.png',
        'd2:d2-salon-ust-1.png',
        'd2:d2-teras.png',
      ],
      galleryMediaIds: [
        'd2:d2-salon-alt-1.png',
        'd2:d2-mutfak-alt.png',
        'd2:d2-oda-1a.png',
        'd2:d2-banyo-1a.png',
        'd2:d2-merdiven-1.png',
        'd2:d2-koridor.png',
        'd2:d2-salon-ust-1.png',
        'd2:d2-mutfak-ust.png',
        'd2:d2-oda-2a.png',
        'd2:d2-oda-3a.png',
        'd2:d2-banyo-2.png',
        'd2:d2-teras.png',
      ],
      facts: placeholderFacts,
    },
  } satisfies Record<ApartmentSlug, ApartmentDefinition>,
  building: {
    eyebrow: 'Proje · El Ele Apartmanı',
    title: 'İki evin ortak adresi: yapının kendisi',
    intro:
      'Dış cephe, giriş, merdiven holü ve kapalı otopark fotoğrafları ziyaretçiye dairenin ötesindeki günlük varış deneyimini gösterir.',
    architectureTitle: 'Sade bir cephe ritmi',
    architectureBody:
      'Fotoğraflarda beyaz cephe yüzeyi, koyu balkon korkulukları ve çatı katı geri çekilmesi birlikte okunuyor. Teknik cephe sistemi ve malzeme markaları için bilgi bekleniyor.',
    sharedTitle: 'Giriş ve ortak alanlar',
    sharedBody:
      'Aydınlık giriş holü, merdiven ve asansör çevresi mevcut fotoğraflarla sunulur. Ortak alanların teknik özellikleri ayrıca teyit edilmelidir.',
    parkingTitle: 'Kapalı otopark görüntüsü',
    parkingBody:
      'Otopark fotoğrafı yapının ortak alanını gösterir; herhangi bir bağımsız bölüme özel tahsis veya hak bilgisi içermez.',
    directTitle: 'Yüklenici ve doğrudan satıcı: Mey İnşaat',
    directBody:
      'Proje ve iki daire hakkındaki sorular tek bir görüşme akışında ele alınır. Bu tasarım vitrini gerçek satış sözleşmesi, ödeme planı veya hukuki taahhüt üretmez.',
  },
  gallery: {
    eyebrow: 'Küratörlü fotoğraf seçkisi',
    title: 'Mekânları sırayla değil, anlamlı gruplarla görün',
    intro:
      'Benzer açıları yan yana tekrarlamadan; iki daireyi, binayı, ortak alanları ve çevreyi ayrı seçkiler hâlinde inceleyin.',
    filters: {
      all: 'Tümü',
      'daire-1': 'Daire 1',
      'daire-2': 'Daire 2',
      bina: 'Bina',
      ortak: 'Ortak alanlar',
      cevre: 'Çevre',
    },
  },
  contact: {
    eyebrow: 'Özel görüşme',
    title: 'Bilgi veya yerinde görme talebi bırakın',
    intro:
      'Bu sayfa bir tasarım demosudur. Form hiçbir veriyi göndermeyecek; başarı ve hata durumlarını yalnız arayüz incelemesi için simüle edecektir.',
    privacy:
      'Gönderim yapılmaz, bilgiler tarayıcıdan çıkmaz. Gerçek iletişim kanalları üretim aşamasında onaylanacaktır.',
    successTitle: 'Talep demo olarak hazırlandı.',
    successBody:
      'Herhangi bir veri gönderilmedi. Üretim sürümünde bu noktada güvenli iletişim akışı devreye girecek.',
    errorTitle: 'Demo gönderimi tamamlanamadı.',
    errorBody:
      'Bu kontrollü hata durumudur. Bilgilerinizi gözden geçirip yeniden deneyebilirsiniz; hiçbir veri gönderilmedi.',
  },
};

export const gallerySelection = {
  'daire-1': saleContent.apartments['daire-1'].galleryMediaIds.slice(0, 8),
  'daire-2': saleContent.apartments['daire-2'].galleryMediaIds.slice(0, 8),
  bina: ['d1:bina-dis.png'],
  ortak: ['d1:bina-giris.jpeg', 'd1:otopark.png'],
  cevre: ['d1:cevre-manzara.png', 'd2:cevre-sahil-1.png', 'd2:cevre-sahil-2.png'],
} as const;

export const comparisonChecklist = [
  'Ana sayfa',
  'Yalnız iki daireyi sunan genel bakış',
  'Daire 1 ve Daire 2 için ayrı detay anlatısı',
  'El Ele Apartmanı',
  'Filtreli galeri ve klavye kontrollü lightbox',
  'Doğrulamalı demo randevu formu',
];
