/*
  SATILIK DAİRELER — medya envanteri (tek doğruluk kaynağı).
  KİMLİK KURALI: klasör = daire kimliği. `daire-1/` altındaki HER dosya Daire 1'e
  aittir — tarihsel `d2-` ön ekleri YANILTICIDIR, kimlik için kullanılmaz.
  (folder alanı kimliktir; subject alanı karenin KONUSUNU söyler: bina/çevre
  kareleri daire klasöründe dursa da apartman-genel malzemedir.)

  DIŞLANANLAR (public vitrine ASLA girmez, media.ts yapısal olarak engeller):
  - daire-2/cevre-deniz.png  → üçüncü taraf emlak filigranı (#1317631166 + logo)
  - daire-1/d2-teras.png     → üçüncü taraf ilan referansı (#1317628146)
  Kaynak dosyalar yerinde bırakıldı; yeniden adlandırma/taşıma/silme YOK.
*/

export type Folder = 'daire-1' | 'daire-2';
export type Subject = 'daire-1' | 'daire-2' | 'bina' | 'ortak' | 'cevre';
export type Category =
  | 'salon-alt' | 'salon-ust' | 'mutfak-alt' | 'mutfak-ust' | 'mutfak-balkon'
  | 'oda' | 'oda-cati' | 'banyo' | 'merdiven' | 'koridor' | 'balkon'
  | 'teras' | 'manzara' | 'bina-dis' | 'giris' | 'otopark' | 'cevre';
export type Use = 'hero' | 'gallery' | 'support' | 'exclude';

export interface MediaEntry {
  /** klasöre göre anahtar: '<folder>/<dosya>' */
  key: string;
  folder: Folder;
  /** karenin konusu (kimlik DEĞİL) */
  subject: Subject;
  category: Category;
  /** dubleks katı — görsel olarak desteklenmiyorsa null */
  floor: 'alt' | 'ust' | null;
  /** çekim açısı / içerik kısa notu (küratör notu, TR) */
  angle: string;
  orientation: 'yatay' | 'dikey' | 'genis';
  /** 1–5 küratör kalite notu */
  quality: 1 | 2 | 3 | 4 | 5;
  /** birebir/yakın tekrar ise aslının anahtarı */
  duplicateOf?: string;
  /** filigran türü — 'ucuncu-taraf' public kullanım yasağı demektir */
  watermark?: 'ucuncu-taraf' | 'mey';
  use: Use;
  /** anlamlı Türkçe alt metni */
  alt: string;
  /** galeri/lightbox kısa başlığı */
  caption: string;
}

