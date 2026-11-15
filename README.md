# Ritewheel Autos

**Discover your next vehicle. Get recommendations that make sense. Make it yours.**

Ritewheel Autos is a premium automotive marketplace concept that combines a photography-led dealership experience with an AI-powered car concierge and an interactive vehicle Design Studio.

The goal is to make finding a car feel less like searching through a spreadsheet and more like working with a knowledgeable personal car advisor. The complete customer journey, My Garage concept, sourcing requests, human dealership workflow and release roadmap are documented in [docs/PRODUCT_EXPERIENCE.md](./docs/PRODUCT_EXPERIENCE.md). The future quote, reservation and payment architecture is documented in [docs/PAYMENTS_AND_TRANSACTIONS.md](./docs/PAYMENTS_AND_TRANSACTIONS.md).

> **Project status:** Architecture and product scope defined. The first public implementation is planned; features described here should not be treated as already shipped.

## Product experience

Ritewheel is built around three connected experiences:

1. **Discover** — browse a curated vehicle catalogue, filter inventory, inspect detailed specifications, and compare up to three vehicles.
2. **Ask** — describe the car you want in natural language. The AI concierge asks relevant follow-up questions and recommends vehicles that actually exist in Ritewheel's inventory.
3. **Personalise** — customise supported appearance options such as paint colour, finish, wheels, interior, brake calipers, and trim. Save the configuration and attach it to an enquiry.

Customers can browse and submit enquiries as guests. A protected admin portal manages the vehicles, supported configuration options, enquiries, and test-drive requests.

## Design direction

The visual identity is inspired by premium automotive dealerships:

### Approved homepage layout

- One static cinematic hero image with headline and two clear actions.
- Full-width Make / Body Type / Budget finder immediately below the hero.
- Browse by Category before Featured Vehicles.
- Three large featured-vehicle cards per desktop row.
- Guest-first shopping: no customer sign-in in V1.
- AI Concierge and Design Studio are lightweight promotional links; their feature code loads only when opened.



- Obsidian and charcoal surfaces.
- Restrained amber/gold accents.
- Large, cinematic vehicle photography.
- Refined typography, generous spacing, and polished vehicle cards.
- Subtle motion and responsive layouts.
- A dedicated concierge interface that feels native to the dealership.

Initial palette:

| Colour | Hex |
| --- | --- |
| Obsidian | `#080909` |
| Charcoal | `#171717` |
| Amber gold | `#F5A000` |
| Ivory | `#F4F1EA` |

## Features planned for V1

### Customer-facing marketplace
- Premium homepage and featured inventory.
- Search, sorting, pagination, and filters.
- Vehicle detail pages and image galleries.
- Compare up to three vehicles.
- Responsive mobile and desktop experience.

### Vehicle detail experience

- Large image gallery with optimised lead image and on-demand lightbox.
- Verified vehicle summary, price/currency, availability and specifications.
- Enquiry and test-drive request actions, guest save and compare.
- Contextual AI help only when opened; Design Studio only for supported vehicles.
- Sold, reserved, unavailable and demo listing states are clearly distinguished.

### Inventory browsing experience

- Compact premium catalogue page with server-side search, sorting, filters and pagination.
- Desktop filter sidebar and three-column grid of large vehicle cards.
- Mobile filter drawer and URL-shareable search state.
- Compare up to three vehicles locally.
- Use the selected panoramic-banner/filter-sidebar catalogue concept, but omit its always-visible AI chat column; a small floating AI launcher opens a drawer only when clicked.

### AI Car Concierge
- Dedicated two-panel conversation and vehicle-match workspace; no permanent chat panel on Inventory.
- Natural-language vehicle discovery.
- Preference collection for budget, make, body type, seating, fuel, transmission, use case, and colour.
- Recommendations grounded in published database inventory.
- Vehicle specification questions and comparisons.
- AI mapping of natural-language styling requests to supported configurator options.

The concierge cannot invent stock, pricing, specifications, or booking availability. It cannot submit an enquiry or test-drive request without the customer's explicit confirmation.

### Vehicle Design Studio
- Vehicle-specific preset option groups.
- Exterior colour and finish.
- Wheel style, interior, brake-caliper colour, and appearance package where supported.
- Image-backed previews using curated assets.
- Saved configurations that can be attached to customer enquiries.

V1 is an interactive, asset-backed configurator. It does not use 3D rendering or generate photorealistic vehicle images.

### Dealership dashboard
- Protected Release 1 operations workspace for overview, inventory, enquiries, test-drive requests, sourcing requests and basic business contact settings.
- Database-derived metrics only; no fabricated revenue or growth analytics.
- Single-admin access initially; staff roles and full CRM are Release 2, quotations and payments are Release 3.

