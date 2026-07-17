# Satılık Daireler fineUX audit

## Scope

This audit covers the comparison hub and the three complete showcase directions under
`/showcases/satilik-daireler`: Editoryal, Mimari and Monolit. It samples their home pages,
both structurally distinct apartment details, gallery, contact form and building story.

## Viewport matrix

- Wide desktop: 1440 × 900
- Standard laptop: 1366 × 768 or 1366 × 900
- Tablet: 1024 × 768
- Mobile: 390 × 844

## Deterministic checks

The Playwright audit verifies horizontal overflow, clipped controls and headings, missing or
broken images, duplicate visible test layers, unexpected fixed overlays, DM Sans usage, button
radius token drift, mobile touch-target size, comparison-card overlap and single-page heading
anatomy. It also preserves the supplied visual references' common dark brand chrome on the
comparison, Mimari and Monolit surfaces while keeping the warm Editoryal direction intentionally
light. It loads every lazy photograph before evaluation and captures full-page screenshots with
reduced motion.

The repository did not contain the shared `fineUX/README.md` or a reusable fineUX detector suite,
so this isolated showcase audit provides its own route-scoped geometry checks without adding a
dependency or touching production routes.

## Run

```bash
FINEUX_PORT=4331 npx playwright test -c fineUX/playwright.config.ts \
  --project=fineux-sale --workers=1
```

When another session owns the shared `dist` directory, point the audit at an isolated completed
build without changing or deleting parallel output:

```bash
FINEUX_PORT=4331 FINEUX_STATIC_DIR=/tmp/mey-sale-reference-build \
  npx playwright test -c fineUX/playwright.config.ts --project=fineux-sale --workers=1
```

If a parallel session owns `test-results`, keep its artifacts untouched and select a dedicated
evidence directory with `FINEUX_SCREENSHOT_DIR=fineUX/evidence/satilik-daireler-reference`.

Screenshots are written to `test-results/fineUX/screenshots/satilik-daireler/`.
