/*
  Satılık listesi adası — liste-ref.png düzeni, dürüst envanterle: sekmeler
  (Tümü/Daireler/Projeler), canlı filtreler, sıralama, favoriler, kart ızgarası,
  sağ rayda karşılaştırma + hızlı form. Izgara iki tür kart taşır: gerçek ilanlar
  (yalnız El Ele dubleksleri — fiyat/kalp/karşılaştırma) ve proje kartları
  (satılmışlar kırmızı TÜMÜ SATILDI bandı taşır, fiyatsız, proje sayfasına çıkar).
  Birim filtreleri (kat/oda/m²/fiyat) aktifken proje kartları ızgaradan düşer;
  fiyat sıralaması fiyatsız proje kartlarını hep sona koyar. Henüz var olmayan
  uçlar (harita, karşılaştırma görünümü) ortak "yakında" diyaloğunu açar.
*/
import { useMemo, useState } from 'react';
import RailForm from './RailForm';

export interface ListingImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export interface ListingItem {
  kind: 'ilan';
  id: string;
  tip: 'daire' | 'dubleks';
  baslik: string;
  proje: string;
  projeKey: string;
  blokKat: string;
  oda: string;
  brut: number;
  banyo: number;
  balkon: number;
  kat: string;
  katKey: string;
  fiyat: number;
  fiyatText: string;
  badge?: string;
  href: string;
  img: ListingImage;
}

export interface ListingProjeItem {
  kind: 'proje';
  id: string;
  ad: string;
  projeKey: string;
  konum: string;
  sold: boolean;
  not: string;
  rozet?: string;
  href: string;
  img: ListingImage;
}

export type ListingCard = ListingItem | ListingProjeItem;

interface Props {
  items: ListingCard[];
  projeler: { key: string; ad: string }[];
}

const TUMU = 'tumu';
const PAGE = 6;

function openSoon(title: string) {
  const dialog = document.querySelector<HTMLDialogElement>('.kc-soon');
  const t = dialog?.querySelector<HTMLElement>('[data-soon-title]');
  if (dialog && t) {
    t.textContent = `${title} — hazırlanıyor`;
    dialog.showModal();
  }
}

const I = {
  oda: 'M4 17v-5.5A1.5 1.5 0 0 1 5.5 10H12v7M12 10h6.5A1.5 1.5 0 0 1 20 11.5V17M4 15h16M7 10V7.5h4V10',
  brut: 'M4 4h16v16H4V4Zm0 5h5V4M15 20v-5h5',
  banyo: 'M5 12h15v2.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V12Zm2 0V6a2 2 0 0 1 4 0M9.5 20l-1 1.5M15.5 20l1 1.5',
  balkon: 'M4 11h16M6 11v6M10 11v6M14 11v6M18 11v6M4 17h16M12 11V5.5M8 7.5C8 5.6 9.8 4 12 4s4 1.6 4 3.5',
  kat: 'M4 20h4v-4h4v-4h4V8h4V4',
  kalp: 'M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z',
  x: 'm6 6 12 12M18 6 6 18',
  harita: 'M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Zm0 0v14m6-12v14',
  tel: 'M7 3.5h4L12.5 9l-2.3 1.6a12 12 0 0 0 3.2 3.2L15 11.5l5.5 1.5v4a1.8 1.8 0 0 1-2 1.8C10.5 18 6 13.5 5.2 5.5A1.8 1.8 0 0 1 7 3.5Z',
  chat: 'M4 5.5h16v11H9.5L5.5 20v-3.5H4v-11Z',
};

