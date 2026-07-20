# Satılık mobile fineUX audit

Audit date: 2026-07-19

## Scope

- `/satilik-daireler/`
- `/satilik-daireler/daire-1`
- Shared gallery behavior also used by `/satilik-daireler/daire-2`
- Viewport cells: 1366×768, 1024×768, and 360×740

## Utility contract

A mobile buyer can understand the offer, reach the inventory, inspect apartment photos, and contact sales without an oversized opening section or an unnecessary burst of image downloads.

## Measured result

| Contract | Before | After | Guard |
|---|---:|---:|---:|
| 360px landing hero height | 587.48px | 237px | ≤ 340px |
| 360px listing start | 651.48px | 301px | ≤ 420px |
| 360px landing initial image requests | 7 | 4 | ≤ 6 |
| 360px landing encoded image bytes | 296,824 | 59,616 | measured |
| 360px detail heading height | 289.55px | 230.06px | ≤ 231px |
| 360px gallery start | 443.59px | 339.73px | ≤ 390px |
| 360px detail initial image requests | 23 | 10 | ≤ 11 |
| 360px detail encoded image bytes | 134,084 | 41,632 | measured |

Desktop and 1024px layouts retain their existing two-column hero composition. Their hero heights remain 291.5px and 281.41px respectively.

## Detectors and coverage

- `e2e/satilik-mobile-ux.spec.ts`: geometry, horizontal overflow, source sizing, initial request budget, control occlusion, touch target sizing, and viewport screenshots.
- `e2e/satilik-kompakt.spec.ts`: mobile filter disclosure, listing interactions, both apartment routes, gallery controls, responsive overflow, and sales contact links.
- Production build verifies all localized static routes and responsive image generation.

## Evidence

- `test-results/fineUX/satilik-mobile/landing-1366.png`
- `test-results/fineUX/satilik-mobile/landing-1024.png`
- `test-results/fineUX/satilik-mobile/landing-360.png`
- `test-results/fineUX/satilik-mobile/detail-360.png`

Status: PASS. No horizontal overflow, external control occlusion, or unresolved in-scope visual defect remains in the tested matrix.
