/*
  Daire filtre + kart ızgarası adası. İki dizilim: 'a' (proje-merkezli: kat/tip/
  durum/fiyat seçicileri) ve 'b' (vitrin: proje sekmeleri + oda seçici).
  Filtreler Filtrele'ye basınca uygulanır (ref davranışı); Temizle sıfırlar.
  Görseller sunucudan düz URL gelir; satılmış dairelerde foto YOK (yanlış
  atıf yapılmaz) — stilize plan glifi gösterilir.
*/
import { useMemo, useState } from 'react';

export interface ExplorerImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export interface ExplorerItem {
  id: string;
  kind: 'unit' | 'teaser';
  proje: string;
  projeLabel: string;
  no?: string;
  kat?: string;
  katKey?: string;
  tip?: string;
  oda?: string;
  brut?: number;
  fiyatText?: string;
  durum?: 'musait' | 'satildi';
  badge?: string;
  href?: string;
  cta?: string;
  img?: ExplorerImage;
}

interface Props {
  mode: 'a' | 'b';
  items: ExplorerItem[];
}

const TUMU = 'tumu';

interface Filters {
  kat: string;
  tip: string;
  durum: string;
  fiyat: string;
  oda: string;
  proje: string;
}
const EMPTY: Filters = { kat: TUMU, tip: TUMU, durum: TUMU, fiyat: TUMU, oda: TUMU, proje: TUMU };

function matches(it: ExplorerItem, f: Filters): boolean {
  if (f.proje !== TUMU && it.proje !== f.proje) return false;
  if (f.kat !== TUMU && it.katKey !== f.kat) return false;
  if (f.tip !== TUMU && it.tip !== f.tip) return false;
  if (f.oda !== TUMU && it.oda !== f.oda) return false;
  if (f.durum !== TUMU && it.durum !== f.durum) return false;
  if (f.fiyat === 'acik' && !it.fiyatText) return false;
  return true;
}

function PlanGlyph() {
  return (
    <svg viewBox="0 0 64 44" className="kx-glyph" aria-hidden="true">
      <rect x="2" y="2" width="60" height="40" />
      <path d="M2 16h26M28 2v26M28 28h34M46 28v14" />
    </svg>
  );
}

