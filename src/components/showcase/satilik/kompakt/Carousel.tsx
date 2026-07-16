/*
  Detay galerisi adası — büyük sahne + ok/sayaç/tam ekran + küçük resim rayı.
  Tam ekran yerel <dialog> yerine sabit katman: odak/ESC/oklar elle yönetilir
  (tek bağımlılık React). Görsel URL'leri sunucudan hazır gelir (assets.ts).

  Geniş görünüm (⟷): tam ekrana çıkmadan galeriyi künyenin yerine yayar —
  ada, en yakın [data-gallery] atasına data-wide takar, düzeni CSS (.kcg) çözer.
  Tercih localStorage'da tutulur ve iki detay sayfasında da uygulanır; atasız
  kullanımlarda (örn. eski vitrin) düğme hiç çizilmez.
*/
import { useCallback, useEffect, useRef, useState } from 'react';

const WIDE_KEY = 'kc-galeri-genis';

export interface CarouselItemData {
  key: string;
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  thumb: string;
}

interface Props {
  items: CarouselItemData[];
  label: string;
}

export default function Carousel({ items, label }: Props) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [wide, setWide] = useState(false);
  const [canWide, setCanWide] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const n = items.length;
  const cur = items[index];

  const step = useCallback(
    (d: number) => setIndex((i) => (i + d + n) % n),
    [n]
  );

  useEffect(() => {
    const host = figRef.current?.closest('[data-gallery]');
    if (!host) return;
    setCanWide(true);
    if (localStorage.getItem(WIDE_KEY) === '1') {
      host.setAttribute('data-wide', '');
      setWide(true);
    }
  }, []);

  const toggleWide = () => {
    const host = figRef.current?.closest('[data-gallery]');
    if (!host) return;
    setWide((w) => {
      const next = !w;
      host.toggleAttribute('data-wide', next);
      localStorage.setItem(WIDE_KEY, next ? '1' : '0');
      return next;
    });
  };

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [full, step]);

  return (
    <figure className="kcar" aria-label={label} data-testid="kc-carousel" ref={figRef}>
      <div className="kcar-stage">
        <img
          key={cur.key}
          src={cur.src}
          srcSet={cur.srcset}
          sizes={wide ? '(min-width: 1100px) 960px, 94vw' : '(min-width: 1100px) 720px, 94vw'}
          width={cur.width}
          height={cur.height}
          alt={cur.alt}
          data-testid="kc-car-main"
        />
        <span className="t-tech kcar-count" data-testid="kc-car-count">{index + 1} / {n}</span>
        <button type="button" className="kcar-btn kcar-prev" onClick={() => step(-1)} aria-label="Önceki fotoğraf" data-testid="kc-car-prev">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 5-7 7 7 7" /></svg>
        </button>
        <button type="button" className="kcar-btn kcar-next" onClick={() => step(1)} aria-label="Sonraki fotoğraf" data-testid="kc-car-next">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9.5 5 7 7-7 7" /></svg>
        </button>
        {canWide && (
          <button type="button" className="kcar-btn kcar-wide" onClick={toggleWide}
            aria-pressed={wide} aria-label={wide ? 'Yan panelli görünüme dön' : 'Geniş görünüm'}
            title={wide ? 'Yan panelli görünüme dön' : 'Geniş görünüm'} data-testid="kc-car-wide">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 7 5 12l5 5M14 7l5 5-5 5M5 12h14" /></svg>
          </button>
        )}
        <button type="button" className="kcar-btn kcar-full" onClick={() => setFull(true)} aria-label="Tam ekran görüntüle" data-testid="kc-car-full">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
        </button>
      </div>
      <figcaption className="t-caption kcar-cap">{cur.caption}</figcaption>
      <div className="kcar-thumbs" role="tablist" aria-label="Fotoğraflar">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? 'kcar-thumb is-active' : 'kcar-thumb'}
            onClick={() => setIndex(i)}
            aria-label={`Fotoğraf ${i + 1}: ${it.alt}`}
            data-testid={`kc-car-thumb-${i}`}
          >
            <img src={it.thumb} alt="" loading="lazy" width="72" height="54" />
          </button>
        ))}
      </div>

      {full && (
        <div className="kcar-overlay" role="dialog" aria-modal="true" aria-label={label} data-testid="kc-car-overlay">
          <img src={cur.src} srcSet={cur.srcset} sizes="96vw" alt={cur.alt} data-testid="kc-car-overlay-img" />
          <p className="t-caption kcar-overlay-cap">{cur.caption} · {index + 1} / {n}</p>
          <button type="button" className="kcar-btn kcar-overlay-prev" onClick={() => step(-1)} aria-label="Önceki fotoğraf">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 5-7 7 7 7" /></svg>
          </button>
          <button type="button" className="kcar-btn kcar-overlay-next" onClick={() => step(1)} aria-label="Sonraki fotoğraf">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9.5 5 7 7-7 7" /></svg>
          </button>
          <button type="button" className="kcar-btn kcar-close" onClick={() => setFull(false)} aria-label="Tam ekrandan çık" data-testid="kc-car-close" autoFocus>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
      )}
    </figure>
  );
}
