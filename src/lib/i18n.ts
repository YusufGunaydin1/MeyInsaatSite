export const LOCALES = ['tr', 'en', 'ru', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'tr';

export function dir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Locale-prefixed, base-aware path. `path` starts with '/', e.g. '/kurumsal'. */
export function localePath(locale: Locale, path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const p = path === '/' ? (prefix ? '' : '/') : path;
  return `${base}${prefix}${p}` || '/';
}

/** Strip base + locale prefix from a pathname -> route path like '/kurumsal'. */
export function routePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (!p.startsWith('/')) p = '/' + p;
  for (const l of LOCALES) {
    if (l === DEFAULT_LOCALE) continue;
    if (p === `/${l}` || p.startsWith(`/${l}/`)) {
      p = p.slice(l.length + 1) || '/';
      break;
    }
  }
  return p.replace(/\/$/, '') || '/';
}

export function localeFromUrl(pathname: string): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (!p.startsWith('/')) p = '/' + p;
  for (const l of LOCALES) {
    if (l === DEFAULT_LOCALE) continue;
    if (p === `/${l}` || p.startsWith(`/${l}/`)) return l;
  }
  return DEFAULT_LOCALE;
}

export const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
