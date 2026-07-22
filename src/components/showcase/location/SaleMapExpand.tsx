import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DirectionsItem } from '../../../lib/projectLocations';
import DirectionsMenu from './DirectionsMenu';
import LeafletMap from './LeafletMap';

interface Props {
  name: string;
  code: string;
  address: string;
  coordinateLabel: string;
  osmEmbedHref: string;
  osmMapHref: string;
  primaryHref: string;
  items: DirectionsItem[];
  lat: number;
  lng: number;
  /** Big-map renderer inside the modal. */
  map?: 'iframe' | 'leaflet';
  /** Test-id namespace so the iframe (location-d) and leaflet (location-f) cards stay distinct. */
  prefix?: string;
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

const FOCUSABLE = 'a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';

export default function SaleMapExpand(props: Props) {
  const { map = 'iframe', prefix = 'location-d' } = props;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // Modal lifecycle: lock scroll, trap Tab, Escape to close, restore focus.
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const items = Array.from(nodes).filter(
        (el) => el.tagName === 'IFRAME' || el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = bodyOverflow;
      returnTo?.focus?.();
    };
  }, [open]);

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="km-mapmodal"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={dialogRef}
              className="km-mapmodal-panel"
              role="dialog"
              aria-modal="true"
              aria-label={`${props.name} — büyük konum haritası`}
              data-testid={`${prefix}-modal`}
            >
              <header className="km-mapmodal-head">
                <h3>{props.name}</h3>
                <p className="t-tech km-mapmodal-tag">{props.code} · DOĞRULANMIŞ PİN</p>
                <button
                  ref={closeRef}
                  type="button"
                  className="km-mapmodal-close"
                  aria-label="Kapat"
                  data-testid={`${prefix}-modal-close`}
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </header>

              <div className="km-mapmodal-map" data-map={map}>
                {map === 'leaflet' ? (
                  <LeafletMap
                    lat={props.lat}
                    lng={props.lng}
                    label={props.name}
                    zoom={16}
                    scrollWheel
                    testid={`${prefix}-modal-leaflet`}
                  />
                ) : (
                  <>
                    <div className="km-map-fallback" aria-hidden="true">
                      <span></span><span></span><span></span><span></span>
                    </div>
                    <iframe
                      src={props.osmEmbedHref}
                      title={`${props.name} gerçek konum haritası`}
                      loading="lazy"
                    />
                    <a className="km-osm-link" href={props.osmMapHref} target="_blank" rel="noopener">
                      © OpenStreetMap katkıcıları
                    </a>
                  </>
                )}
                <div className="km-map-badge">
                  <PinIcon />
                  <span><small>KESİN PİN</small>{props.code}</span>
                </div>
              </div>

              <div className="km-mapmodal-foot">
                <div className="km-mapmodal-addr">
                  <address>{props.address}</address>
                  <span className="t-tech km-coordinate">{props.coordinateLabel}</span>
                </div>
                <DirectionsMenu
                  layout="split"
                  tone="light"
                  size="sm"
                  openUp
                  primaryHref={props.primaryHref}
                  items={props.items}
                  testid={`${prefix}-modal-directions`}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="km-sale-expand"
        aria-label="Haritayı büyüt"
        aria-haspopup="dialog"
        data-testid={`${prefix}-expand`}
        onClick={() => setOpen(true)}
      >
        <ExpandIcon />
      </button>
      {modal}
    </>
  );
}
