import type { Locale } from './i18n';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapProviderLink {
  name: 'Google' | 'Yandex' | 'Apple';
  href: string;
}

const coordinate = (value: number) => value.toFixed(6);

export function hasMapCoordinates(value: unknown): value is MapCoordinates {
  if (!value || typeof value !== 'object') return false;
  const point = value as Partial<MapCoordinates>;
  return Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

export function mapProviderLinks({
  address,
  coordinates,
  locale,
  name,
}: {
  address: string;
  coordinates?: MapCoordinates | null;
  locale: Locale;
  name?: string;
}): MapProviderLink[] {
  const hasPoint = hasMapCoordinates(coordinates);
  const lat = hasPoint ? coordinate(coordinates.lat) : '';
  const lng = hasPoint ? coordinate(coordinates.lng) : '';
  const addressQuery = encodeURIComponent(address.replaceAll('/', ' '));
  const coordinateQuery = encodeURIComponent(`${lat},${lng}`);
  const label = encodeURIComponent(name || address);

  const providers: MapProviderLink[] = hasPoint
    ? [
        {
          name: 'Google',
          href: `https://www.google.com/maps/search/?api=1&query=${coordinateQuery}`,
        },
        {
          name: 'Yandex',
          href: `https://yandex.com.tr/maps/?pt=${encodeURIComponent(`${lng},${lat}`)}&z=18&l=map`,
        },
        {
          name: 'Apple',
          href: `https://maps.apple.com/?ll=${coordinateQuery}&q=${label}`,
        },
      ]
    : [
        {
          name: 'Google',
          href: `https://www.google.com/maps/search/?api=1&query=${addressQuery}`,
        },
        {
          name: 'Yandex',
          href: `https://yandex.com.tr/maps/?text=${addressQuery}`,
        },
        {
          name: 'Apple',
          href: `https://maps.apple.com/?q=${addressQuery}`,
        },
      ];

  if (locale === 'ru') providers.unshift(providers.splice(1, 1)[0]);
  return providers;
}

export function googleDirectionsUrl(coordinates: MapCoordinates): string {
  const destination = encodeURIComponent(
    `${coordinate(coordinates.lat)},${coordinate(coordinates.lng)}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function appleDirectionsUrl(coordinates: MapCoordinates): string {
  const destination = encodeURIComponent(
    `${coordinate(coordinates.lat)},${coordinate(coordinates.lng)}`
  );
  return `https://maps.apple.com/?daddr=${destination}`;
}

export function openStreetMapEmbedUrl(
  coordinates: MapCoordinates,
  span = { lat: 0.0032, lng: 0.0048 }
): string {
  const west = coordinate(coordinates.lng - span.lng);
  const south = coordinate(coordinates.lat - span.lat);
  const east = coordinate(coordinates.lng + span.lng);
  const north = coordinate(coordinates.lat + span.lat);
  const marker = encodeURIComponent(
    `${coordinate(coordinates.lat)},${coordinate(coordinates.lng)}`
  );
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${west},${south},${east},${north}`)}&layer=mapnik&marker=${marker}`;
}
