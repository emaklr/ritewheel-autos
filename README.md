# Ritewheel Autos

**Discover your next vehicle. Get recommendations that make sense. Make it yours.**

Ritewheel Autos is a premium automotive marketplace concept that combines a photography-led dealership experience with an AI-powered car concierge and an interactive vehicle Design Studio.

The goal is to make finding a car feel less like searching through a spreadsheet and more like working with a knowledgeable personal car advisor.

> **Project status:** Architecture and product scope defined. The first public implementation is planned; features described here should not be treated as already shipped.

## Product experience

Ritewheel is built around three connected experiences:

1. **Discover** — browse a curated vehicle catalogue, filter inventory, inspect detailed specifications, and compare up to three vehicles.
2. **Ask** — describe the car you want in natural language. The AI concierge asks relevant follow-up questions and recommends vehicles that actually exist in Ritewheel's inventory.
3. **Personalise** — customise supported appearance options such as paint colour, finish, wheels, interior, brake calipers, and trim. Save the configuration and attach it to an enquiry.

Customers can browse and submit enquiries as guests. A protected admin portal manages the vehicles, supported configuration options, enquiries, and test-drive requests.

## Design direction

The visual identity is inspired by premium automotive dealerships:

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

### AI Car Concierge
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

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the system design, application structure, database entities, API contract, AI tool restrictions, security model, testing approach, and deployment plan. See [docs/VISUAL_BLUEPRINT.md](./docs/VISUAL_BLUEPRINT.md) for the screen-by-screen visual direction, page layouts, component inventory, and interaction states.

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

## V1 boundaries

To keep the first release achievable, V1 does not include:

- Online payment or checkout.
- Financing approval or credit checks.
- Multi-dealership tenancy.
- Customer social accounts or public reviews.
- Live manufacturer inventory feeds.
- Generative image editing or 3D vehicle rendering.

These can be considered after the main marketplace and customer journey are working reliably.

## Delivery roadmap

- [ ] **Phase 1:** Consolidate repository, build the premium storefront, inventory, vehicle detail, database, enquiries, test-drive requests, and admin portal.
- [ ] **Phase 2:** Add the AI Concierge with read-only inventory tools, grounded recommendations, and vehicle comparison.
- [ ] **Phase 3:** Add the vehicle Design Studio, preview assets, AI option mapping, and saved builds.
- [ ] **Release:** Test the public customer journey, protect admin routes, verify deployment, and publish the live portfolio URL.

## Project links

- GitHub: [emaklr/ritewheel-autos](https://github.com/emaklr/ritewheel-autos)
- Product architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

Built as a full-stack automotive marketplace portfolio project.