/*
  SATILIK DAİRELER — merkezi mock içerik modeli (TR).
  ÜÇ tasarım yönü de (albüm / sergi / akşam) AYNI modeli kullanır; yalnız
  yerleşim ve register değişir (tek içerik kaynağı, dual-state yok).

  GERÇEK BİLGİ DİSİPLİNİ: fiyat, m², kat, cephe, adres, tapu, ısıtma, otopark
  tahsisi, teslim tarihi... ASLA uydurulmaz → `pending: true` ile işaretlenir ve
  arayüzde "Bilgi yakında" rozeti olarak çıkar. Gerçek bilgiler geldiğinde YALNIZ
  bu dosya güncellenir; sunum bileşenlerine dokunulmaz.

  Onaylı bilinenler: El Ele Apartmanı · Mey İnşaat (müteahhitten direkt satış) ·
  2 daire · her ikisi 3+2 DUBLEKS · sıfır/yeni yapım. Fotoğrafların görsel olarak
  desteklediği nitelikler (ferforje, iki mutfak, çatı terası, deniz görünümü vb.)
  betimleyici dille kullanılır; ölçü/mesafe iddiasına dönüştürülmez.
*/

export interface Fact {
  label: string;
  value?: string;
  pending?: boolean;
}

export interface StorySection {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  keys: string[];
}

export interface Apartment {
  id: 'daire-1' | 'daire-2';
  no: '01' | '02';
  name: string;
  /** kısa karakter etiketi — kartlarda */
  tagline: string;
  /** tek cümlelik vitrin cümlesi */
  hook: string;
  /** editoryal giriş paragrafı */
  intro: string;
  /** görsellerle desteklenen karakter maddeleri */
  character: string[];
  hero: string;
  lead: string;
  facts: Fact[];
  sections: StorySection[];
  /** galeri sayfası için küratörlü sıra */
  gallery: string[];
  otherId: 'daire-1' | 'daire-2';
  otherName: string;
}

