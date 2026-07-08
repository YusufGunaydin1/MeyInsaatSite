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
| Hosting | GitHub Pages via GitHub Actions on push to `main`; custom domain pending |
| Images | Curated from a local (git-ignored) `images/` library into `src/assets/`, optimized at build |

## Structure

```
content/            All copy + facts (TR is source of truth; EN/RU/AR translated)
  company.json      Hard facts — single source (null = fact pending from MEY)
  ui.<loc>.json     Nav labels, buttons, microcopy
  seo.<loc>.json    Titles + meta descriptions
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
npm run preview    # serve the build (base: /MeyInsaatSite)
npm run test:e2e   # Playwright (expects a build; run npm run build first)
npm run frames     # re-run asset curation from the local images/ library
```

## Content rules

- Facts live in `content/company.json`; `null` renders a visible "Bilgi bekleniyor"
  badge — **facts are never invented**. See `content/FACTS-NEEDED.md`.
- TR copy is the master. EN/RU/AR carry `machineTranslated: true` until reviewed
  by a native speaker.
- The single project entry is a clearly-marked **sample template** (`noindex`).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages
on push to `main`. When the custom domain is ready: set `site`/`base` in
`astro.config.mjs`, add `public/CNAME`, configure DNS at the registrar, and enable
"Enforce HTTPS" in the repo's Pages settings.

---

## License

The **source code** in this repository is released under the [MIT License](LICENSE).

The **MEY İnşaat** name, logo, brand identity, written copy, and project imagery
are © 2026 MEY İnşaat and are **not** covered by the MIT license — all rights
reserved.
