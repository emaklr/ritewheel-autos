# Ritewheel Autos

**Discover confidently. Personalise thoughtfully. Find your next vehicle.**

Ritewheel is a premium automotive discovery and dealership platform. It brings together vehicle search, AI-assisted discovery, supported vehicle personalisation, saved shortlists and human dealership assistance.

## Current implementation status

**Release 1 foundation is in progress.** This branch establishes the root Next.js application, PostgreSQL/Prisma data model, server-side inventory query layer, initial customer-facing pages and guest-local Garage/compare interactions.

The current catalogue contains illustrative demo records only. Demo vehicles, photographs, specifications and prices are not real dealer stock or offers.

### Implemented in this foundation branch
- Premium responsive homepage with a single hero image, full-width finder, catalogue categories and featured vehicle cards.
- Server-rendered inventory page with search, sorting, filters and database pagination (12 per page).
- Vehicle detail route with price/status/specification presentation and responsive multi-image gallery/lightbox.
- Guest enquiry form and server-side persistence endpoint with validation, request references, origin/body-size checks, honeypot and best-effort process-local throttling.
- Three optimised local demo vehicle photos recovered from PR #12; the BMW X6 file is stored with its actual JPEG extension.
- PostgreSQL schema for vehicles, images, vehicle options, saved builds, enquiries, test-drive requests, sourcing requests, admin users and audit logs.
- Prisma 7 PostgreSQL adapter and server-only client.
- Inventory read API with validated query parameters and bounded saved-vehicle lookup by stable slug.
- Browser-local My Garage and compare selection (maximum three comparison vehicles).
- Health endpoint that reports database connection state.
- Explicitly labelled demo catalogue fallback when `DATABASE_URL` is not configured.
- CI workflow for Prisma generation, TypeScript, lint and Next.js build.

### Not yet implemented
- Live PostgreSQL provisioning, initial migration and seeded DB deployment.
- Admin authentication and dealership management interface.
- Live enquiry submissions until PostgreSQL is provisioned, migrated and configured in the deployment environment.
- Persisted callback, test-drive and sourcing request forms.
- Working Gemini AI Concierge.
- Interactive vehicle Design Studio.
- Customer accounts and cross-device Garage sync.
- Online payments (Release 3).

The documentation is the product source of truth: [Product Experience](./docs/PRODUCT_EXPERIENCE.md), [Architecture](./ARCHITECTURE.md), [Visual Blueprint](./docs/VISUAL_BLUEPRINT.md), and [Design Source of Truth](./docs/DESIGN_SOURCE_OF_TRUTH.md).

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma ORM 7 with `@prisma/adapter-pg`
- Zod validation
- Google Gemini through Vercel AI SDK (next AI milestone)
- Vercel hosting

## Local setup

Requirements: Node.js 22.18+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

The homepage and inventory can display the clearly labelled demo catalogue while `DATABASE_URL` is absent. The health endpoint returns a degraded status until PostgreSQL is configured.

Once you have provisioned PostgreSQL and populated `.env`:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Check the backend at `/api/health`. Inventory JSON is available from `/api/vehicles`. Guest enquiries are submitted to `/api/enquiries` once PostgreSQL is configured.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL runtime connection (pooled URL where available) |
| `DIRECT_URL` | Direct PostgreSQL connection for migrations |
| `AUTH_SECRET` | Future admin/customer session secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key for the Concierge |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL |

Never commit `.env`, `.env.local` or real credentials.

## Performance principles

- Server Components by default.
- Responsive Next Image delivery and reserved image dimensions.
- Route-specific code; AI and Design Studio load only when opened.
- CSS-first transitions and no autoplay video/3D rendering in V1.
- 12-item server-paginated inventory.
- Core Web Vitals targets are defined in [docs/PERFORMANCE_BUDGET.md](./docs/PERFORMANCE_BUDGET.md).

## Release roadmap

- **Release 1:** public marketplace, AI Concierge, asset-backed Design Studio, guest/local Garage, enquiry/test-drive/sourcing intake and basic dealership operations.
- **Release 2:** customer accounts, synchronised My Garage, saved recommendations, preferences, notifications, staff roles and CRM.
- **Release 3:** verified quotations, vehicle reservation holds, hosted payments, webhooks, refunds, reconciliation and purchase handover.

Payments are architected in [docs/PAYMENTS_AND_TRANSACTIONS.md](./docs/PAYMENTS_AND_TRANSACTIONS.md); live payment processing is deliberately reserved for Release 3.