export const daire1: Apartment = {
  id: 'daire-1',
  no: '01',
  name: 'Daire 1',
  tagline: 'Denize bakan dubleks',
  hook: 'Terasında Marmara, çatı penceresinde gemiler: iki katı da ışığa kurulmuş 3+2 dubleks.',
  intro:
    'Daire 1, El Ele Apartmanı’nın denize dönük yüzünde iki kat boyunca kurulan bir yaşam. ' +
    'Alt katta ferforje korkuluklu balkon kapıları salonu sokağın yeşiline açıyor; ahşap basamaklı ' +
    'iç merdiven, çatı katındaki ikinci salona ve kendi mutfağına çıkıyor. Üstte dam pencereleri ' +
    'denize bakıyor; teras ise Marmara’yı, kıyı şeridini ve şehir siluetini tek karede topluyor.',
  character: [
    'Çatı terasından deniz ve kıyı panoraması',
    'Üst katta ikinci salon + ikinci mutfak nişi',
    'Ferforje korkuluklu balkon kapıları',
    'Çatı ışıklıklı ve dam pencereli odalar',
    'Siyah profilli duş kabinli iki banyo',
  ],
  hero: 'daire-1/d1-salon-alt.png',
  lead: 'daire-1/d1-teras-2.png',
  facts: [
    { label: 'Oda düzeni', value: '3+2' },
    { label: 'Tip', value: 'Dubleks (iki kat)' },
    { label: 'Durum', value: 'Sıfır — müteahhitten' },
    { label: 'Brüt / net alan', pending: true },
    { label: 'Bulunduğu kat', pending: true },
    { label: 'Cephe', pending: true },
    { label: 'Fiyat', pending: true },
  ],
  sections: [
    {
      id: 'alt-kat',
      eyebrow: 'ALT KAT',
      title: 'Gün ışığına açılan salon',
      text:
        'Alt kat salonu iki ferforjeli balkon kapısı ve geniş pencereyle üç yönden ışık alıyor. ' +
        'Hol, parlak krem mermer zeminiyle mutfağı, odaları ve iç merdiveni birbirine bağlıyor.',
      keys: ['daire-1/d1-salon-alt.png', 'daire-1/d2-salon-alt.png', 'daire-1/d1-manzara-2.png', 'daire-1/d2-koridor.png'],
    },
    {
      id: 'mutfak',
      eyebrow: 'MUTFAK',
      title: 'Mozaik tezgâh arası, balkona geçiş',
      text:
        'Krem dolaplı mutfak, mermer mozaik tezgâh arasıyla tamamlanıyor; balkon kapısı servis ' +
        'balkonuna ve kombiye uzanıyor. Kiler dolabı balkonda hazır bekliyor.',
      keys: ['daire-1/d1-mutfak-1.png', 'daire-1/d1-mutfak-balkon.png', 'daire-1/d2-balkon.png'],
    },
    {
      id: 'merdiven',
      eyebrow: 'İKİ KAT',
      title: 'Ahşap basamaklarla yukarı',
      text:
        'Ahşap basamaklı, çelik taşıyıcılı iç merdiven iki katı tek evde birleştiriyor; ' +
        'ışıklığın altında gün boyu aydınlık.',
      keys: ['daire-1/d2-merdiven.png'],
    },
    {
      id: 'ust-kat',
      eyebrow: 'ÜST KAT',
      title: 'Çatı katında ikinci yaşam',
      text:
        'Üst kat kendi salonuna ve eğime uyarlanmış mutfak nişine sahip. Galeri boşluğunun ' +
        'korkuluğu iki katı görsel olarak birbirine bağlıyor; dam penceresi denizi içeri alıyor.',
      keys: ['daire-1/d2-salon-ust.png', 'daire-1/d2-mutfak-ust.png', 'daire-1/d1-manzara-1.png'],
    },
    {
      id: 'odalar',
      eyebrow: 'ODALAR',
      title: 'Üç yatak odası, iki karakter',
      text:
        'Alt katın odaları düz tavanlı ve sokağa bakıyor; çatı katındakiler eğimli tavanları ve ' +
        'ışıklıklarıyla daha korunaklı bir his taşıyor.',
      keys: ['daire-1/d1-oda-2a.png', 'daire-1/d1-oda-3a.png', 'daire-1/d1-oda-1.png', 'daire-1/d2-oda-2.png'],
    },
    {
      id: 'banyolar',
      eyebrow: 'BANYOLAR',
      title: 'Siyah profil, sakin seramik',
      text:
        'İki banyoda da siyah çerçeveli duş kabinleri, asma lavabo dolapları ve büyük ebat ' +
        'seramikler kullanılmış; üst kattaki banyo eğimli çatı penceresinden ışık alıyor.',
      keys: ['daire-1/d1-banyo-1.png', 'daire-1/d2-banyo-1.png', 'daire-1/d2-banyo-2.png'],
    },
    {
      id: 'teras',
      eyebrow: 'TERAS',
      title: 'Marmara’ya açılan teras',
      text:
        'Çatı terası evin en güçlü kartı: beyaz parapetin ötesinde deniz, sahil parkı ve ' +
        'silüet. Akşam güneşi terasın taş zemininde uzun gölgeler bırakıyor.',
      keys: ['daire-1/d1-teras-1.png', 'daire-1/d1-teras-2.png', 'daire-1/d1-teras-3.png'],
    },
  ],
  gallery: [
    'daire-1/d1-salon-alt.png', 'daire-1/d2-salon-alt.png', 'daire-1/d1-mutfak-1.png',
    'daire-1/d1-mutfak-balkon.png', 'daire-1/d2-koridor.png', 'daire-1/d2-merdiven.png',
    'daire-1/d2-salon-ust.png', 'daire-1/d2-mutfak-ust.png', 'daire-1/d1-manzara-1.png',
    'daire-1/d1-oda-2a.png', 'daire-1/d1-oda-3a.png', 'daire-1/d1-oda-3b.png',
    'daire-1/d1-oda-1.png', 'daire-1/d1-banyo-1.png', 'daire-1/d2-banyo-1.png',
    'daire-1/d1-teras-1.png', 'daire-1/d1-teras-2.png', 'daire-1/d1-teras-3.png',
    'daire-1/d1-manzara-2.png', 'daire-1/d2-balkon.png',
  ],
  otherId: 'daire-2',
  otherName: 'Daire 2',
};

