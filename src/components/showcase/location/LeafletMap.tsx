import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
// .km-leaflet (host: position:absolute; inset:0), .km-leaflet-pin ve .km-attrib
// stilleri buradan gelir — bileşen kendi kendine yeter (index gibi location.css'i
// ayrıca yüklemeyen sayfalarda da harita 0 yükseklikte kalmasın).
import './location.css';

interface Props {
  lat: number;
  lng: number;
  label: string;
  zoom?: number;
  /** Enable scroll-wheel zoom (fine inside a modal, avoid on an inline card). */
  scrollWheel?: boolean;
  /** Kart önizlemesi: etkileşimsiz (sürükleme/zoom kapalı) + zoom kontrolü gizli. */
  preview?: boolean;
  testid?: string;
}

const PIN_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/>' +
  '<circle cx="12" cy="10" r="2"/></svg>';

export default function LeafletMap({ lat, lng, label, zoom = 16, scrollWheel = false, preview = false, testid }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let cancelled = false;

    (async () => {
      const mod = await import('leaflet');
      const L: any = (mod as any).default ?? mod;
      if (cancelled || !hostRef.current) return;

      map = L.map(hostRef.current, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: scrollWheel && !preview,
        zoomControl: false,
        attributionControl: false,
        // preview = statik konum önizlemesi (kartta sayfa kaydırmasını bozmasın)
        dragging: !preview,
        touchZoom: !preview,
        doubleClickZoom: !preview,
        boxZoom: !preview,
        keyboard: !preview,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        // Credit is carried by the compact control below; kept here too for correctness.
        attribution: '© OpenStreetMap',
      }).addTo(map);

      if (!preview) L.control.zoom({ position: 'topright' }).addTo(map);

      const pin = L.divIcon({
        className: 'km-leaflet-pin',
        html: PIN_SVG,
        iconSize: [38, 38],
        iconAnchor: [19, 36],
      });
      L.marker([lat, lng], { icon: pin, title: label, keyboard: false }).addTo(map);

      // Compact attribution: a tiny ⓘ that expands to the credit on tap/hover.
      const Attrib = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd() {
          const wrap = L.DomUtil.create('div', 'km-attrib');
          wrap.innerHTML =
            '<button type="button" class="km-attrib-toggle" aria-label="Harita telifi" aria-expanded="false">i</button>' +
            '<span class="km-attrib-credit">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></span>';
          const btn = wrap.querySelector('button')!;
          L.DomEvent.disableClickPropagation(wrap);
          L.DomEvent.on(btn, 'click', () => {
            const isOpen = wrap.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          });
          return wrap;
        },
      });
      map.addControl(new Attrib());

      requestAnimationFrame(() => map && map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [lat, lng, zoom, scrollWheel, preview]);

  return (
    <div
      ref={hostRef}
      className="km-leaflet"
      role="img"
      aria-label={`${label} konum haritası`}
      data-testid={testid}
    />
  );
}
