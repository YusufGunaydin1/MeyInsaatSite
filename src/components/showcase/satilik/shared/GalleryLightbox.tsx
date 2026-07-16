/*
  Küratörlü galeri + erişilebilir lightbox (tek ada, üç yön de kullanır; tema
  gövdedeki sv-* sınıfından gelir). Filtre sekmeleri klavyeyle gezilir; lightbox
  dialog'u odak tuzağı kurar, Esc/oklarla yönetilir, kapanınca odağı iade eder.
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LightboxItem } from './imageVariants';
import './lightbox.css';

interface Tab {
  id: string;
  label: string;
}

interface Props {
  items: LightboxItem[];
  tabs: Tab[];
  /** başlangıç sekmesi (örn. daire sayfasından gelindiğinde) */
  initialTab?: string;
}

export default function GalleryLightbox({ items, tabs, initialTab = 'tumu' }: Props) {
  // Statik sayfada derin bağlantı: /galeri?bolum=daire-2 sekmeyi istemcide seçer
  const [tab, setTab] = useState(() => {
    const wanted =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('bolum') ?? initialTab
        : initialTab;
    return tabs.some((t) => t.id === wanted) ? wanted : 'tumu';
  });
  const [open, setOpen] = useState<number | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(
    () => (tab === 'tumu' ? items : items.filter((i) => i.group === tab)),
    [items, tab]
  );

  const current = open === null ? null : filtered[open];

  function show(index: number) {
    restoreFocus.current = document.activeElement as HTMLElement;
    setOpen(index);
  }

  function close() {
    setOpen(null);
    restoreFocus.current?.focus();
  }

  const step = (dir: 1 | -1) =>
    setOpen((i) => (i === null ? i : (i + dir + filtered.length) % filtered.length));

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'Tab') {
        // basit odak tuzağı: dialog içindeki odaklanabilirler arasında döngü
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const idx = list.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (idx <= 0 ? list.length - 1 : idx - 1) : (idx === list.length - 1 ? 0 : idx + 1);
        e.preventDefault();
        list[next].focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null]);

  return (
    <div className="slx" data-testid="sv-gallery">
      <div className="slx-tabs" role="tablist" aria-label="Galeri filtreleri">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className="slx-tab t-tech"
            data-testid={`sv-tab-${t.id}`}
            onClick={() => { setTab(t.id); setOpen(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="slx-count t-tech" aria-live="polite" data-testid="sv-gallery-count">
        {filtered.length} kare
      </p>

      <div className="slx-grid" role="list">
        {filtered.map((item, i) => (
          <button
            key={item.key}
            role="listitem"
            className="slx-cell"
            data-testid="sv-gallery-item"
            onClick={() => show(i)}
            aria-label={`Büyüt: ${item.caption}`}
          >
            <img
              src={item.thumb}
              srcSet={item.thumbSet}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
              width={item.width}
              height={item.height}
              alt={item.alt}
              loading="lazy"
              decoding="async"
            />
            <span className="slx-cap">
              <span className="t-tech slx-cap-group">{item.groupLabel}</span>
              <span className="slx-cap-text">{item.caption}</span>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div className="slx-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div
            className="slx-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${current.groupLabel}: ${current.caption}`}
            ref={dialogRef}
            data-testid="sv-lightbox"
          >
            <img
              key={current.key}
              src={current.full}
              srcSet={current.fullSet}
              sizes="92vw"
              width={current.width}
              height={current.height}
              alt={current.alt}
            />
            <div className="slx-bar">
              <p className="slx-info">
                <span className="t-tech slx-info-count" data-testid="sv-lightbox-counter">
                  {(open ?? 0) + 1} / {filtered.length}
                </span>
                <span className="slx-info-cap">{current.caption}</span>
              </p>
              <div className="slx-nav">
                <button className="slx-btn" onClick={() => step(-1)} aria-label="Önceki fotoğraf" data-testid="sv-lightbox-prev">←</button>
                <button className="slx-btn" onClick={() => step(1)} aria-label="Sonraki fotoğraf" data-testid="sv-lightbox-next">→</button>
                <button className="slx-btn slx-btn-close" onClick={close} ref={closeBtn} aria-label="Galeriyi kapat" data-testid="sv-lightbox-close">
                  Kapat ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