export const daire2: Apartment = {
  id: 'daire-2',
  no: '02',
  name: 'Daire 2',
  tagline: 'Sakin çatı katlı dubleks',
  hook: 'Çatıların üzerinde sessiz bir teras, kendine ait üst kat mutfağı: içine dönük, sakin bir 3+2 dubleks.',
  intro:
    'Daire 2, aynı binada daha içe dönük bir ev. Alt katta ferforjeli balkon kapılı salon ve ' +
    'galeri mutfak; desenli çelik korkuluklu balkon gündelik işlere ayrılmış. Ahşap basamaklı ' +
    'merdiven üst kata çıktığında ev ikinci salonunu, eğime uyarlanmış mutfak nişini ve arduvaz ' +
    'çatılara bakan terasını açıyor. Dam pencereli çatı odaları çalışma ve misafir için esnek.',
  character: [
    'Arduvaz çatılara bakan sakin teras',
    'Üst katta ikinci salon + mutfak nişi',
    'Desenli çelik korkuluklu balkon',
    'Dam pencereli üç çatı odası',
    'Gri mermer şeritli, siyah profilli banyolar',
  ],
  hero: 'daire-2/d2-salon-ust-1.png',
  lead: 'daire-2/d2-salon-alt-2.png',
  facts: [
    { label: 'Oda düzeni', value: '3+2' },
    { label: 'Tip', value: 'Dubleks (iki kat)' },
    { label: 'Durum', value: 'Sıfır — müteahhitten' },
    { label: 'Brüt / net alan', pending: true },
    { label: 'Bulunduğu kat', pending: true },
    { label: 'Cephe', pending: true },
    { label: 'Fiyat', pending: true },
  ],
  sections: [
    {
      id: 'ust-kat',
      eyebrow: 'ÜST KAT',
      title: 'Çatı katı: evin sakin merkezi',
      text:
        'Üst salon terasa açılıyor; eğime uyarlanmış mutfak nişi bu katı kendi başına yaşanır ' +
        'kılıyor. Dam pencereleri komşu çatıların arduvaz dokusunu çerçeveliyor.',
      keys: ['daire-2/d2-salon-ust-1.png', 'daire-2/d2-mutfak-ust.png', 'daire-2/d2-salon-ust-2.png'],
    },
    {
      id: 'teras',
      eyebrow: 'TERAS',
      title: 'Çatıların üstünde bir avlu',
      text:
        'Krem seramik zeminli teras, koyu korkuluğuyla çatı manzarasına dönük; gökyüzüne açık, ' +
        'rüzgârdan korunaklı bir dış oda gibi çalışıyor.',
      keys: ['daire-2/d2-teras.png'],
    },
    {
      id: 'alt-kat',
      eyebrow: 'ALT KAT',
      title: 'Ferforjeli salon, galeri mutfak',
      text:
        'Alt katta salon ferforjeli balkon kapısıyla gün ışığı alıyor; galeri mutfak mozaik ' +
        'tezgâh arası ve balkon bağlantısıyla pratik bir hat kuruyor.',
      keys: ['daire-2/d2-salon-alt-2.png', 'daire-2/d2-salon-alt-1.png', 'daire-2/d2-mutfak-alt.png', 'daire-2/d2-balkon.png'],
    },
    {
      id: 'merdiven',
      eyebrow: 'İKİ KAT',
      title: 'Katları bağlayan merdiven',
      text:
        'Çelik kapılı giriş holünden başlayan ahşap basamaklı merdiven, iki katı kompakt ve ' +
        'aydınlık bir düşeyde birleştiriyor.',
      keys: ['daire-2/d2-koridor.png', 'daire-2/d2-merdiven-1.png'],
    },
    {
      id: 'odalar',
      eyebrow: 'ODALAR',
      title: 'Dam pencereli odalar',
      text:
        'Çatı katındaki odalar eğimli tavanları ve dam pencereleriyle atölye, çalışma ya da ' +
        'misafir odası olarak esneklik sunuyor; alt kat odaları gündelik düzene ayrılabilir.',
      keys: ['daire-2/d2-oda-2a.png', 'daire-2/d2-oda-2b.png', 'daire-2/d2-oda-1b.png', 'daire-2/d2-oda-3a.png'],
    },
    {
      id: 'banyolar',
      eyebrow: 'BANYOLAR',
      title: 'Gri mermer, siyah çerçeve',
      text:
        'Banyolarda gri mermer fon şeritleri ve siyah çerçeveli duş kabinleri; ikinci banyo ' +
        'daha sıcak bej tonlarda.',
      keys: ['daire-2/d2-banyo-1a.png', 'daire-2/d2-banyo-2.png'],
    },
    {
      id: 'cevre',
      eyebrow: 'ÇEVRE',
      title: 'Semtin kıyısından kareler',
      text:
        'Dosyadaki çevre kareleri semtin kıyı parkını ve yürüyüş yolunu gösteriyor — konum ve ' +
        'mesafe bilgileri netleştiğinde burada yer alacak.',
      keys: ['daire-2/cevre-sahil-1.png', 'daire-2/cevre-sahil-2.png'],
    },
  ],
  gallery: [
    'daire-2/d2-salon-ust-1.png', 'daire-2/d2-salon-ust-2.png', 'daire-2/d2-mutfak-ust.png',
    'daire-2/d2-teras.png', 'daire-2/d2-salon-alt-2.png', 'daire-2/d2-salon-alt-1.png',
    'daire-2/d2-mutfak-alt.png', 'daire-2/d2-koridor.png', 'daire-2/d2-merdiven-1.png',
    'daire-2/d2-oda-2a.png', 'daire-2/d2-oda-2b.png', 'daire-2/d2-oda-1b.png',
    'daire-2/d2-oda-3a.png', 'daire-2/d2-banyo-1a.png', 'daire-2/d2-banyo-2.png',
    'daire-2/d2-balkon.png',
  ],
  otherId: 'daire-1',
  otherName: 'Daire 1',
};

