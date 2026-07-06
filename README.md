# Mey İnşaat — Company Website

Marketing website for Mey İnşaat, a construction company. Static site, published via GitHub Pages on a custom domain.

## Status

🟡 **Repository initialized — site not yet built.** This repo currently holds the classified image assets and project configuration. The site itself will be scaffolded next.

## Planned architecture

| Aspect | Decision |
|---|---|
| Type | Static site (no backend) |
| Framework | Astro + Tailwind CSS |
| Structure | Multi-page |
| Languages | Turkish, English, Russian, Arabic (RTL) |
| Contact | Direct links — phone / WhatsApp / email (no form backend) |
| Hosting | GitHub Pages, custom domain |
| Images | Curated per page from a local source library; optimized to WebP/AVIF at build time |

## Image assets

Raw imagery lives in a local `images/` source library (all generated candidates,
used and unused) that is **not** committed to this repo — it's a working library,
not the deployed asset set. When the site is built, only the specific images each
page uses are brought into the Astro project's `src/assets/` and optimized
(WebP/AVIF, responsive sizes) at build time.

## Repository layout

```
(site source will be added when the Astro project is scaffolded)
README.md
.gitignore
```

## Local development

_To be added once the Astro project is scaffolded._

## Deployment

GitHub Pages, built and deployed by GitHub Actions on push to `main`, served over a custom domain.

---

© Mey İnşaat. All rights reserved.