function Ic({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

interface Filters {
  proje: string;
  kat: string;
  oda: string;
  m2: string;
  fiyat: string;
}
const EMPTY: Filters = { proje: TUMU, kat: TUMU, oda: TUMU, m2: TUMU, fiyat: TUMU };

function matches(u: ListingCard, f: Filters, tab: string, favOnly: boolean, favs: Set<string>) {
  if (tab !== TUMU && u.kind !== tab) return false;
  if (favOnly && (u.kind !== 'ilan' || !favs.has(u.id))) return false;
  if (f.proje !== TUMU && u.projeKey !== f.proje) return false;
  if (u.kind === 'proje') {
    // birim filtreleri yalnız ilanları tarif eder — herhangi biri aktifken proje kartları düşer
    return f.kat === TUMU && f.oda === TUMU && f.m2 === TUMU && f.fiyat === TUMU;
  }
  if (f.kat !== TUMU && u.katKey !== f.kat) return false;
  if (f.oda !== TUMU && u.oda !== f.oda) return false;
  if (f.m2 === '0-100' && u.brut >= 100) return false;
  if (f.m2 === '100-150' && (u.brut < 100 || u.brut > 150)) return false;
  if (f.m2 === '150+' && u.brut < 150) return false;
  if (f.fiyat === '0-6' && u.fiyat >= 6_000_000) return false;
  if (f.fiyat === '6-10' && (u.fiyat < 6_000_000 || u.fiyat > 10_000_000)) return false;
  if (f.fiyat === '10+' && u.fiyat < 10_000_000) return false;
  return true;
}

export default function SaleListing({ items, projeler }: Props) {
  const [tab, setTab] = useState(TUMU);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [favOnly, setFavOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [compare, setCompare] = useState<string[]>(['d11', 'd12']);

  const visible = useMemo(() => {
    const list = items.filter((u) => matches(u, filters, tab, favOnly, favs));
    list.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'ilan' ? -1 : 1; // fiyatsız proje kartları hep sonda
      if (a.kind !== 'ilan' || b.kind !== 'ilan') return 0;
      return sort === 'asc' ? a.fiyat - b.fiyat : b.fiyat - a.fiyat;
    });
    return list;
  }, [items, filters, tab, favOnly, favs, sort]);

  const counts = useMemo(
    () => ({
      tumu: items.length,
      ilan: items.filter((u) => u.kind === 'ilan').length,
      proje: items.filter((u) => u.kind === 'proje').length,
    }),
    [items]
  );

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, [k]: e.target.value }));
    setShown(PAGE);
  };
  const toggleFav = (id: string) =>
    setFavs((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const compareItems = compare
    .map((id) => items.find((u) => u.id === id))
    .filter((u): u is ListingItem => !!u && u.kind === 'ilan');

  return (
    <div className="kl" data-testid="kl">
      <div className="kl-main">
        {/* SEKMELER + sağ eylemler */}
        <div className="kl-tabs-row">
          <div className="kl-tabs" role="tablist" aria-label="İlan tipi">
            {([['tumu', `Tümü (${counts.tumu})`], ['ilan', `Daireler (${counts.ilan})`], ['proje', `Projeler (${counts.proje})`]] as const).map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key}
                className={tab === key ? 'kl-tab is-active' : 'kl-tab'}
                onClick={() => { setTab(key); setShown(PAGE); }}
                data-testid={`kl-tab-${key}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="kl-tab-actions">
            <button type="button" className="kl-ghost" onClick={() => openSoon('Harita görünümü')} data-testid="kl-harita">
              <Ic d={I.harita} /> Harita Görünümü
            </button>
            <button type="button" className={favOnly ? 'kl-ghost is-active' : 'kl-ghost'}
              onClick={() => { setFavOnly((v) => !v); setShown(PAGE); }} data-testid="kl-favorilerim">
              <Ic d={I.kalp} /> Favorilerim ({favs.size})
            </button>
          </div>
        </div>

        {/* FİLTRE ÇUBUĞU — canlı */}
        <div className="kl-filters" data-testid="kl-filters">
          <label className="kx-field">
            <span className="kx-field-label">Proje Seçin</span>
            <select value={filters.proje} onChange={set('proje')} data-testid="kl-f-proje">
              <option value={TUMU}>Tümü</option>
              {projeler.map((p) => <option key={p.key} value={p.key}>{p.ad}</option>)}
            </select>
          </label>
          <label className="kx-field">
            <span className="kx-field-label">Kat</span>
            <select value={filters.kat} onChange={set('kat')} data-testid="kl-f-kat">
              <option value={TUMU}>Tümü</option>
              <option value="5-6">5.–6. Kat</option>
            </select>
          </label>
          <label className="kx-field">
            <span className="kx-field-label">Oda Sayısı</span>
            <select value={filters.oda} onChange={set('oda')} data-testid="kl-f-oda">
              <option value={TUMU}>Tümü</option>
              <option value="3+2">3+2</option>
            </select>
          </label>
          <label className="kx-field">
            <span className="kx-field-label">m² Aralığı</span>
            <select value={filters.m2} onChange={set('m2')} data-testid="kl-f-m2">
              <option value={TUMU}>Tümü</option>
              <option value="150+">150 m² üzeri</option>
            </select>
          </label>
          <label className="kx-field">
            <span className="kx-field-label">Fiyat Aralığı</span>
            <select value={filters.fiyat} onChange={set('fiyat')} data-testid="kl-f-fiyat">
              <option value={TUMU}>Tümü</option>
              <option value="10+">10 milyon TL üzeri</option>
            </select>
          </label>
          <button type="button" className="kl-clear" data-testid="kl-clear"
            onClick={() => { setFilters(EMPTY); setTab(TUMU); setFavOnly(false); setShown(PAGE); }}>
            ⟳ Filtreyi Temizle
          </button>
        </div>

        {/* SONUÇ SATIRI */}
        <div className="kl-results-row">
          <p className="kl-count" data-testid="kl-count"><strong>{visible.length}</strong> sonuç bulundu</p>
          <label className="kl-sort">
            Sırala:
            <select value={sort} onChange={(e) => setSort(e.target.value as 'asc' | 'desc')} data-testid="kl-sort">
              <option value="asc">Fiyata (Düşükten Yükseğe)</option>
              <option value="desc">Fiyata (Yüksekten Düşüğe)</option>
            </select>
          </label>
        </div>

        {/* KART IZGARASI */}
        <div className="kl-grid" data-testid="kl-grid">
          {visible.slice(0, shown).map((u) => u.kind === 'proje' ? (
            <article key={u.id} className={u.sold ? 'kl-card kl-card-bina is-sold' : 'kl-card kl-card-bina'}
              data-testid="kl-card" data-unit={u.id} data-kind="proje">
              <div className="kl-card-media">
                <img src={u.img.src} srcSet={u.img.srcset} sizes="(min-width: 900px) 300px, 94vw"
                  width={u.img.width} height={u.img.height} alt={u.img.alt} loading="lazy" />
                {u.sold
                  ? <span className="kl-sold" data-testid={`kl-sold-${u.projeKey}`}>TÜMÜ SATILDI</span>
                  : u.rozet && <span className="kl-badge is-red">{u.rozet}</span>}
                <span className="kl-badge is-dark kl-kind">PROJE</span>
              </div>
              <div className="kl-card-body">
                <h3 className="kl-card-title">{u.ad}</h3>
                <p className="kl-card-proje">{u.konum} · Tamamlandı</p>
                <p className="kl-proje-not">{u.not}</p>
                <div className="kl-card-foot">
                  <a className="kl-detail kl-detail-ghost" href={u.href} data-testid={`kl-proje-${u.projeKey}`}>Projeyi İncele ›</a>
                </div>
              </div>
            </article>
          ) : (
            <article key={u.id} className="kl-card" data-testid="kl-card" data-unit={u.id} data-kind="ilan">
              <div className="kl-card-media">
                <img src={u.img.src} srcSet={u.img.srcset} sizes="(min-width: 900px) 300px, 94vw"
                  width={u.img.width} height={u.img.height} alt={u.img.alt} loading="lazy" />
                <span className="kl-badge is-red">SATILIK</span>
                {u.badge && <span className="kl-badge is-dark">{u.badge}</span>}
                <button type="button"
                  className={favs.has(u.id) ? 'kl-heart is-active' : 'kl-heart'}
                  aria-label={favs.has(u.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  aria-pressed={favs.has(u.id)}
                  onClick={() => toggleFav(u.id)}
                  data-testid={`kl-fav-${u.id}`}>
                  <Ic d={I.kalp} size={17} />
                </button>
              </div>
              <div className="kl-card-body">
                <h3 className="kl-card-title">{u.baslik}</h3>
                <p className="kl-card-proje">{u.proje} · {u.blokKat}</p>
                <ul className="kl-card-stats">
                  <li><Ic d={I.oda} /><span>{u.oda}</span><em>Oda</em></li>
                  <li><Ic d={I.brut} /><span>{u.brut} m²</span><em>Brüt</em></li>
                  <li><Ic d={I.banyo} /><span>{u.banyo}</span><em>Banyo</em></li>
                  <li><Ic d={I.balkon} /><span>{u.balkon}</span><em>Balkon</em></li>
                  <li><Ic d={I.kat} /><span>{u.kat.replace(' Kat', '')}</span><em>Konum</em></li>
                </ul>
                <div className="kl-card-foot">
                  <p className="kl-price tabular-nums">{u.fiyatText}</p>
                  <a className="kl-detail" href={u.href} data-testid={`kl-detay-${u.id}`}>Detayları Gör ›</a>
                </div>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <p className="kx-empty" data-testid="kl-empty">Bu filtrelerle sonuç yok — filtreyi temizleyin.</p>
          )}
        </div>

        {visible.length > shown && (
          <p className="kl-more">
            <button type="button" className="kl-ghost" onClick={() => setShown((n) => n + PAGE)} data-testid="kl-more">
              Daha Fazla Yükle ↓
            </button>
          </p>
        )}
      </div>

      {/* SAĞ RAY */}
      <aside className="kl-rail">
        {compareItems.length > 0 && (
          <div className="kl-compare" data-testid="kl-compare">
            <div className="kl-compare-head">
              <p className="t-tech">KARŞILAŞTIRMA ({compareItems.length}/3)</p>
              <button type="button" aria-label="Karşılaştırmayı kapat" onClick={() => setCompare([])} data-testid="kl-compare-close">
                <Ic d={I.x} size={15} />
              </button>
            </div>
            {compareItems.map((u) => (
              <div key={u.id} className="kl-compare-item">
                <img src={u.img.src} alt="" width="64" height="48" loading="lazy" />
                <div>
                  <p className="kl-compare-title">{u.baslik}</p>
                  <p className="kl-compare-sub">{u.proje} · {u.blokKat}</p>
                  <p className="kl-compare-price tabular-nums">{u.fiyatText}</p>
                </div>
                <button type="button" aria-label={`${u.baslik} karşılaştırmadan çıkar`}
                  onClick={() => setCompare((c) => c.filter((id) => id !== u.id))}>
                  <Ic d={I.x} size={13} />
                </button>
              </div>
            ))}
            <button type="button" className="kl-compare-cta" onClick={() => openSoon('Karşılaştırma görünümü')} data-testid="kl-compare-cta">
              Karşılaştır
            </button>
          </div>
        )}

        <div className="kl-quick">
          <h3 className="t-heading-s">Hızlı İletişim</h3>
          <p className="t-caption kl-quick-sub">Size en uygun daireyi birlikte bulalım.</p>
          <RailForm konu="Satılık daireler" />
          <div className="kl-quick-lines">
            <button type="button" onClick={() => openSoon('Satış hattı')}><Ic d={I.tel} /> Bizi arayın — yakında</button>
            <button type="button" onClick={() => openSoon('WhatsApp hattı')}><Ic d={I.chat} /> WhatsApp — yakında</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
