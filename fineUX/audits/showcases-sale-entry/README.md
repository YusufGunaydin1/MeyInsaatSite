# Showcases Satılık Daireler entry audit

Target: `/showcases`, component `[data-testid="showcases-sale-entry"]`.

## Anatomy

- Compact section surface and red top accent
- Intro copy and general-page CTA
- Five subordinate buyer-route cards
- Card title, supporting copy, and action label

## Matrix

- 1366×768 desktop: three-column route grid
- 1024×768 layout boundary: three-column route grid
- 390×844 mobile: one-column route grid

## Composition contracts

- Exactly six route links including the general-page CTA
- No horizontal clipping or document overflow
- Every route link is at least 44×44px and externally unobstructed
- Route cards never overlap
- Expected grid column count and row rhythm are preserved
- Heading stays inside the viewport and the feature panel keeps an opaque surface

Evidence is written to `fineUX/evidence/showcases-sale-entry/`.
