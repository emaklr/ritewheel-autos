# Ritewheel Autos

**Discover confidently. Personalise thoughtfully. Get help from real people when it matters.**

Ritewheel Autos is a premium automotive marketplace with a planned AI car concierge, asset-backed Design Studio, customer Garage and dealership workspace.

## Implementation status

The root Next.js application foundation is being established in the `implementation/release-1-foundation` branch.

The first vertical slice includes:
- Premium homepage and vehicle finder.
- Server-side inventory search, filters, sorting and pagination.
- Vehicle detail pages.
- PostgreSQL/Prisma data model for vehicles, images, options, builds, enquiries, test-drive requests, sourcing requests and administrator accounts.
- Demo mode with visibly labelled sample listings.
- Enquiry API that persists to PostgreSQL once the database is configured.

The AI Concierge screen is a placeholder until the Gemini service is implemented. The admin login/dashboard, Design Studio, compare/My Garage persistence and test-drive/sourcing APIs are subsequent implementation slices. Do not treat planned features as shipped.

## Product experience

- **Discover:** browse, filter and compare vehicle listings.
- **Ask:** describe what you need to the AI Concierge; grounded recommendations will use actual inventory after its integration.
- **Personalise:** configure supported appearance options through an asset-backed Design Studio.
- **My Garage:** save vehicles, builds and recommendations; cross-device account sync is Release 2.
- **Human assistance:** submit enquiries, test-drive requests and sourcing requests for dealership follow-up.

My Garage is a shortlist/workspace, not a traditional checkout cart.

## Source of truth

- [Product Experience](./docs/PRODUCT_EXPERIENCE.md)
- [Application Architecture](./ARCHITECTURE.md)
- [Visual Blueprint](./docs/VISUAL_BLUEPRINT.md)
- [Design Source of Truth](./docs/DESIGN_SOURCE_OF_TRUTH.md)
- [Performance Budget](./docs/PERFORMANCE_BUDGET.md)
- [Payments and Transactions — Release 3](./docs/PAYMENTS_AND_TRANSACTIONS.md)

## Technology stack

| Layer | Technology |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS 4 and custom design tokens |
| Database | PostgreSQL |
| ORM | Prisma 7 with PostgreSQL driver adapter |
| Validation | Zod |
| AI (planned) | Google Gemini through Vercel AI SDK |
| Hosting | Vercel |

Ritewheel owns its server-side routes, validation, query services and business logic. PostgreSQL may be hosted by Supabase or Neon; managed hosting does not transfer backend ownership to the provider.

## Local setup

Requirements: Node.js 22.18+ and npm 10+.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template to `.env` (or `.env.local`):

   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL` to your PostgreSQL connection string. Without it, the public catalogue runs in conspicuously labelled demo mode and enquiry submissions are disabled.

4. Generate Prisma Client, apply migrations and seed demo rows:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. Start the application:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | For persistence | PostgreSQL runtime connection |
| `DIRECT_URL` | Optional | Direct migration connection if your host provides a pooled runtime URL |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For AI | Server-side Gemini key |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL |
| `DEMO_MODE` | Optional | Demo catalogue while no database is configured |

Never commit secrets. Enter production secrets in Vercel project settings.

## Release roadmap

- **Release 1:** public marketplace, guest/local shortlist, AI Concierge, Design Studio, enquiries, test-drive and sourcing intake, basic dealership queues.
- **Release 2:** customer accounts, synchronised My Garage, notifications, staff roles and CRM.
- **Release 3:** verified quotations, reservations, hosted checkout, webhooks, refunds, reconciliation and purchase handover.

---

Ritewheel is built to make vehicle discovery clear, helpful and trustworthy.
