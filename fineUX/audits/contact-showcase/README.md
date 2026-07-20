# Contact showcase fineUX audit

## Scope

- Proposal route: `/showcases/iletisim-lab`
- Directions: A Direct Desk, B Route Board, C Office Ledger.
- Cells: 1366×900, 1024×768, and 360×740.
- Live `/iletisim` is intentionally unchanged beyond removal of the working-hours field.

## Utility contract

A visitor can reach the verified general phone, email, and office route without a dead form. Sales enquiries remain separated into the Satılık Daireler flow.

## Detector contracts

- Exactly one page H1 and one H2 per design direction.
- Selected B direction keeps a plain warm-concrete background (`background-image: none`); the rejected square grid must not return.
- No working-hours copy, sales mobile number, fake form, fixed blocker, or unapproved shadow.
- Verified phone/email, Satılık, and Projects routes exist in every direction.
- Every link is at least 44×44px, remains inside the viewport, and is externally unoccluded.
- A/B/C keep side-by-side desktop anatomy and stack in the intended order at 360px.
- No horizontal overflow, broken images, or mobile image source wider than 480px.

## Evidence

Each cell produces one screenshot per direction under:

`test-results/fineUX/contact-showcase/<cell>-variant-<a|b|c>-<width>x<height>.png`

Status: PASS. All nine responsive evidence captures passed deterministic detectors; the six materially distinct desktop/mobile direction screenshots were visually inspected.
