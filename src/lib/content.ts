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
// Optional per-project, per-locale DetailStage text (overrides the shared
// ui.projects.detail default). Absent for most projects → shared default stands.
const projectDetail = import.meta.glob<Dict>(
  '../../content/projects/*/detail.*.json',
  { eager: true }
);

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

/**
 * Per-project DetailStage text override (TR fallback), or {} when the project
 * ships no detail file. Deep-merge this over ui(locale).projects.detail so a
 * building tells its OWN story while inheriting shared chrome (frame names,
 * labels, footnote). Keeps a single source per field: project wins, else shared.
 */
export function projectDetailOverride(slug: string, locale: Locale): Dict {
  const pick = (loc: string) =>
    Object.entries(projectDetail).find(([p]) =>
      p.endsWith(`/${slug}/detail.${loc}.json`)
    )?.[1];
  const mod = pick(locale) ?? pick('tr');
  return ((mod as Dict)?.default ?? mod ?? {}) as Dict;
}

/** Recursive merge: objects merge key-by-key; arrays & scalars replace wholesale. */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(over) || typeof over !== 'object') return over as T;
  const out: Dict = { ...(base as unknown as Dict) };
  for (const k of Object.keys(over as Dict)) {
    out[k] = mergeDeep((base as unknown as Dict)?.[k], (over as Dict)[k]);
  }
  return out as unknown as T;
}