export const apartments: Apartment[] = [daire1, daire2];
export const apartmentById = (id: string): Apartment =>
  id === 'daire-2' ? daire2 : daire1;

/* ─── Bina & çevre ─── */
export const building = {
  name: 'El Ele Apartmanı',
  builder: 'Mey İnşaat',
  eyebrow: 'EL ELE APARTMANI',
  positioning: 'Müteahhitten sıfır 3+2 dubleks daireler',
  intro:
    'El Ele Apartmanı, Mey İnşaat’ın kendi çizip kendi yaptığı yapılardan: beyaz sıvalı ' +
    'klasik cephe, ferforje balkonlar ve kiremit kırması çatı. Binadaki iki dubleks daire, ' +
    'aracı olmadan doğrudan müteahhitten satın alınıyor.',
  exterior: 'daire-1/bina-dis.png',
  entrance: 'daire-1/bina-giris.jpeg',
  parking: 'daire-1/otopark.png',
  environment: ['daire-1/cevre-manzara.png', 'daire-2/cevre-sahil-1.png', 'daire-2/cevre-sahil-2.png'],
  facts: [
    { label: 'Proje', value: 'El Ele Apartmanı' },
    { label: 'Yapımcı ve satıcı', value: 'Mey İnşaat' },
    { label: 'Satılık daire', value: '2 adet — her ikisi 3+2 dubleks' },
    { label: 'Adres', pending: true },
    { label: 'Kat sayısı', pending: true },
    { label: 'Isıtma', pending: true },
    { label: 'Otopark tahsisi', pending: true },
  ] as Fact[],
  craft: [
    {
      title: 'Çizdiğimizi inşa ederiz',
      text:
        'Mey İnşaat projelerini kendi çizer, kendi yapar, sahibine kendisi teslim eder. ' +
        'El Ele Apartmanı’nda da cephe detayından merdiven korkuluğuna aynı el iş başında.',
    },
    {
      title: 'Aracısız, doğrudan müteahhitten',
      text:
        'İki daire de sahibinden ya da aracıdan değil, binayı yapan firmadan alınıyor: ' +
        'sorular ilk elden yanıt bulur, süreç tek muhatapla ilerler.',
    },
    {
      title: 'Teslime hazır incelik',
      text:
        'Siyah profilli duş kabinleri, mozaik tezgâh araları, ferforje korkuluklar: ' +
        'fotoğraflardaki her detay teslim edilecek dairenin kendisidir.',
    },
  ],
};