### Dealership admin
- Protected admin login.
- Inventory and enquiry overview.
- Create, edit, publish, unpublish, reserve, mark sold, and archive vehicles.
- Manage specifications, images, prices, and configuration options.
- Review enquiries and test-drive requests.
- Update enquiry and appointment-request statuses.

## Technology stack

| Area | Technology |
| --- | --- |
| Full-stack application | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Motion | Framer Motion |
| Backend | Next.js Route Handlers and server-side application services |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| AI | Google Gemini through Vercel AI SDK |
| Admin authentication | Auth.js credentials flow |
| Hosting | Vercel |

A managed PostgreSQL host such as Neon or Supabase-hosted PostgreSQL can be used. The application will connect through Prisma and keep business logic in our own server-side code.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the system design, application structure, database entities, API contract, AI tool restrictions, security model, testing approach, and deployment plan. [DESIGN_SOURCE_OF_TRUTH.md](./docs/DESIGN_SOURCE_OF_TRUTH.md) defines the document hierarchy, approved mockup usage and production asset rules. See [docs/VISUAL_BLUEPRINT.md](./docs/VISUAL_BLUEPRINT.md) for the screen-by-screen visual direction, page layouts, component inventory, interaction states, and performance-friendly visual rules. Performance is a product requirement: responsive optimised imagery, server-rendered pages, route-level code splitting, CSS-first motion, and Core Web Vitals targets are defined in `ARCHITECTURE.md`.

At a glance:

```text
Next.js storefront and admin
          |
   Server route handlers
          |
 Application services
     |           |
   Prisma     Gemini AI
     |
 PostgreSQL
```

## Getting started

The repository is being consolidated into one canonical Next.js application. The product architecture and visual blueprint are design documents; the screens and workflows described there are planned and should not be treated as already implemented. Setup instructions below will be completed alongside the application implementation.

Expected local setup:

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

Expected environment variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL runtime connection |
| `DIRECT_URL` | Direct database connection for migrations, if required |
| `AUTH_SECRET` | Auth.js secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key for the concierge |
| `NEXT_PUBLIC_SITE_URL` | Public application URL |
| `ADMIN_EMAIL` | Initial administrator seed |
| `ADMIN_PASSWORD` | Initial administrator seed; hashed before storage |

Do not commit `.env.local` or real secrets. The marketplace should remain usable when the Gemini key is absent; only the AI concierge is disabled.

## Demo data and honesty

The initial catalogue will use clearly identified demonstration vehicle data and approved vehicle images. Do not present sample vehicles, sample prices, customer testimonials, sales totals, or dealership claims as verified real-world facts.

Every recommendation must be backed by a vehicle record. Every Design Studio option must be enabled for the selected vehicle. A test-drive submission is a request until an administrator accepts it.

## Release boundaries

**Release 1:** Public marketplace, AI Concierge, asset-backed Design Studio, guest/local Garage, enquiries, test-drive and sourcing requests, and basic dealership request queues. No required customer account or online payment processing.

**Release 2:** Customer accounts, synchronised My Garage, saved recommendations, preferences, notifications, staff roles, lead assignment and CRM activity.

**Release 3:** Versioned quotations, vehicle reservation holds, deposit/full/balance obligations, hosted checkout, verified webhooks, refunds, transaction records, reconciliation and handover tracking.

Payment architecture is designed now; live payments are implemented in Release 3 after accounts and sales workflows are stable. Provider selection remains open pending due diligence.

Financing approval, multi-dealership tenancy, live external inventory feeds and generative image/3D rendering remain outside these releases unless separately approved.

## Delivery roadmap

- [ ] **Release 1:** Public marketplace, AI Concierge, Design Studio, guest/local Garage, enquiry/test-drive/sourcing intake and basic admin queues.
- [ ] **Release 2:** Customer accounts, persistent My Garage, notifications, sales roles, lead assignment and CRM.
- [ ] **Release 3:** Quotes, reservations, hosted payment gateway, webhook verification, refunds, reconciliation and purchase handover.

## Project links

- GitHub: [emaklr/ritewheel-autos](https://github.com/emaklr/ritewheel-autos)
- Product architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Product experience: [docs/PRODUCT_EXPERIENCE.md](./docs/PRODUCT_EXPERIENCE.md)
- Design source of truth: [docs/DESIGN_SOURCE_OF_TRUTH.md](./docs/DESIGN_SOURCE_OF_TRUTH.md)
- Payments and transactions: [docs/PAYMENTS_AND_TRANSACTIONS.md](./docs/PAYMENTS_AND_TRANSACTIONS.md)

---

Built as a full-stack automotive marketplace portfolio project.