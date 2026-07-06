/*
  Content accessors over the repo-root content/ tree (the site's single copy source).
  TR is source of truth; missing locale files fall back to TR so a page never 404s
  mid-translation. Anything returned from a fallback keeps its own `locale` field,
  letting templates flag untranslated content.
*/
import type { Locale } from './i18n';
import companyJson from '../../content/company.json';

type Dict = Record<string, any>;

const uiModules = import.meta.glob<Dict>('../../content/ui.*.json', {
  eager: true,
});
const seoModules = import.meta.glob<Dict>('../../content/seo.*.json', {
  eager: true,
});
const pageModules = import.meta.glob<Dict>('../../content/pages/*.md', {
  eager: true,
});
const companyProse = import.meta.glob<Dict>('../../content/company.*.md', {
  eager: true,
});
const projectData = import.meta.glob<Dict>(
  '../../content/projects/*/data.json',
  { eager: true }
);
const projectProse = import.meta.glob<Dict>('../../content/projects/*/*.md', {
  eager: true,
});

function byLocale(modules: Record<string, Dict>, tag: string, locale: Locale) {
  const want = Object.entries(modules).find(([p]) =>
    p.endsWith(`${tag}.${locale}.json`)
  );
  const fall = Object.entries(modules).find(([p]) =>
    p.endsWith(`${tag}.tr.json`)
  );
  return ((want ?? fall)?.[1] as Dict)?.default ?? (want ?? fall)?.[1];
}

export const company = companyJson as Dict;

export function ui(locale: Locale): Dict {
  return byLocale(uiModules, 'ui', locale);
}

export function seo(locale: Locale): Dict {
  return byLocale(seoModules, 'seo', locale);
}

function mdByLocale(
  modules: Record<string, Dict>,
  name: string,
  locale: Locale
): Dict | undefined {
  return (Object.entries(modules).find(([p]) =>
    p.endsWith(`${name}.${locale}.md`)
  ) ??
    Object.entries(modules).find(([p]) => p.endsWith(`${name}.tr.md`)))?.[1];
}

/** Page markdown module: { frontmatter, Content } with TR fallback. */
export function pageContent(name: string, locale: Locale): Dict | undefined {
  return mdByLocale(pageModules, name, locale);
}

export function companyContent(locale: Locale): Dict | undefined {
  return mdByLocale(companyProse, 'company', locale);
}

export interface ProjectEntry {
  slug: string;
  data: Dict;
  md: Dict | undefined;
}

export function projects(locale: Locale): ProjectEntry[] {
  return Object.entries(projectData).map(([p, mod]) => {
    const data = (mod as Dict).default ?? mod;
    const slug = data.slug as string;
    return { slug, data, md: mdByLocale(projectProse, slug, locale) };
  });
}

export function project(slug: string, locale: Locale): ProjectEntry | undefined {
  return projects(locale).find((p) => p.slug === slug);
}