/* ─── Ortak arayüz metinleri ─── */
export const ui = {
  brand: 'MEY İNŞAAT',
  project: 'El Ele Apartmanı',
  kicker: 'Müteahhitten sıfır 3+2 dubleks',
  placeholder: 'Bilgi yakında',
  contactForPrice: 'Fiyat bilgisi için bize ulaşın',
  contactForDetail: 'Detaylar için iletişime geçin',
  cta: {
    daireleri: 'Daireleri İncele',
    daire1: 'Daire 1’i Gör',
    daire2: 'Daire 2’yi Gör',
    fotograflar: 'Fotoğrafları İncele',
    detaylar: 'Detayları Sor',
    randevu: 'Randevu Talep Et',
    gorus: 'Mey İnşaat ile Görüş',
    bina: 'El Ele Apartmanı’nı Tanı',
  },
  nav: [
    { href: '', label: 'Giriş' },
    { href: 'daireler', label: 'Daireler' },
    { href: 'daire-1', label: 'Daire 1' },
    { href: 'daire-2', label: 'Daire 2' },
    { href: 'el-ele-apartmani', label: 'El Ele Apartmanı' },
    { href: 'galeri', label: 'Galeri' },
    { href: 'iletisim', label: 'İletişim' },
  ],
  galleryTabs: [
    { id: 'tumu', label: 'Tümü' },
    { id: 'daire-1', label: 'Daire 1' },
    { id: 'daire-2', label: 'Daire 2' },
    { id: 'bina', label: 'Bina & Ortak Alanlar' },
    { id: 'cevre', label: 'Çevre' },
  ],
  disclaimer:
    'Bu sayfa bir tasarım vitrinidir; içerikteki fiyat, ölçü ve konum alanları gerçek satış ' +
    'bilgisi yayınlanana dek "Bilgi yakında" olarak işaretlidir.',
};

/* ─── Galeri sayfası bileşimi (küratörlü; filigranlılar manifest'te dışlandı) ─── */
export type GalleryGroup = 'daire-1' | 'daire-2' | 'bina' | 'cevre';
export const galleryComposition: { group: GalleryGroup; keys: string[] }[] = [
  { group: 'daire-1', keys: daire1.gallery },
  { group: 'daire-2', keys: daire2.gallery },
  { group: 'bina', keys: ['daire-1/bina-dis.png', 'daire-1/bina-giris.jpeg', 'daire-1/otopark.png'] },
  { group: 'cevre', keys: ['daire-1/cevre-manzara.png', 'daire-2/cevre-sahil-1.png', 'daire-2/cevre-sahil-2.png'] },
];

/* ─── İletişim / randevu formu ─── */
export const form = {
  title: 'Randevu Talep Et',
  intro:
    'Size uyan zamanı bırakın; Mey İnşaat sizinle iletişime geçsin. Bu vitrin sürümünde form ' +
    'gerçek veri göndermez — durumlar (doğrulama, gönderim, hata, başarı) tasarım için canlandırılır.',
  fields: {
    name: { label: 'Ad Soyad', placeholder: 'Adınız ve soyadınız', error: 'Lütfen adınızı yazın.' },
    contact: {
      label: 'Telefon veya e-posta',
      placeholder: '05xx xxx xx xx ya da ornek@eposta.com',
      error: 'Size ulaşabileceğimiz bir telefon ya da e-posta gerekli.',
    },
    channel: {
      label: 'Tercih ettiğiniz iletişim',
      options: ['Telefon', 'WhatsApp', 'E-posta'],
    },
    apartment: {
      label: 'İlgilendiğiniz daire',
      options: ['Daire 1', 'Daire 2', 'İkisi de'],
      error: 'Lütfen bir daire seçin.',
    },
    date: {
      label: 'Uygun olduğunuz zaman',
      placeholder: 'örn. hafta içi 18.00 sonrası / cumartesi öğlen',
      hint: 'Kesin tarih veremiyorsanız genel uygunluk da yeterli.',
    },
    message: { label: 'Mesajınız (isteğe bağlı)', placeholder: 'Sormak istedikleriniz…' },
  },
  submit: 'Randevu Talep Et',
  sending: 'Gönderiliyor…',
  success: {
    title: 'Talebiniz alındı',
    text: 'Mey İnşaat en kısa sürede tercih ettiğiniz kanaldan size dönecek.',
    again: 'Yeni talep oluştur',
  },
  failure: {
    title: 'Gönderilemedi',
    text: 'Bağlantı sorunu canlandırıldı — vitrin sürümünde hata durumu böyle görünür.',
    retry: 'Tekrar dene',
  },
  demoNote: 'VİTRİN KONTROLÜ — gönderim sonucunu seç:',
  demoOptions: { success: 'Başarılı', failure: 'Hatalı' } as const,
};

/* ─── Tasarım yönleri (hub kartları) ─── */
export interface Variation {
  slug: 'album' | 'sergi' | 'aksam';
  no: string;
  name: string;
  title: string;
  mood: string;
  impression: string;
  typography: string;
  imagery: string;
  navigation: string;
  antiMarketplace: string;
}

