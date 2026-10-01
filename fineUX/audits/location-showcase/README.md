# Konum showcase fineUX audit

## Scope

- Proposal route: `/showcases/konum-lab`
- Variants: A live map explorer, B lightweight coordinate atlas, C project-detail dossier
- Cells: 1366×900, 1024×768, and 360×740

## Utility contract

A visitor can identify the intended MEY building, read its exact address and coordinates,
then open the same verified pin or directions in Google, Yandex, Apple, or OpenStreetMap.

## Detector contracts

- One H1 and exactly three proposal variants.
- Every provider URL carries the selected building's exact coordinates.
- A's selection updates its map, address, pin links, and directions as one state.
- Real-map variants retain visible OpenStreetMap attribution.
- B identifies itself as a schematic coordinate distribution rather than a road map.
- Desktop/tablet preserve split compositions; mobile stacks each map before its decision panel.
- All actions are at least 44×44px, inside the viewport, and externally unoccluded.
- No horizontal overflow, overlapping panels, clipped pins, fixed blockers, or unapproved shadows.

Screenshots are written to `test-results/fineUX/location-showcase/`.
