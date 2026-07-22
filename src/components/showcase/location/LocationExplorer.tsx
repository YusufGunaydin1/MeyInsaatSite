import { useState } from 'react';
import { directionsItems, type ProjectLocation } from '../../../lib/projectLocations';
import DirectionsMenu from './DirectionsMenu';

interface Props {
  locations: ProjectLocation[];
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

export default function LocationExplorer({ locations }: Props) {
  const [activeSlug, setActiveSlug] = useState(locations[0]?.slug);
  const active = locations.find((location) => location.slug === activeSlug) ?? locations[0];

  if (!active) return null;

  return (
    <section className="km-explorer" data-testid="location-variant-a">
      <div className="km-explorer-head">
        <div>
          <p className="t-tech km-kicker">A · CANLI HARİTA</p>
          <h2>Binayı seçin, kesin pini görün.</h2>
        </div>
        <p>
          Serbest adres araması yok. Her bina doğrulanmış koordinatla aynı Google,
          Yandex ve Apple pinine bağlanır.
        </p>
      </div>

      <div className="km-explorer-grid">
        <div className="km-map-frame" data-testid="location-a-map">
          <div className="km-map-fallback" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <iframe
            key={active.slug}
            src={active.osmEmbedHref}
            title={`${active.name} gerçek konum haritası`}
            loading="lazy"
          />
          <div className="km-map-badge">
            <PinIcon />
            <span><small>KESİN PİN</small>{active.code}</span>
          </div>
          <a className="km-osm-link" href={active.osmMapHref} target="_blank" rel="noopener">
            © OpenStreetMap katkıcıları
          </a>
        </div>

        <div className="km-explorer-panel">
          <div className="km-location-tabs" aria-label="Bina seçin">
            {locations.map((location, index) => (
              <button
                key={location.slug}
                type="button"
                className={location.slug === active.slug ? 'is-active' : ''}
                aria-pressed={location.slug === active.slug}
                data-testid={`location-a-select-${location.slug}`}
                onClick={() => setActiveSlug(location.slug)}
              >
                <span className="t-tech">{String(index + 1).padStart(2, '0')}</span>
                <strong>{location.name}</strong>
                <small>{location.address}</small>
              </button>
            ))}
          </div>

          <div className="km-active-address" aria-live="polite">
            <p className="t-tech">{active.code} · {active.status}</p>
            <h3>{active.name}</h3>
            <address>{active.address}</address>
            <p className="t-tech km-coordinate">{active.coordinateLabel}</p>
          </div>

          <DirectionsMenu
            key={active.slug}
            layout="split"
            tone="light"
            primaryHref={active.googleDirectionsHref}
            items={directionsItems(active)}
            testid="location-a-directions"
          />
        </div>
      </div>
    </section>
  );
}
