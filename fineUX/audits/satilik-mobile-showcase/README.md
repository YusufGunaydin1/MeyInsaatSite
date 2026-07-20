# Satılık mobile-only showcase fineUX audit

## Scope

- Proposal: `/showcases/satilik-mobile-kompakt`
- Live reference: `/satilik-daireler`
- Breakpoint contract: proposal styling is active only at widths up to 640px.
- Cells: 1366×768, 1024×768, 641×740, 360×740 closed, and 360×740 with filters open.

## Utility contract

A phone buyer can see current availability, contact sales, choose a result type, and reach the unchanged inventory cards without carrying desktop marketing or low-value controls through the first screen.

## User-feedback regressions

- At 641px and above, hero, listing, tabs, filters, results row, and first-card geometry must match the live page within 0.5px.
- The same desktop/tablet elements must also keep the same computed layout and visual-style fingerprint.
- At 360px, the original listing-card width and height must match the live card; only hero and controls may change.
- The mobile-only hero and controls must remain hidden above the breakpoint, while the original hero/filter composition must remain hidden inside it.

## Mobile composition contracts

- Hero ≤160px; closed control surface ≤108px.
- First unchanged inventory card begins at or above 370px.
- One visible heading, white title contrast, ordered hero rhythm, and no clipped contact actions.
- Three equal category targets, filter/sort controls, and every open-panel field/action are at least 44×44px.
- No horizontal overflow, broken visible images, oversized mobile hero source, external occlusion, or unapproved surface shadows.
- The filter panel is absent while closed and contained by the control surface while open.

## Evidence

- `test-results/fineUX/satilik-mobile-showcase/desktop-1366-1366x768.png`
- `test-results/fineUX/satilik-mobile-showcase/tablet-1024-1024x768.png`
- `test-results/fineUX/satilik-mobile-showcase/boundary-641-641x740.png`
- `test-results/fineUX/satilik-mobile-showcase/mobile-360-360x740.png`
- `test-results/fineUX/satilik-mobile-showcase/mobile-filters-open-360-360x740.png`

The repository does not contain the shared `fineUX/README.md`, `MEY_DESIGN_BRIEF.md`, or shared detector helpers, so this audit follows the established route-scoped detector pattern used by the repository’s existing audits.

Status: PASS. Desktop/tablet/boundary parity, mobile closed/open composition, touch targets, overflow, image delivery, and occlusion checks are clean.