export const variations: Variation[] = [
  {
    slug: 'album',
    no: 'A',
    name: 'ALBÜM',
    title: 'Sıcak editoryal butik',
    mood: 'Bir aile albümü gibi: sıcak taş zemin, serif başlıklar, bölüm bölüm anlatı.',
    impression:
      'Alıcı, iki evi dergi sayfası sakinliğinde okuyup "bu ev bana anlatıldı" hissiyle ayrılır; ' +
      'satıcı bir kurumdan çok ev sahibi bir usta gibi konuşur.',
    typography: 'IBM Plex Serif display + Plex Sans gövde; geniş satır aralığı, italik vurgular, kelimeyle yazılmış bölüm numaraları.',
    imagery: 'Tek büyük kare + altında serif altyazı; tam taşma molaları; asimetrik ikili yayılımlar. Fotoğraf daima metinden önce gelir.',
    navigation: 'Ortalanmış kelime markası, iki yanda küçük-caps bağlantılar; mobilde tam ekran perde menü; sayfa sonlarında "sonraki bölüm" bağları.',
    antiMarketplace: 'Kart ızgarası, filtre, rozet yok; iki ev yalnız isimleri ve birer cümleyle tanıtılır, karşılaştırma düzyazıyla yapılır.',
  },
  {
    slug: 'sergi',
    no: 'B',
    name: 'SERGİ',
    title: 'Mimari minimal katalog',
    mood: 'Mimarlık ofisi sergisi: beton beyazı, pafta çizgileri, mono teknik etiketler.',
    impression:
      'Alıcı iki "eseri" plaka numaralarıyla gezer; ölçülü, kesin ve güven veren bir ustalık dili — ' +
      '"çizdiğimizi inşa ederiz" cümlesinin satış vitrini hâli.',
    typography: 'Oswald display (caps) + Plex Mono teknik katman + Plex Sans gövde; ana marka diline en yakın yön.',
    imagery: 'Tek tip oranlı "plakalar", ince çerçeve + mono künye satırı; kırmızı string-line bölüm ayracı; görseller sergi kataloğu gibi numaralı.',
    navigation: 'Masaüstünde yapışkan sol ray (mono numaralı dikey menü), mobilde üst bar + açılır panel; her sayfa sonunda kataloğun sonraki sayfası.',
    antiMarketplace: 'İlan dili tamamen yok: fiyat rozetleri yerine künye (title block) ve "Bilgi yakında" çipleri; ızgara bir sergi asma düzeni gibi kurulur.',
  },
  {
    slug: 'aksam',
    no: 'C',
    name: 'AKŞAM',
    title: 'Çağdaş premium vitrin',
    mood: 'Akşam gezdirmesi: gece-lacivert sahne, sıcak fotoğraf ışığı, iki evin karşılıklı vitrini.',
    impression:
      'Alıcı kendini özel bir akşam gösterimine davet edilmiş hisseder; koyu sahne fotoğrafları ' +
      'parlatır, kalan her şey sessiz kalır — premium ama gösterişsiz.',
    typography: 'Oswald display + Plex Sans; koyu zeminde kırmızı-on-dark vurgusu, büyük tabular rakamlar.',
    imagery: 'Koyu bantlarda kenardan kenara fotoğraf; iki ev split-ekran panellerde yan yana; ışık fotoğrafın içinden gelir, arayüz karanlıkta kalır.',
    navigation: 'Koyu üst bar + kutulu marka; mobilde alt-sayfa (bottom sheet) menü; kaydırınca beliren yapışkan "Randevu Talep Et" çubuğu.',
    antiMarketplace: 'Vitrin metaforu: iki panel, iki ev — liste yok, sayaç yok, aciliyet dili yok; tek kırmızı eylem her ekranda aynı: randevu.',
  },
];

export const hub = {
  path: '/showcases/satilik-daireler',
  kicker: 'MEY İnşaat · Dahili · Satış Vitrini Lab',
  title: 'Satılık Daireler — Üç Tasarım Yönü',
  desc:
    'El Ele Apartmanı’ndaki iki 3+2 dubleks daire için müteahhitten-direkt satış deneyimi. ' +
    'Üç yön de aynı içerik modelini ve fotoğraf envanterini kullanır; yapı, tipografi ve duygu ' +
    'değişir. Her yön 7 sayfalık gezilebilir bir aile: giriş, daireler, iki daire detayı, bina, ' +
    'galeri ve randevu formu.',
};
