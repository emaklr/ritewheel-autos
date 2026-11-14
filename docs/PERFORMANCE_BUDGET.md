# Ritewheel Autos — Performance Budget

**Status:** Proposed acceptance criteria for V1  
**Date:** 14 November 2026

This project treats performance as part of its premium experience. The detailed requirements are in [ARCHITECTURE.md](../ARCHITECTURE.md#21-performance-first-design-and-engineering-requirements) and [VISUAL_BLUEPRINT.md](./VISUAL_BLUEPRINT.md#17-performance-friendly-visual-implementation-rules).

## Targets

| Metric | Target |
| --- | ---: |
| LCP | ≤ 2.5 seconds |
| INP | ≤ 200 milliseconds |
| CLS | ≤ 0.1 |

Measure the 75th percentile separately for mobile and desktop when field data is available. These are targets, not guarantees.

## Image delivery targets

- Desktop hero: aim for approximately 300 KB or less.
- Mobile hero crop: aim for approximately 180 KB or less.
- Vehicle card image: aim for approximately 100–140 KB or less at its rendered size.
- Load the first detail-gallery image first; defer remaining images.

Use Next.js image optimisation, responsive sizes, reserved aspect ratios, and lazy loading for below-fold images. Preserve sufficient image quality for the premium presentation.

## Runtime constraints

- No autoplay video, WebGL/3D rendering, canvas particle effects, scroll-jacking, or continuous parallax in V1.
- CSS-first transitions on opacity and transform.
- Public pages are Server Components by default; use client components only for actual interaction.
- AI and Design Studio route bundles load on demand, not on the homepage.
- Inventory page starts with 12 records and paginates on the server.
- AI requests run only after user actions and have bounded history/output/tool calls.

## Validation checklist

- [ ] Lighthouse mobile check for homepage, inventory, vehicle detail, Concierge, and Design Studio.
- [ ] Lighthouse desktop check for same routes.
- [ ] Test with mobile CPU/network throttling.
- [ ] Verify hero is the only preloaded large image.
- [ ] Verify below-fold and inactive gallery images lazy-load.
- [ ] Verify no layout shift from images or fonts.
- [ ] Verify filters, compare and configurator controls remain responsive.
- [ ] Verify Concierge code is not loaded on routes that do not use it.
- [ ] Verify reduced-motion preference.
- [ ] Inspect bundle changes when adding a dependency.

Do not merge a rich visual effect or dependency that creates an avoidable regression without a documented reason and measured trade-off.
