# MEY İnşaat — Company Website

Marketing website for MEY İnşaat, the construction brand of the MEY Group.
Static multi-language site, published via GitHub Pages.

## Stack

| Aspect | Decision |
|---|---|
| Framework | Astro 7 (static output) + Tailwind CSS 4 (+ React islands where earned) |
| Type | Static site, no backend |
| Languages | Turkish (default, `/`), English (`/en`), Russian (`/ru`), Arabic (`/ar`, RTL) |
| Fonts | IBM Plex superfamily, self-hosted, subset per script |
| Contact | Direct links — phone / WhatsApp / email (no form backend) |
| Hosting | GitHub Pages via GitHub Actions on push to `main`; build URLs use `https://meyinsaat.com/` |
| Images | Curated from a local (git-ignored) `images/` library into `src/assets/`, optimized at build |

## Structure

```
content/            All copy + facts (TR is source of truth; EN/RU/AR translated)
  company.json      Company facts and contact configuration (null = awaiting verification)
  ui.<loc>.json     Nav labels, buttons, microcopy
  seo.<loc>.json    Titles + meta descriptions
  sales/<loc>.json  Sales and contact UI, specifications, FAQ and gallery translations
  company.<loc>.md  Corporate prose
  pages/            Per-page copy (frontmatter-driven)
  projects/<slug>/  data.json + per-locale description
  FACTS-NEEDED.md   Checklist of facts awaited from MEY
src/
  features/         One component per page type, locale-agnostic
  pages/            Thin route wrappers (TR at root + [lang]/ for en/ru/ar)
  components/       Design-system components (incl. ScrollToBuild signature)
  styles/global.css Design tokens (exact values from the local design brief)
scripts/convert-frames.mjs  Asset curation: frames -> WebP, photos, logo, favicons
e2e/                Playwright suite (pages ×4 locales, signature scrub, RTL, a11y)
```

## Development

```bash
npm install
npm run dev        # dev server
npm run build      # static build to dist/
npm run preview    # serve the build at /
npm run test:e2e   # Playwright (expects a build; run npm run build first)
npm run frames     # re-run asset curation from the local images/ library
```

## Content rules

- Company facts live in `content/company.json`; unknown company totals are omitted
  from the statistics strip. Do not invent missing facts. Existing property measurement
  estimates still need confirmation; see `content/FACTS-NEEDED.md`.
- TR copy is the master. EN/RU/AR carry `machineTranslated: true` until reviewed
  by a native speaker.
- The portfolio contains El Ele, Çamoğlu and Maşuk apartments. Available D-21 sales
  pages are localized and indexable; the sold D-11 pages remain `noindex`.
- `content/sales/en.json`, `ru.json` and `ar.json` are machine translations pending
  native review. Turkish message keys are the source copy. Hydrated components use
  the namespaces in `src/lib/salesMessageScopes.ts` to keep page payloads small.
- Web3Forms delivery is enabled only when `company.contact.formAccessKey` is set.
  Otherwise visitors receive usable direct contact links, including without JavaScript.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages
on push to `main`. `astro.config.mjs` uses `https://meyinsaat.com` with base `/`.
The GitHub Pages custom-domain setting, DNS and HTTPS configuration must match
that origin; those settings are managed outside this repository.

---

## License

The **source code** in this repository is released under the [MIT License](LICENSE).

The **MEY İnşaat** name, logo, brand identity, written copy, and project imagery
are © 2026 MEY İnşaat and are **not** covered by the MIT license — all rights
reserved.
