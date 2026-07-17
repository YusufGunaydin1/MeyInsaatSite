import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FinalPhotoItem } from './data';

interface FilterOption {
  id: string;
  label: string;
}

interface Props {
  items: FinalPhotoItem[];
  filters?: readonly FilterOption[];
  initialGroup?: string;
  variant?: 'detail' | 'full';
  galleryLabel: string;
}

export default function PhotoGallery({
  items,
  filters = [],
  initialGroup = 'all',
  variant = 'full',
  galleryLabel,
}: Props) {
  const availableInitial = filters.some((filter) => filter.id === initialGroup) ? initialGroup : 'all';
  const [group, setGroup] = useState(availableInitial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const restoreFocus = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!filters.length) return;
    const requested = new URLSearchParams(window.location.search).get('bolum');
    if (requested && filters.some((filter) => filter.id === requested)) setGroup(requested);
  }, [filters]);

  const visibleItems = useMemo(
    () => (group === 'all' ? items : items.filter((item) => item.group === group)),
    [group, items],
  );

  const current = openIndex === null ? null : visibleItems[openIndex];

  const close = useCallback(() => {
    setOpenIndex(null);
    window.requestAnimationFrame(() => restoreFocus.current?.focus());
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    setOpenIndex((index) => {
      if (index === null || visibleItems.length === 0) return index;
      return (index + direction + visibleItems.length) % visibleItems.length;
    });
  }, [visibleItems.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!controls?.length) return;
      const focusable = Array.from(controls);
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
      event.preventDefault();
      focusable[nextIndex].focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close, openIndex, step]);

  const open = (index: number, trigger: HTMLButtonElement) => {
    restoreFocus.current = trigger;
    setOpenIndex(index);
  };

  return (
    <div className={`sd-gallery sd-gallery-${variant}`} data-testid={`sd-gallery-${variant}`}>
      {filters.length > 0 && (
        <div className="sd-gallery-toolbar">
          <div className="sd-gallery-filters" role="group" aria-label="Galeri filtreleri">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={group === filter.id}
                data-gallery-filter={filter.id}
                onClick={() => {
                  setGroup(filter.id);
                  setOpenIndex(null);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p aria-live="polite">{visibleItems.length} fotoğraf</p>
        </div>
      )}

      <div className="sd-gallery-grid" role="list" aria-label={galleryLabel}>
        {visibleItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className="sd-gallery-cell"
            aria-label={`Büyüt: ${item.alt}`}
            data-gallery-item
            data-media-id={item.id}
            onClick={(event) => open(index, event.currentTarget)}
          >
            <span className="sd-gallery-image">
              <img
                src={item.src}
                width={item.width}
                height={item.height}
                alt={item.alt}
                loading={variant === 'detail' || index < 4 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span className="sd-gallery-zoom" aria-hidden="true">＋</span>
            </span>
            <span className="sd-gallery-caption">
              <small>{item.groupLabel}</small>
              <strong>{item.label}</strong>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="sd-lightbox-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="sd-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${current.groupLabel}: ${current.label}`}
            ref={dialog}
            data-testid="sd-lightbox"
          >
            <div className="sd-lightbox-head">
              <p><strong>{current.groupLabel}</strong><span>{current.label}</span></p>
              <button type="button" onClick={close} ref={closeButton} aria-label="Galeriyi kapat">
                Kapat <span aria-hidden="true">×</span>
              </button>
            </div>
            <figure>
              <img
                key={current.id}
                src={current.src}
                width={current.width}
                height={current.height}
                alt={current.alt}
              />
              <figcaption>{current.alt}</figcaption>
            </figure>
            <div className="sd-lightbox-controls">
              <button type="button" onClick={() => step(-1)} aria-label="Önceki fotoğraf">← Önceki</button>
              <span aria-live="polite" data-lightbox-counter>{(openIndex ?? 0) + 1} / {visibleItems.length}</span>
              <button type="button" onClick={() => step(1)} aria-label="Sonraki fotoğraf">Sonraki →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