export default function UnitsExplorer({ mode, items }: Props) {
  const [pending, setPending] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [tab, setTab] = useState(TUMU);

  const active: Filters = mode === 'b' ? { ...applied, proje: tab } : applied;
  const visible = useMemo(() => items.filter((it) => matches(it, active)), [items, active]);

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setPending((p) => ({ ...p, [k]: e.target.value }));

  const projeler = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) if (!seen.has(it.proje)) seen.set(it.proje, it.projeLabel);
    return [...seen.entries()];
  }, [items]);

  return (
    <div className={`kx kx-${mode}`} data-testid={`kx-${mode}`}>
      {mode === 'b' && (
        <div className="kx-tabs" role="tablist" aria-label="Proje seçimi" data-testid="kx-tabs">
          {[[TUMU, 'Tüm Projeler'] as [string, string], ...projeler].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={tab === key}
              className={tab === key ? 'kx-tab is-active' : 'kx-tab'}
              onClick={() => setTab(key)}
              data-testid={`kx-tab-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form
        className="kx-filters"
        data-testid="kx-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(pending);
        }}
      >
        {mode === 'a' && (
          <>
            <label className="kx-field">
              <span className="kx-field-label">Kat</span>
              <select value={pending.kat} onChange={set('kat')} data-testid="kx-f-kat">
                <option value={TUMU}>Tümü</option>
                <option value="1">1. Kat</option>
                <option value="2">2. Kat</option>
                <option value="3">3. Kat</option>
                <option value="4">4. Kat</option>
                <option value="5-6">5.–6. Kat (Dubleks)</option>
              </select>
            </label>
            <label className="kx-field">
              <span className="kx-field-label">Daire Tipi</span>
              <select value={pending.tip} onChange={set('tip')} data-testid="kx-f-tip">
                <option value={TUMU}>Tümü</option>
                <option value="3+1">3+1</option>
                <option value="3+2 Dubleks">3+2 Dubleks</option>
              </select>
            </label>
            <label className="kx-field">
              <span className="kx-field-label">Durum</span>
              <select value={pending.durum} onChange={set('durum')} data-testid="kx-f-durum">
                <option value={TUMU}>Tümü</option>
                <option value="musait">Müsait</option>
                <option value="satildi">Satıldı</option>
              </select>
            </label>
            <label className="kx-field">
              <span className="kx-field-label">Fiyat</span>
              <select value={pending.fiyat} onChange={set('fiyat')} data-testid="kx-f-fiyat">
                <option value={TUMU}>Tümü</option>
                <option value="acik">Fiyatı açıklananlar</option>
              </select>
            </label>
          </>
        )}
        {mode === 'b' && (
          <label className="kx-field">
            <span className="kx-field-label">Oda Sayısı</span>
            <select value={pending.oda} onChange={set('oda')} data-testid="kx-f-oda">
              <option value={TUMU}>Tümü</option>
              <option value="3+2">3+2</option>
            </select>
          </label>
        )}
        <button type="submit" className="kx-apply" data-testid="kx-apply">Filtrele</button>
        <button
          type="button"
          className="kx-clear"
          data-testid="kx-clear"
          onClick={() => {
            setPending(EMPTY);
            setApplied(EMPTY);
            setTab(TUMU);
          }}
        >
          Tümünü Temizle
        </button>
        <p className="kx-count" data-testid="kx-count" aria-live="polite">
          {visible.length} sonuç
        </p>
      </form>

      <div className="kx-grid" data-testid="kx-grid">
        {visible.map((it) => (
          <article
            key={it.id}
            className={`kx-card${it.durum === 'satildi' ? ' is-satildi' : ''}${it.kind === 'teaser' ? ' is-teaser' : ''}`}
            data-testid="kx-card"
            data-unit={it.id}
          >
            <div className="kx-card-media">
              {it.img ? (
                <img
                  src={it.img.src}
                  srcSet={it.img.srcset}
                  sizes="(min-width: 900px) 300px, 94vw"
                  width={it.img.width}
                  height={it.img.height}
                  alt={it.img.alt}
                  loading="lazy"
                />
              ) : (
                <PlanGlyph />
              )}
              {it.badge && <span className="kx-badge">{it.badge}</span>}
              {it.durum && (
                <span className={`kx-durum is-${it.durum}`}>
                  {it.durum === 'musait' ? 'MÜSAİT' : 'SATILDI'}
                </span>
              )}
            </div>
            <div className="kx-card-body">
              <p className="kx-card-proje">{it.projeLabel}</p>
              <p className="kx-card-title">
                {it.kind === 'teaser' ? 'Tümü satıldı' : `${it.tip} · ${it.kat} · ${it.no}`}
              </p>
              {it.kind === 'unit' && <p className="kx-card-meta">Brüt: {it.brut} m²</p>}
              {it.fiyatText ? (
                <p className="kx-card-fiyat">{it.fiyatText}</p>
              ) : (
                <p className="kx-card-fiyat is-mute">{it.kind === 'teaser' ? '—' : 'Satıldı'}</p>
              )}
              {it.href ? (
                <a className="kx-card-cta" href={it.href} data-testid={`kx-cta-${it.id}`}>
                  {it.cta ?? 'İncele'}
                </a>
              ) : (
                <span className="kx-card-cta is-disabled">Satıldı</span>
              )}
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="kx-empty" data-testid="kx-empty">
            Bu filtrelerle sonuç yok — filtreleri temizleyip yeniden deneyin.
          </p>
        )}
      </div>
    </div>
  );
}
