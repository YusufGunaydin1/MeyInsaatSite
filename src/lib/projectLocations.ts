import type { Locale } from './i18n';
import { project, ui } from './content';
import {
  appleDirectionsUrl,
  googleDirectionsUrl,
  hasMapCoordinates,
  mapProviderLinks,
  openStreetMapEmbedUrl,
  type MapCoordinates,
  type MapProviderLink,
} from './maps';

export interface ProjectLocation {
  code: string;
  slug: string;
  name: string;
  address: string;
  district: string;
  status: string;
  coordinates: MapCoordinates;
  coordinateLabel: string;
  mapProviders: MapProviderLink[];
  googleDirectionsHref: string;
  appleDirectionsHref: string;
  osmEmbedHref: string;
  osmMapHref: string;
}

/** One provider entry for the unified directions control. `kind` distinguishes
 *  a real turn-by-turn directions target from a plain map pin (Yandex has no
 *  keyless directions URL, so it opens the pin). */
export interface DirectionsItem {
  name: 'Google' | 'Yandex' | 'Apple';
  href: string;
  kind: 'directions' | 'map';
}

/** Provider list for the DirectionsMenu, kept in one place so every surface
 *  (explorer, dossier, sale card, sale strip) offers the same three targets. */
export function directionsItems(location: ProjectLocation): DirectionsItem[] {
  const yandex = location.mapProviders.find((provider) => provider.name === 'Yandex');
  return [
    { name: 'Google', href: location.googleDirectionsHref, kind: 'directions' },
    { name: 'Yandex', href: yandex?.href ?? location.googleDirectionsHref, kind: 'map' },
    { name: 'Apple', href: location.appleDirectionsHref, kind: 'directions' },
  ];
}

const PROJECT_SLUGS = [
  'el-ele-apartmani',
  'masuk-apartmani',
  'camoglu-apartmani',
] as const;

export function projectLocations(locale: Locale): ProjectLocation[] {
  const t = ui(locale);

  return PROJECT_SLUGS.map((slug, index) => {
    const entry = project(slug, locale);
    const coordinates = entry?.data?.coordinates;
    const address = entry?.data?.location;

    if (!entry || !address || !hasMapCoordinates(coordinates)) {
      throw new Error(`Verified map data is missing for project: ${slug}`);
    }

    const name = entry.md?.frontmatter?.name ?? slug;
    const lat = coordinates.lat.toFixed(6);
    const lng = coordinates.lng.toFixed(6);

    return {
      code: `PEN-${String(index + 1).padStart(2, '0')}`,
      slug,
      name,
      address,
      district: entry.data.district,
      status: t.projects.status?.[entry.data.status] ?? entry.data.status,
      coordinates,
      coordinateLabel: `${lat}° N · ${lng}° E`,
      mapProviders: mapProviderLinks({ address, coordinates, locale, name }),
      googleDirectionsHref: googleDirectionsUrl(coordinates),
      appleDirectionsHref: appleDirectionsUrl(coordinates),
      osmEmbedHref: openStreetMapEmbedUrl(coordinates),
      osmMapHref: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`,
    };
  });
}
