# Ritewheel Autos

**Discover confidently. Personalise thoughtfully. Find your next vehicle.**

Ritewheel is a premium automotive discovery and dealership platform. It brings together vehicle search, AI-assisted discovery, supported vehicle personalisation, saved shortlists and human dealership assistance.

## Current implementation status

**Release 1 foundation is in progress.** The public storefront, PostgreSQL/Prisma data layer, server-side vehicle catalogue, guest-local Garage/compare, and first protected dealership workspace are being delivered in small, reviewable steps.

The current catalogue contains illustrative demo records only. Demo vehicles, photographs, specifications and prices are not real dealer stock or offers.

### Implemented on the current branch
- Premium responsive homepage, vehicle finder and featured vehicle cards.
- Server-rendered public inventory with search, sorting, filtering and database pagination.
- Vehicle detail route with a multi-image gallery/lightbox.
- PostgreSQL/Prisma schema and migration for vehicles, images, options, builds, enquiries, test drives, sourcing requests, administrator accounts, sessions and audit logs.
- Production and development Neon branches with the committed migration and demo inventory.
- Protected single-administrator sign-in using salted scrypt password hashes, opaque database-backed sessions and HttpOnly cookies.
- Local-only administrator bootstrap command; no public administrator registration.
- Database-derived admin overview and searchable/status-filtered inventory list.
- Protected admin enquiry queue with search, status filtering, customer/vehicle details and audited status updates.
- Public test-drive request form for eligible live vehicles, with future-slot validation and submission rate limiting.
- Protected admin test-drive queue with search, status filtering, customer/vehicle details, confirmed appointment management and audit logs.
- Public vehicle sourcing request form for customer vehicle briefs, with validated year ranges, budget/currency, contact details and submission rate limiting.
- Protected admin sourcing-request queue with search, status filtering, customer requirements, and audited status progression.
- Vehicle create/edit, publication/status changes, price/currency, specifications, features and ordered image URL management.
- Transactional vehicle/image writes and audit records for inventory changes.
- Server-side Zod validation and admin-session checks on protected API mutations.
- Public enquiry API, vehicle read API and database health endpoint.
- Browser-local My Garage and compare selection (maximum three vehicles).

### Not yet implemented
- Dealership settings.
- Binary image uploads; inventory currently stores approved CDN/object-storage URLs or local asset paths.
- Working Gemini AI Concierge and grounded inventory tools.
- Interactive vehicle Design Studio and administration of vehicle-specific option sets.
- Customer accounts and cross-device Garage sync.
- Staff roles, lead assignment and CRM (Release 2).
- Quotes, reservations and online payments (Release 3).

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
| DATABASE_URL | PostgreSQL runtime connection (pooled URL where available) |
| DIRECT_URL | Direct PostgreSQL connection for Prisma migrations |
| AUTH_SECRET | Reserved for future signed customer/CSRF tokens; admin sessions are database-backed |
| GOOGLE_GENERATIVE_AI_API_KEY | Gemini key for the Concierge (not yet used by the coming-soon page) |
| NEXT_PUBLIC_SITE_URL | Canonical public URL |

Never commit .env, .env.local, session tokens, passwords or real database credentials.

## Creating the first administrator

There is deliberately no public administrator registration or bootstrap-password endpoint. After the admin-session migration has been deployed to the target database:

1. Pull the private Vercel environment variables into the local, git-ignored .env.local file:

   ~~~powershell
   vercel link
   vercel env pull .env.local --environment production
   ~~~

2. Create the first administrator locally. The command prompts for the password through a PowerShell secure-string prompt; do not put the password in source code, chat, Vercel variables or a committed file.

   ~~~powershell
   $env:ADMIN_EMAIL = Read-Host "Administrator email"
   $env:ADMIN_NAME = Read-Host "Administrator name"
   $securePassword = Read-Host "Create a strong password (12–128 characters)" -AsSecureString
   $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
   try {
     $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
     npm run admin:create
   } finally {
     [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
     Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL, Env:ADMIN_NAME -ErrorAction SilentlyContinue
   }
   ~~~

3. Open /admin/login and sign in.

The bootstrap command refuses to overwrite an existing administrator. Use the application's controlled account recovery procedure for future password changes; do not create another account as a workaround.

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

