# Ritewheel Autos — Design and Product Source of Truth

**Version:** 1.0  
**Status:** Project governance standard  
**Last updated:** 15 November 2026

## 1. Why this document exists

Ritewheel has several screens, architecture decisions, release boundaries and generated visual mockups. This document defines which source controls which decision, how conflicts are resolved, and where future assets belong.

The purpose is to prevent implementation from relying on scattered chat messages, stale screenshots, unapproved mockups or guesses.

## 2. Source-of-truth hierarchy

Use the following order:

| Priority | Source | What it governs |
| --- | --- | --- |
| 1 | Explicit product decisions approved by the owner and recorded in merged project documents | Final product choices and accepted trade-offs |
| 2 | `docs/PRODUCT_EXPERIENCE.md` | Customer journeys, roles, features, business workflows and release boundaries |
| 3 | `ARCHITECTURE.md` | Technical architecture, data model, API contracts, security, backend rules and system constraints |
| 4 | `docs/VISUAL_BLUEPRINT.md` | Screen layouts, navigation, components, interactions, responsive behaviour and UI states |
| 5 | `docs/PERFORMANCE_BUDGET.md` | Performance targets, budgets and release checks |
| 6 | `docs/PAYMENTS_AND_TRANSACTIONS.md` | Future quotations, reservations, payment, refund and reconciliation model |
| 7 | Approved design-reference images | Visual appearance, composition, spacing and mood only |
| 8 | Application code | Current implemented behaviour, which must be reconciled with the documents through review |

If a mockup conflicts with a written product, architecture or performance rule, the written rule wins. If two written documents conflict, update the relevant documents in one reviewed change; do not silently choose one during implementation.

The README is a project entry point and summary. It does not override the detailed documents.

## 3. Canonical Git location

- Repository: `emaklr/ritewheel-autos`.
- `main` is the canonical merged source of truth.
- A feature/design branch or open pull request is proposed work, not an approved baseline until merged.
- Before implementation, read the latest merged versions from `main`; do not rely on an older local copy or a previous chat summary.
- Every approved product/visual/architecture change should be committed and reviewed as a pull request.

## 4. What the approved design mockups mean

Mockups are visual references, not runtime assets and not a complete functional specification.

They may contain:
- Illustrative vehicle names, prices, specifications and images.
- Temporary wording, badges, statistics or provider labels.
- UI states or controls that are only conceptual.
- Elements that are later removed or changed for performance, accessibility or product accuracy.

Do not copy those details into the live application unless the underlying product data and written requirements support them.

### Current reference set

The approved visual direction consists of:
- Homepage: `homepage-approved.webp` — one cinematic static hero, full-width vehicle finder immediately below, image-led categories and three featured cards on desktop.
- Inventory: `inventory-approved.webp` — compact panoramic banner, left filter sidebar and full-width results grid; no permanent AI conversation panel.
- Vehicle Details: `vehicle-details-concept.webp` — gallery, factual summary/action panel, details and specifications.
- AI Concierge: `ai-concierge-concept.webp` — dedicated conversation/recommendation workspace with save, compare and sourcing actions.
- Dealership Dashboard: `dealership-dashboard-concept.webp` — protected Release 1 operations workspace with database-derived overview metrics and queues for inventory, enquiries, test drives and sourcing.
- Vehicle Design Studio: `design-studio-concept.webp` — asset-backed configurator with supported option groups, AI style proposal and build summary.

The current downloadable design-reference pack is supplied with this design handoff. The latest pack contains six screens, including the Dealership Dashboard. The WebP files are reference-only. They have not been added to the repository's `public/` assets and should not be imported into the production application as page backgrounds.

Before implementation begins, keep the pack with the project and place the approved reference files in `docs/design-reference/` if they are not already present. Do not put design screenshots in `public/`.

The Design Studio concept is also a visual-only reference: its vehicle, options, selected combination and price adjustment are illustrative. Production options/prices/previews must come from the selected vehicle's configured records and approved assets. The V1 preview is mapped photography, not a live 3D render.

## 5. Asset placement rules

### Design references

Location: `docs/design-reference/`

Use for:
- Full-screen mockups.
- Screen comparison images.
- Annotated design examples.
- Visual moodboards and approved variants.

Format:
- Prefer WebP or compressed PNG.
- Use clear names such as `homepage-approved.webp`, `inventory-approved.webp`, `vehicle-details-approved.webp`.
- Keep a small README/index explaining which screens are approved and which are superseded.
- Keep only current approved references in the primary list; move rejected concepts to an archive if they are needed for history.

### Production assets

Location: `public/images/` for small version-controlled assets, or an approved image CDN/object store for larger vehicle imagery.

Use for:
- Actual listing photographs approved for use.
- Vehicle thumbnails and galleries.
- Curated Design Studio preview variants.
- Brand logo and interface illustrations.
- Icons/fonts when properly licensed and appropriately stored.

Production asset rules:
- Keep a source/licence note for externally sourced images.
- Use stable asset IDs/URLs in database records for dynamic vehicle galleries.
- Optimise images for target display sizes; use Next.js image delivery.
- Reserve aspect ratios and provide alt text.
- Never use generated screen mockups as actual vehicle listing photos.
- Never present an AI-generated vehicle concept as a photograph of a real car or as proof of stock.

## 6. Performance is part of the design contract

The mockup should not be implemented literally when it would cause avoidable performance problems.

The implementation must follow `ARCHITECTURE.md` performance section and `docs/PERFORMANCE_BUDGET.md`:
- One static, optimised homepage hero.
- No autoplay video, 3D/WebGL or persistent parallax in V1.
- Server Components by default and small interactive islands.
- AI, Studio and other heavy functionality loaded on demand.
- Responsive image sizes and lazy loading.
- No permanently visible AI column on Inventory.

A visual improvement must justify its cost and pass the performance checks.

## 7. Change process

When a product or design decision changes:
1. Update `PRODUCT_EXPERIENCE.md` if customer behaviour or release scope changes.
2. Update `ARCHITECTURE.md` if data, backend, API, security or system rules change.
3. Update `VISUAL_BLUEPRINT.md` if layout, interaction, responsive behaviour or UI states change.
4. Update `PERFORMANCE_BUDGET.md` if loading, bundle or runtime requirements change.
5. Update the mockup/reference image if the visual target changes materially.
6. Update `README.md` only if the project summary/roadmap needs to change.
7. Submit a pull request with the changed files and explain the decision.

Do not modify application code first and document later when the change affects a product or architecture decision.

## 8. Release boundary reminder

- Release 1: actionable public marketplace, guest/local Garage and comparison, AI Concierge, enquiries, test-drive and sourcing intake, basic dealership queues. No Design Studio.
- Release 2: customer accounts, synced My Garage, preferences, notifications, staff roles and CRM. No Design Studio.
- Release 3: verified quotations, vehicle reservations, hosted payments, webhooks, refunds, reconciliation and purchase handover. No Design Studio.
- After Release 3: only then reassess the deferred Vehicle Design Studio as a separate enhancement.

Payment architecture is documented now, but live payment processing is not a Release 1 or Release 2 dependency. The Design Studio screen concept remains reference-only and is not a delivery commitment for any of the three releases.

---

**Implementation rule:** Always start from the latest merged written specifications. Use images to understand the intended look; use the written source of truth to understand what to build.
