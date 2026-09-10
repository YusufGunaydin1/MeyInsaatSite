/*
  SATILIK DAİRELER — canlı kompakt sayfaların merkezi içerik modeli (TR).
  Daire anlatıları, satış durumu ve fotoğraf anahtarları tek kaynaktan gelir.

  GERÇEK BİLGİ DİSİPLİNİ: m², kat, cephe, adres, tapu, ısıtma, otopark
  tahsisi, teslim tarihi... ASLA uydurulmaz → `pending: true` ile işaretlenir ve
  arayüzde "Bilgi yakında" rozeti olarak çıkar. Gerçek bilgiler geldiğinde YALNIZ
  bu dosya güncellenir; sunum bileşenlerine dokunulmaz.

  Onaylı bilinenler: El Ele Apartmanı · Mey İnşaat (müteahhitten direkt satış) ·
  iki 3+2 dubleks; Daire 1 yakın zamanda satıldı, Daire 2 satışta ve fiyatı
  13.750.000 TL. Fotoğrafların görsel olarak
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
    { label: 'Durum', value: 'Yakın zamanda satıldı' },
    { label: 'Brüt / net alan', pending: true },
    { label: 'Bulunduğu kat', pending: true },
    { label: 'Cephe', pending: true },
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
    { label: 'Durum', value: 'Satışta — sıfır' },
    { label: 'Brüt / net alan', pending: true },
    { label: 'Bulunduğu kat', pending: true },
    { label: 'Cephe', pending: true },
    { label: 'Fiyat', value: '13.750.000 TL' },
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

/* Canlı liste ve Daire 2 proje özetinin kullandığı bina kimliği. */
export const building = {
  name: 'El Ele Apartmanı',
  builder: 'Mey İnşaat',
  positioning: 'Müteahhitten sıfır 3+2 dubleks daireler',
};
