/*
  Yapısal veri (JSON-LD) üreticileri — tek kaynak.

  Kural: buradaki her alan content/company.json ya da bir projenin data.json
  dosyasındaki DOĞRULANMIŞ bir değerden gelir. Tahmini oda ölçüleri, proje sayısı,
  teslim edilen daire sayısı, mesafe veya tecrübe yılı gibi doğrulanmamış hiçbir
  bilgi şemaya girmez (arama sonucunda "yayınlanmış taahhüt" gibi okunur).

  Kurumsal düğüm @id ile tekildir (site + '/#org'); diğer düğümler ona referans
  verir, kopyalamaz.
*/
import company from '../../content/company.json';
import { localePath, type Locale } from './i18n';

export type Json = Record<string, unknown>;

/** Astro.site'tan sondaki '/' atılmış mutlak kök. */
export function siteRoot(site: URL | undefined): string {
  return (site?.toString() ?? 'https://meyinsaat.com/').replace(/\/$/, '');
}

export function absUrl(site: URL | undefined, locale: Locale, path = '/'): string {
  return siteRoot(site) + localePath(locale, path);
}

export function orgId(site: URL | undefined): string {
  return siteRoot(site) + '/#org';
}

/** Görünür kırıntı yoluyla aynı sırayı paylaşan BreadcrumbList.
    Son öğe (bulunulan sayfa) `path` almaz; Google için `item` gereksizdir. */
export function breadcrumbLd(
  site: URL | undefined,
  locale: Locale,
  trail: { name: string; path?: string }[]
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      ...(step.path ? { item: absUrl(site, locale, step.path) } : {}),
    })),
  };
}

/** Arama kutusu iddiası YOK (site içi arama yok) — yalnız kimlik ve dil. */
export function websiteLd(site: URL | undefined, locale: Locale, siteName: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteRoot(site) + '/#website',
    url: siteRoot(site) + '/',
    name: siteName,
    inLanguage: locale,
    publisher: { '@id': orgId(site) },
  };
}

/** Tamamlanmış bir bina: adres + koordinat doğrulanmıştır (content/projects).
    Daire sayısı/yıl null olduğu sürece şemaya girmez. */
export function buildingLd(
  site: URL | undefined,
  locale: Locale,
  data: {
    slug: string;
    location: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
    year?: number | null;
    units?: number | null;
  },
  name: string,
  description?: string
): Json {
  const streetAddress = data.location.split(',')[0]?.trim() ?? data.location;
  return {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    '@id': absUrl(site, locale, `/projeler/${data.slug}`) + '#building',
    name,
    url: absUrl(site, locale, `/projeler/${data.slug}`),
    ...(description ? { description } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: data.district ?? 'Pendik',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    ...(data.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lng,
          },
        }
      : {}),
    ...(data.units ? { numberOfAvailableAccommodationUnits: data.units } : {}),
    developer: { '@id': orgId(site) },
  };
}

/** /hizmetler için hizmet kataloğu — adlar ve açıklamalar sayfadaki metnin aynısı. */
export function serviceCatalogLd(
  site: URL | undefined,
  locale: Locale,
  services: { name: string; desc: string }[]
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': absUrl(site, locale, '/hizmetler') + '#services',
    name: company.name,
    url: absUrl(site, locale, '/hizmetler'),
    itemListElement: services.map((s, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.desc,
        serviceType: s.name,
        provider: { '@id': orgId(site) },
        areaServed: { '@type': 'City', name: 'İstanbul' },
      },
    })),
  };
}

/** Projeler listesi — görünen kart sırasıyla aynı. */
export function projectListLd(
  site: URL | undefined,
  locale: Locale,
  items: { slug: string; name: string }[]
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': absUrl(site, locale, '/projeler') + '#list',
    name: company.name,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: absUrl(site, locale, `/projeler/${p.slug}`),
    })),
  };
}
