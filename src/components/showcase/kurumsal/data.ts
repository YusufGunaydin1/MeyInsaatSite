/*
  KURUMSAL VİTRİN — ortak içerik modeli (TR, kaynak metin).
  Üç tasarım varyantı (Künye / Vitrin / Süreç) AYNI bu modeli kullanır; yalnız
  yerleşim ve register değişir → tek içerik kaynağı (dual-content yok, R14).

  Metin, onaylı content/company.tr.md düzyazısının daha sıkı, aktif, spesifik
  (brief §16) hâlidir ve zengin yerleşimler (ikon ızgarası, zaman çizelgesi,
  çizim↔yapı eşlemesi) için tipli bölümlere ayrılmıştır. Yalnız MEY'in
  verebileceği sert bilgiler `pending` ile işaretlidir → görünür PlaceholderChip
  olarak çıkar, ASLA uydurulmaz (content/company.json disiplini). Bir varyant
  kazanınca içerik company.tr.md'ye taşınır; o zamana dek prod company.tr.md kullanır.

  Görseller: src/assets içindeki küratörlü webp (bkz. scripts/convert-frames.mjs).
  İzometrikler ŞEFFAF zeminli aksonometri render'lerdir (beyazda "yüzer").
  Bina görselleri AI-render'dir (gerçek foto değil) → "temsilî" notu korunur.
*/
import type { ImageMetadata } from 'astro';

// Şeffaf aksonometri render'ler (çizim katmanı)
import aliIso from '../../../assets/projects/ali-izometrik.webp';
import eleleIso from '../../../assets/projects/el-ele-apartmani-izometrik.webp';
import sapanIso from '../../../assets/projects/sapanbaglari-izometrik.webp';
// Gerçekleşen bina görselleri (yapı katmanı, 3:4)
import aliPhoto from '../../../assets/showcase/ali.webp';
import elelePhoto from '../../../assets/showcase/el-ele-apartmani.webp';
import sapanPhoto from '../../../assets/showcase/sanbaglari.webp';
// Kurumsal atmosfer / kanıt görselleri
import skyline from '../../../assets/photos/hero-three-blocks-sky.webp';
import cornerGolden from '../../../assets/photos/hero-residential-corner-building.webp';
import planningDesk from '../../../assets/photos/planning-design-desk.webp';
import materials from '../../../assets/photos/materials-finish-palette.webp';
import lobby from '../../../assets/photos/lobby-elevator-stairwell.webp';
import redLines from '../../../assets/photos/red-architectural-lines.webp';
// Marka ikon seti (480² beyaz zemin) — süreç/kabiliyet katmanı
import icon1 from '../../../assets/showcase/icon-1.webp';
import icon2 from '../../../assets/showcase/icon-2.webp';
import icon3 from '../../../assets/showcase/icon-3.webp';
import icon4 from '../../../assets/showcase/icon-4.webp';
import icon5 from '../../../assets/showcase/icon-5.webp';
import icon6 from '../../../assets/showcase/icon-6.webp';
import icon7 from '../../../assets/showcase/icon-7.webp';
import icon8 from '../../../assets/showcase/icon-8.webp';

export const img = {
  aliIso, eleleIso, sapanIso,
  aliPhoto, elelePhoto, sapanPhoto,
  skyline, cornerGolden, planningDesk, materials, lobby, redLines,
  icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8,
};

export interface Milestone {
  no: string;
  tag: string;
  title: string;
  text: string;
  /** yalnız MEY'in verebileceği eksik bilgi → chip etiketi */
  pending?: string;
}
export interface Value {
  no: string;
  name: string;
  text: string;
}
export interface Step {
  no: string;
  name: string;
  text: string;
  icon: ImageMetadata;
}
export interface Building {
  slug: string;
  name: string;
  blurb: string;
  meta: string;
  photo: ImageMetadata;
  iso: ImageMetadata;
}

