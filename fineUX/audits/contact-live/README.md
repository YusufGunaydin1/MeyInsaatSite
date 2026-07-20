# Live contact Route Board fineUX audit

## Scope

- Live routes: `/iletisim` and RTL `/ar/iletisim`.
- Shared reference: B on `/showcases/iletisim-lab`.
- Cells: 1366×900, 1024×768, 360×740, and Arabic RTL 360×740.

## Utility contract

A visitor can immediately call or email the verified general office, open its address in a real map provider, or continue to the localized Satılık/Projects route without encountering a dead form or the sales-only phone number.

## Detector contracts

- One live H1; no competing heading, fake form, button, placeholder, working-hours copy, or sales mobile number.
- Selected B retains `background-image: none`; the rejected square grid cannot return.
- General phone, email, localized Satılık/Projects routes, and all three map providers exist.
- Every action is at least 44×44px, inside the viewport, and externally unoccluded.
- Heading/summary, direct channels/topic routes, repeated rows, and office band preserve intended order without overlap.
- Desktop remains split; mobile stacks. Arabic uses RTL document flow, Arabic display font, and mirrored route arrows.
- TR live and showcase B geometry/style fingerprints remain equal at 1366, 1024, and 360.
- No horizontal overflow, fixed blockers, or unapproved shadows.

## Evidence

- `test-results/fineUX/contact-live/desktop-1366-1366x900.png`
- `test-results/fineUX/contact-live/tablet-1024-1024x768.png`
- `test-results/fineUX/contact-live/mobile-360-360x740.png`
- `test-results/fineUX/contact-live/mobile-ar-360-360x740.png`

Status: PASS — 7/7 contact live/showcase audit cells passed; all four live screenshots were visually inspected.