export const MEDIA: MediaEntry[] = [
  // ─── DAİRE 1 klasörü (34 dosya — tümü Daire 1 malzemesi; bina/çevre kareleri apartman-genel) ───
  { key: 'daire-1/bina-dis.png', folder: 'daire-1', subject: 'bina', category: 'bina-dis', floor: null,
    angle: 'yüksek açı; deniz fonlu beyaz cephe, MEY İNŞAAT çatı yazısı', orientation: 'dikey', quality: 5, use: 'hero',
    alt: 'El Ele Apartmanı: beyaz cepheli, ferforje balkonlu bina; arkada Marmara Denizi ve gemiler',
    caption: 'El Ele Apartmanı — deniz fonlu cephe' },
  { key: 'daire-1/bina-giris.jpeg', folder: 'daire-1', subject: 'ortak', category: 'giris', floor: null,
    angle: 'bina içi merdiven sahanlığı ve asansör holü', orientation: 'dikey', quality: 3, watermark: 'mey', use: 'gallery',
    alt: 'Bina girişinde krem mermer basamaklar, metal korkuluk ve asansör holü',
    caption: 'Ortak merdiven ve asansör holü' },
  { key: 'daire-1/cevre-manzara.png', folder: 'daire-1', subject: 'cevre', category: 'cevre', floor: null,
    angle: 'geniş sahil panoraması; koy, sahil yolu, park', orientation: 'genis', quality: 5, use: 'hero',
    alt: 'Marmara kıyı şeridi: koy boyunca sahil yolu, yeşil park ve uzakta rezidans kuleleri',
    caption: 'Semtin kıyı şeridi' },
  { key: 'daire-1/d1-banyo-1.png', folder: 'daire-1', subject: 'daire-1', category: 'banyo', floor: null,
    angle: 'siyah profilli duş kabini, siyah tavan armatürü', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 banyosu: siyah çerçeveli cam duş kabini, beyaz vitrifiye ve bej büyük ebat seramik',
    caption: 'Daire 1 — banyo' },
  { key: 'daire-1/d1-banyo-2.png', folder: 'daire-1', subject: 'daire-1', category: 'banyo', floor: null,
    angle: 'lavabo + duş birlikte, mermer görünümlü duvar', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 ikinci banyo: mermer görünümlü duvar seramiği, siyah çerçeveli duş ve beyaz lavabo dolabı',
    caption: 'Daire 1 — ikinci banyo' },
  { key: 'daire-1/d1-manzara-1.png', folder: 'daire-1', subject: 'daire-1', category: 'manzara', floor: 'ust',
    angle: 'çatı katı penceresinden deniz; geniş bant', orientation: 'genis', quality: 5, use: 'hero',
    alt: 'Daire 1 çatı katı penceresinden Marmara Denizi, gemiler ve karşı tepeler',
    caption: 'Çatı katından deniz' },
  { key: 'daire-1/d1-manzara-2.png', folder: 'daire-1', subject: 'daire-1', category: 'manzara', floor: 'alt',
    angle: 'antrasit doğramadan şehir + deniz ufku', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 penceresinden kızıl çatılar, şehir dokusu ve ufukta deniz',
    caption: 'Pencereden şehir ve deniz ufku' },
  { key: 'daire-1/d1-merdiven.png', folder: 'daire-1', subject: 'daire-1', category: 'merdiven', floor: null,
    angle: 'dubleks iç merdiveni; ahşap basamak + çelik taşıyıcı', orientation: 'dikey', quality: 4,
    duplicateOf: 'daire-1/d2-merdiven.png', use: 'support',
    alt: 'Daire 1 dubleks iç merdiveni: ahşap basamaklar, çelik taşıyıcı ve krem mermer zemin',
    caption: 'Dubleks iç merdiveni' },
  { key: 'daire-1/d1-mutfak-1.png', folder: 'daire-1', subject: 'daire-1', category: 'mutfak-alt', floor: 'alt',
    angle: 'geniş açı; mozaik tezgâh arası + ferforjeli balkon kapısı', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 1 mutfağı: krem dolaplar, mermer mozaik tezgâh arası ve ferforje korkuluklu balkon kapısı',
    caption: 'Daire 1 — mutfak' },
  { key: 'daire-1/d1-mutfak-2.png', folder: 'daire-1', subject: 'daire-1', category: 'mutfak-alt', floor: 'alt',
    angle: 'tezgâh yakın plan', orientation: 'yatay', quality: 4, duplicateOf: 'daire-1/d1-mutfak-1.png', use: 'support',
    alt: 'Daire 1 mutfak tezgâhı yakın plan: mermer desenli tezgâh ve mozaik kaplama',
    caption: 'Mutfak — tezgâh detayı' },
  { key: 'daire-1/d1-mutfak-balkon.png', folder: 'daire-1', subject: 'daire-1', category: 'mutfak-balkon', floor: 'alt',
    angle: 'mutfaktan balkona geçiş; kombi görünür', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Daire 1 mutfak balkonu geçişi: siyah doğramalı kapı, ferforje korkuluk ve komşu binalar',
    caption: 'Mutfaktan balkona' },
  { key: 'daire-1/d1-oda-1.png', folder: 'daire-1', subject: 'daire-1', category: 'oda', floor: 'alt',
    angle: 'beyaz PVC pencere (etiketli), şehir silueti', orientation: 'yatay', quality: 3, use: 'gallery',
    alt: 'Daire 1 yatak odası: geniş pencere önünde radyatör, dışarıda kızıl çatılar ve şehir silueti',
    caption: 'Daire 1 — yatak odası' },
  { key: 'daire-1/d1-oda-2a.png', folder: 'daire-1', subject: 'daire-1', category: 'oda', floor: 'alt',
    angle: 'antrasit pencere, asma kat tavan bandı', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 yatak odası: antrasit doğramalı pencere, ağaçlı sokak görünümü ve lamine parke',
    caption: 'Daire 1 — ebeveyn odası' },
  { key: 'daire-1/d1-oda-2b.png', folder: 'daire-1', subject: 'daire-1', category: 'oda', floor: 'alt',
    angle: 'aynı odanın tekrar karesi', orientation: 'dikey', quality: 4, duplicateOf: 'daire-1/d1-oda-2a.png', use: 'exclude',
    alt: 'Daire 1 yatak odasının tekrar karesi',
    caption: 'Daire 1 — oda (tekrar)' },
  { key: 'daire-1/d1-oda-3a.png', folder: 'daire-1', subject: 'daire-1', category: 'oda-cati', floor: 'ust',
    angle: 'eğimli tavan + çatı ışıklığı', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 çatı katı odası: eğimli tavan, çatı ışıklığından süzülen gün ışığı',
    caption: 'Çatı katı odası — ışıklık' },
  { key: 'daire-1/d1-oda-3b.png', folder: 'daire-1', subject: 'daire-1', category: 'oda-cati', floor: 'ust',
    angle: 'dam penceresi + güneş lekeleri', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 çatı katı odası: dam penceresi ve zemine düşen güneş ışığı',
    caption: 'Çatı katı odası' },
  { key: 'daire-1/d1-salon-alt.png', folder: 'daire-1', subject: 'daire-1', category: 'salon-alt', floor: 'alt',
    angle: 'ferforjeli çift balkon kapısı + geniş pencere', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 1 alt kat salonu: ferforje korkuluklu iki balkon kapısı, geniş antrasit pencere ve bol gün ışığı',
    caption: 'Daire 1 — alt kat salon' },
  { key: 'daire-1/d1-salon-ust-1.png', folder: 'daire-1', subject: 'daire-1', category: 'salon-ust', floor: 'ust',
    angle: 'çatı formu + teras kapısı', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 üst kat salonu: eğimli çatı formu ve terasa açılan kapı',
    caption: 'Üst kat salon — teras kapısı' },
  { key: 'daire-1/d1-salon-ust-2.png', folder: 'daire-1', subject: 'daire-1', category: 'salon-ust', floor: 'ust',
    angle: 'üst kat mutfak nişine bakış', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 üst kat salonundan çatı katı mutfak nişine bakış',
    caption: 'Üst kat salon' },
  { key: 'daire-1/d1-teras-1.png', folder: 'daire-1', subject: 'daire-1', category: 'teras', floor: 'ust',
    angle: 'teras korkuluğu + deniz', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 1 çatı terası: beyaz parapet ve metal korkuluk ötesinde Marmara Denizi',
    caption: 'Çatı terası — deniz yönü' },
  { key: 'daire-1/d1-teras-2.png', folder: 'daire-1', subject: 'daire-1', category: 'teras', floor: 'ust',
    angle: 'teras köşesi; kıyı + kuleler', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 1 terasından kıyı şeridi, sahil parkı ve uzakta rezidans kuleleri',
    caption: 'Terastan kıyı şeridi' },
  { key: 'daire-1/d1-teras-3.png', folder: 'daire-1', subject: 'daire-1', category: 'teras', floor: 'ust',
    angle: 'geniş panorama bandı', orientation: 'genis', quality: 5, use: 'hero',
    alt: 'Daire 1 terasından geniş panorama: deniz, sahil parkı ve şehir silueti',
    caption: 'Teras panoraması' },
  { key: 'daire-1/d2-balkon.png', folder: 'daire-1', subject: 'daire-1', category: 'balkon', floor: 'alt',
    angle: 'servis balkonu; dolap + ferforje', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 balkonu: gri seramik zemin, beyaz kiler dolabı ve ferforje korkuluk',
    caption: 'Daire 1 — balkon' },
  { key: 'daire-1/d2-banyo-1.png', folder: 'daire-1', subject: 'daire-1', category: 'banyo', floor: 'ust',
    angle: 'aynalı dolap + eğik pencereli duş', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 üst kat banyosu: siyah çerçeveli duş, aynalı dolap ve eğimli çatı penceresi',
    caption: 'Üst kat banyo' },
  { key: 'daire-1/d2-banyo-2.png', folder: 'daire-1', subject: 'daire-1', category: 'banyo', floor: null,
    angle: 'köşe duş + gri fon duvarı', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 banyosu: köşe duş kabini, gri fon duvarı ve asma lavabo dolabı',
    caption: 'Banyo — köşe duş' },
  { key: 'daire-1/d2-koridor.png', folder: 'daire-1', subject: 'daire-1', category: 'koridor', floor: 'alt',
    angle: 'hol + iç merdiven birlikte', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 holü: parlak krem mermer zemin ve ahşap basamaklı dubleks merdiveni',
    caption: 'Hol ve iç merdiven' },
  { key: 'daire-1/d2-merdiven.png', folder: 'daire-1', subject: 'daire-1', category: 'merdiven', floor: null,
    angle: 'merdiven yakın plan; ışıklık altında', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 dubleks merdiveni yakın plan: ahşap basamaklar ve paslanmaz korkuluk',
    caption: 'Dubleks merdiveni' },
  { key: 'daire-1/d2-mutfak-ust.png', folder: 'daire-1', subject: 'daire-1', category: 'mutfak-ust', floor: 'ust',
    angle: 'çatı eğimi altında mutfak nişi', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 1 çatı katı mutfak nişi: eğimli tavana uyarlanmış krem dolaplar ve şehir manzaralı pencere',
    caption: 'Çatı katı mutfağı' },
  { key: 'daire-1/d2-oda-1.png', folder: 'daire-1', subject: 'daire-1', category: 'oda', floor: 'alt',
    angle: 'siyah pencere, sade kare', orientation: 'yatay', quality: 3, use: 'gallery',
    alt: 'Daire 1 yatak odası: siyah doğramalı pencere ve lamine parke',
    caption: 'Yatak odası' },
  { key: 'daire-1/d2-oda-2.png', folder: 'daire-1', subject: 'daire-1', category: 'oda-cati', floor: 'ust',
    angle: 'eğimli tavan, antrasit dam penceresi', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 1 çatı katı odası: eğimli tavan ve antrasit dam penceresi',
    caption: 'Çatı katı odası' },
  { key: 'daire-1/d2-salon-alt.png', folder: 'daire-1', subject: 'daire-1', category: 'salon-alt', floor: 'alt',
    angle: 'üçlü balkon kapısı + yan pencere', orientation: 'yatay', quality: 5, use: 'gallery',
    alt: 'Daire 1 alt kat salonu: üç kanatlı ferforjeli balkon kapısı ve deniz ufuklu yan pencere',
    caption: 'Alt kat salon — geniş cephe' },
  { key: 'daire-1/d2-salon-ust.png', folder: 'daire-1', subject: 'daire-1', category: 'salon-ust', floor: 'ust',
    angle: 'galeri boşluğu korkuluğu + teras kapısı', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 1 üst kat salonu: merdiven galeri korkuluğu, dam pencereleri ve balkon kapısı',
    caption: 'Üst kat salon — galeri boşluğu' },
  { key: 'daire-1/d2-teras.png', folder: 'daire-1', subject: 'daire-1', category: 'teras', floor: 'ust',
    angle: 'çatı sırtı boyunca teras', orientation: 'dikey', quality: 4, watermark: 'ucuncu-taraf', use: 'exclude',
    alt: 'Daire 1 çatı terası (üçüncü taraf ilan referansı taşıdığı için vitrinde kullanılmaz)',
    caption: 'Teras (dışlandı — filigran)' },
  { key: 'daire-1/otopark.png', folder: 'daire-1', subject: 'ortak', category: 'otopark', floor: null,
    angle: 'kapalı otopark; numaralı cepler', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Binanın kapalı otoparkı: numaralandırılmış park cepleri ve sarı uyarı bandı',
    caption: 'Kapalı otopark' },

  // ─── DAİRE 2 klasörü (23 dosya) ───
  { key: 'daire-2/cevre-deniz.png', folder: 'daire-2', subject: 'cevre', category: 'cevre', floor: null,
    angle: 'kayalık kıyıdan deniz', orientation: 'yatay', quality: 4, watermark: 'ucuncu-taraf', use: 'exclude',
    alt: 'Kıyıdan deniz (üçüncü taraf emlak filigranı taşıdığı için vitrinde kullanılmaz)',
    caption: 'Deniz (dışlandı — filigran)' },
  { key: 'daire-2/cevre-sahil-1.png', folder: 'daire-2', subject: 'cevre', category: 'cevre', floor: null,
    angle: 'sahil parkı çimeni + kıyı', orientation: 'yatay', quality: 5, use: 'gallery',
    alt: 'Sahil parkı: deniz kenarında çim alan, genç ağaçlar ve yürüyüş yolu',
    caption: 'Sahil parkı' },
  { key: 'daire-2/cevre-sahil-2.png', folder: 'daire-2', subject: 'cevre', category: 'cevre', floor: null,
    angle: 'palmiyeli kıyı yürüyüş yolu', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Kıyı yürüyüş yolu: palmiyeler, yeşil alan ve arkada konut siluti',
    caption: 'Kıyı yürüyüş yolu' },
  { key: 'daire-2/d2-balkon.png', folder: 'daire-2', subject: 'daire-2', category: 'balkon', floor: 'alt',
    angle: 'lazer kesim korkuluklu balkon', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 2 balkonu: desenli çelik korkuluk, krem seramik ve kiler dolabı',
    caption: 'Daire 2 — balkon' },
  { key: 'daire-2/d2-banyo-1a.png', folder: 'daire-2', subject: 'daire-2', category: 'banyo', floor: null,
    angle: 'duş + gri mermer şerit', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 2 banyosu: siyah çerçeveli duş, gri mermer fon şeridi ve beyaz asma lavabo',
    caption: 'Daire 2 — banyo' },
  { key: 'daire-2/d2-banyo-1b.png', folder: 'daire-2', subject: 'daire-2', category: 'banyo', floor: null,
    angle: 'aynı banyonun ikinci karesi', orientation: 'dikey', quality: 4, duplicateOf: 'daire-2/d2-banyo-1a.png', use: 'exclude',
    alt: 'Daire 2 banyosunun tekrar karesi',
    caption: 'Banyo (tekrar)' },
  { key: 'daire-2/d2-banyo-2.png', folder: 'daire-2', subject: 'daire-2', category: 'banyo', floor: null,
    angle: 'buzlu camlı köşe duş, sıcak ton', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 2 ikinci banyo: buzlu camlı köşe duş ve bej mermer duvarlar',
    caption: 'Daire 2 — ikinci banyo' },
  { key: 'daire-2/d2-koridor.png', folder: 'daire-2', subject: 'daire-2', category: 'koridor', floor: null,
    angle: 'giriş holü; çelik kapı + merdiven korkuluğu', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 2 giriş holü: koyu ahşap çelik kapı ve iç merdiven korkuluğu',
    caption: 'Giriş holü' },
  { key: 'daire-2/d2-merdiven-1.png', folder: 'daire-2', subject: 'daire-2', category: 'merdiven', floor: null,
    angle: 'iç merdiven; hol perspektifi', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 2 dubleks merdiveni: ahşap basamaklar, paslanmaz taşıyıcı ve parlak krem zemin',
    caption: 'Dubleks merdiveni' },
  { key: 'daire-2/d2-merdiven-2.png', folder: 'daire-2', subject: 'daire-2', category: 'merdiven', floor: null,
    angle: 'basamak yakın plan, alttan', orientation: 'dikey', quality: 4, use: 'support',
    alt: 'Daire 2 merdiveni yakın plan: dönel ahşap basamaklar',
    caption: 'Merdiven detayı' },
  { key: 'daire-2/d2-mutfak-alt.png', folder: 'daire-2', subject: 'daire-2', category: 'mutfak-alt', floor: 'alt',
    angle: 'galeri mutfak; ferforjeli balkon kapısı', orientation: 'dikey', quality: 5, use: 'hero',
    alt: 'Daire 2 mutfağı: beyaz dolaplar, mozaik tezgâh arası ve ferforje korkuluklu balkon kapısı',
    caption: 'Daire 2 — mutfak' },
  { key: 'daire-2/d2-mutfak-ust.png', folder: 'daire-2', subject: 'daire-2', category: 'mutfak-ust', floor: 'ust',
    angle: 'çatı eğimli üst mutfak nişi', orientation: 'yatay', quality: 5, use: 'gallery',
    alt: 'Daire 2 çatı katı mutfak nişi: eğime uyarlanmış dolaplar ve tezgâh',
    caption: 'Çatı katı mutfağı' },
  { key: 'daire-2/d2-oda-1a.png', folder: 'daire-2', subject: 'daire-2', category: 'oda', floor: 'alt',
    angle: 'kademeli tavan, siyah pencere', orientation: 'dikey', quality: 3, use: 'gallery',
    alt: 'Daire 2 yatak odası: kademeli tavan ve siyah doğramalı pencere',
    caption: 'Daire 2 — yatak odası' },
  { key: 'daire-2/d2-oda-1b.png', folder: 'daire-2', subject: 'daire-2', category: 'oda', floor: 'alt',
    angle: 'radyatörlü sade kare', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 2 yatak odası: pencere önü radyatör ve lamine parke',
    caption: 'Yatak odası' },
  { key: 'daire-2/d2-oda-2a.png', folder: 'daire-2', subject: 'daire-2', category: 'oda-cati', floor: 'ust',
    angle: 'gri dam penceresi, tuğla komşu duvar', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Daire 2 çatı katı odası: gri doğramalı dam penceresi ve eğimli tavan',
    caption: 'Çatı katı odası' },
  { key: 'daire-2/d2-oda-2b.png', folder: 'daire-2', subject: 'daire-2', category: 'oda-cati', floor: 'ust',
    angle: 'aynı odada karşı açı; siyah halka armatür', orientation: 'dikey', quality: 4, use: 'gallery',
    alt: 'Daire 2 çatı katı odası: eğimli tavan ve siyah halka tavan armatürü',
    caption: 'Çatı katı odası — karşı açı' },
  { key: 'daire-2/d2-oda-3a.png', folder: 'daire-2', subject: 'daire-2', category: 'oda-cati', floor: 'ust',
    angle: 'dam penceresinden çatı/baca görünümü', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Daire 2 çatı katı odası: dam penceresinden komşu çatılar',
    caption: 'Çatı katı odası — çatı görünümü' },
  { key: 'daire-2/d2-oda-3b.png', folder: 'daire-2', subject: 'daire-2', category: 'oda-cati', floor: 'ust',
    angle: 'komşu dam penceresine bakan kare', orientation: 'dikey', quality: 4, use: 'support',
    alt: 'Daire 2 çatı katı odası: pencereden komşu dam pencereleri',
    caption: 'Çatı katı odası' },
  { key: 'daire-2/d2-salon-alt-1.png', folder: 'daire-2', subject: 'daire-2', category: 'salon-alt', floor: 'alt',
    angle: 'salon genel; hole açılan kapı', orientation: 'yatay', quality: 4, use: 'gallery',
    alt: 'Daire 2 alt kat salonu: geniş siyah pencere, camlı iç kapı ve lamine parke',
    caption: 'Daire 2 — alt kat salon' },
  { key: 'daire-2/d2-salon-alt-2.png', folder: 'daire-2', subject: 'daire-2', category: 'salon-alt', floor: 'alt',
    angle: 'ferforjeli balkon kapısı + pencere', orientation: 'dikey', quality: 5, use: 'hero',
    alt: 'Daire 2 alt kat salonu: ferforje korkuluklu balkon kapısı ve geniş pencere',
    caption: 'Alt kat salon — balkon kapısı' },
  { key: 'daire-2/d2-salon-ust-1.png', folder: 'daire-2', subject: 'daire-2', category: 'salon-ust', floor: 'ust',
    angle: 'üst salon + mutfak nişi + teras kapısı', orientation: 'yatay', quality: 5, use: 'hero',
    alt: 'Daire 2 üst kat salonu: mutfak nişi ve terasa açılan siyah doğramalı kapı',
    caption: 'Üst kat salon — terasa açılım' },
  { key: 'daire-2/d2-salon-ust-2.png', folder: 'daire-2', subject: 'daire-2', category: 'salon-ust', floor: 'ust',
    angle: 'üst salon karşı açı; dam pencereleri', orientation: 'dikey', quality: 5, use: 'gallery',
    alt: 'Daire 2 üst kat salonu: teras kapısı ve komşu çatılara bakan dam pencereleri',
    caption: 'Üst kat salon' },
  { key: 'daire-2/d2-teras.png', folder: 'daire-2', subject: 'daire-2', category: 'teras', floor: 'ust',
    angle: 'çatılara bakan sakin teras', orientation: 'dikey', quality: 4, use: 'hero',
    alt: 'Daire 2 çatı terası: krem seramik zemin, koyu metal korkuluk ve arduvaz çatı manzarası',
    caption: 'Daire 2 — çatı terası' },
];

export const byKey: Map<string, MediaEntry> = new Map(MEDIA.map((m) => [m.key, m]));

/** public vitrine girebilecek kareler (filigranlı + tekrar kareler hariç) */
export const PUBLIC_MEDIA = MEDIA.filter((m) => m.use !== 'exclude');

/** güvenlik listesi: üçüncü taraf filigranlılar — hiçbir sayfada render edilemez */
export const BLOCKED_KEYS = MEDIA.filter((m) => m.watermark === 'ucuncu-taraf').map((m) => m.key);