export const corp = {
  eyebrow: 'KURUMSAL',
  coord: 'MEY GRUBU · 23 YIL · İNŞAAT: 6 YIL',
  slogan: 'Çizdiğimizi inşa ederiz.',
  lead:
    'MEY İnşaat, 23 yıllık MEY Grubu’nun konut markasıdır. Grubun kozmetikte ' +
    'kazandığı güveni ve disiplini 6 yıldır İstanbul’da apartmanlara taşıyoruz — ' +
    'çizdiğimiz projeyi, söz verdiğimiz kalitede ve zamanında.',

  whoTitle: 'Biz Kimiz',
  who: [
    'MEY İnşaat, MEY Grubu’nun inşaat markasıdır. Grup 23 yıl önce MEY Kozmetik ile ' +
      'kuruldu; kalite, güven ve sürdürülebilir büyüme üzerine bir iş kültürü oluşturdu. ' +
      'Bu birikimi son 6 yıldır inşaata taşıyoruz.',
    'İşimiz tek bir ilkeye dayanır: çizdiğimiz her projeyi, söz verdiğimiz kalitede ve ' +
      'zamanında inşa etmek. Modern yapı teknikleri, seçilmiş malzemeler ve baştan sona ' +
      'şeffaf bir süreçle; huzurla yaşanan, değerini uzun yıllar koruyan binalar üretiriz.',
  ],

  storyTitle: 'Hikayemiz',
  story: [
    {
      no: '01',
      tag: '23 YIL ÖNCE',
      title: 'MEY Kozmetik',
      text:
        'Grubun kurumsal yolculuğu, doğru ürünü tutarlı kalitede ve zamanında sunma ' +
        'ilkesiyle başladı. Öncü isim:',
      pending: 'Kurucu',
    },
    {
      no: '02',
      tag: '6 YIL ÖNCE',
      title: 'MEY İnşaat',
      text:
        'Kozmetikte yıllar içinde kazanılan güveni, insanların hayatındaki en büyük ' +
        'yatırıma — konuta — taşımak için MEY İnşaat’ı kurduk.',
    },
    {
      no: '03',
      tag: 'BUGÜN',
      title: 'İstanbul’da konut',
      text:
        'İstanbul’da; hızlı değil doğru büyümeyi önceleyen, kontrollü ve sürdürülebilir ' +
        'bir stratejiyle konut geliştirmeye devam ediyoruz.',
    },
  ] as Milestone[],

  valuesTitle: 'Değerlerimiz',
  values: [
    {
      no: '01',
      name: 'Güven',
      text:
        '23 yıllık kurumsal geçmişimizin temelinde güven var. Verdiğimiz sözün, ' +
        'imzaladığımız sözleşmenin ve çizdiğimiz projenin arkasında dururuz.',
    },
    {
      no: '02',
      name: 'Kalite',
      text:
        'Malzemeden işçiliğe, temelden çatıya kadar her aşamada standartlarımızdan ' +
        'ödün vermeyiz. Her bina, değerini uzun yıllar koruyacak şekilde inşa edilir.',
    },
    {
      no: '03',
      name: 'Şeffaflık',
      text:
        'Süreci baştan sona açık yönetiriz. Alıcı, yatırımcı ve iş ortaklarımız projenin ' +
        'her aşamada nerede olduğunu bilir. Sürpriz değil, netlik sunarız.',
    },
    {
      no: '04',
      name: 'Sürdürülebilir Büyüme',
      text:
        'Hızlı değil, doğru büyürüz. Her tamamlanan proje, bir sonrakinin referansıdır.',
    },
  ] as Value[],

  processTitle: 'Nasıl Çalışırız',
  processIntro: 'Çizimden anahtar teslimine, her proje aynı beş adımdan geçer.',
  process: [
    { no: '01', name: 'Etüt & Zemin', icon: icon7, text: 'Zemin ve ruhsat süreçleri; temel çukuru ile donatı hazırlanır.' },
    { no: '02', name: 'Kaba İnşaat', icon: icon3, text: 'Betonarme taşıyıcı sistem, mühendislik standartlarında kat kat yükselir.' },
    { no: '03', name: 'Duvar & Cephe', icon: icon5, text: 'Dolgu duvar, yalıtım ve cephe uygulanır; kat planları belirginleşir.' },
    { no: '04', name: 'Kalite Kontrol', icon: icon6, text: 'Her aşamada kontrol; ince işler ve detaylar titizlikle tamamlanır.' },
    { no: '05', name: 'Teslim', icon: icon2, text: 'Kontrolleri geçen daireler, söz verilen zamanda anahtar teslim edilir.' },
  ] as Step[],

  portfolioTitle: 'Portföy',
  portfolioIntro: 'Bugüne kadar tamamladığımız konut projelerinden.',
  buildings: [
    {
      slug: 'ali',
      name: 'Maşuk Apartmanı',
      blurb: 'Cam balkonlu, turuncu-beyaz cepheli modern konut.',
      meta: 'İSTANBUL · KONUT · TAMAMLANDI',
      photo: aliPhoto,
      iso: aliIso,
    },
    {
      slug: 'el-ele-apartmani',
      name: 'El Ele Apartmanı',
      blurb: 'Ferforje korkuluklu, zarif beyaz cepheli konut.',
      meta: 'İSTANBUL · KONUT · TAMAMLANDI',
      photo: elelePhoto,
      iso: eleleIso,
    },
    {
      slug: 'sapanbaglari',
      name: 'Çamoğlu Apartmanı',
      blurb: 'Beyaz-antrasit cepheli, kırmızı çatılı modern konut.',
      meta: 'İSTANBUL · KONUT · TAMAMLANDI',
      photo: sapanPhoto,
      iso: sapanIso,
    },
  ] as Building[],

  missionTitle: 'Misyon',
  mission: 'İstanbul’da, içinde huzurla yaşanan ve değerini koruyan konutlar üretmek.',
  visionTitle: 'Vizyon',
  vision:
    'MEY Grubu’nun kurumsal güvenini, inşaat sektöründe referans gösterilen bir markaya dönüştürmek.',

  ctaTitle: 'Projeleriniz için konuşalım.',
  ctaSub: 'Tamamladığımız projeleri görün ya da doğrudan bize ulaşın.',
  ctaProjects: 'Projeleri gör',
  ctaContact: 'İletişim',

  // Görsel dürüstlük notu (AI-render): binalar temsilîdir.
  repNote: 'Görseller temsilîdir (AI render); gerçek fotoğraflar geldiğinde güncellenecektir.',
};
