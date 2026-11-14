# Ritewheel Autos — Application Architecture

**Status:** Proposed architecture with visual blueprint defined; implementation not yet begun  
**Product:** Ritewheel Autos  
**Document owner:** Product and Engineering  
**Last updated:** 14 November 2026 — visual architecture revision

## 1. Purpose

Ritewheel Autos is a premium automotive marketplace and dealership experience. Customers can discover vehicles, understand which options suit their needs, compare shortlisted vehicles, configure supported appearance options, and send an enquiry or test-drive request.

The product combines a luxury dealership storefront with a practical AI car concierge. The first release is intentionally focused: it should feel polished and complete, while remaining small enough to build, test, and deploy quickly.

This document describes the intended system. It is not a claim that every component is already implemented.

## 2. Product principles

1. **Premium first impression.** The storefront should look and feel like a high-end dealership, not a generic catalogue.
2. **Real data, not a mock chatbot.** AI recommendations must come from the published vehicle inventory.
3. **Backend work is visible.** Vehicle search, validation, persistence, admin operations, and enquiry workflows are implemented in our own server-side application code.
4. **Progressive discovery.** Customers can browse normally or ask the concierge for help. The AI asks only useful follow-up questions.
5. **Honest personalisation.** The configurator only offers options supported for that vehicle and only presents previews that actually exist.
6. **Small first release.** No payment processing, multi-dealership tenancy, complex customer accounts, or generative image editing in V1.

## 3. V1 product scope

### 3.1 Public customer experience

- Premium homepage with hero photography, primary search, featured vehicles, popular makes, and clear calls to action.
- Inventory listing with search, sorting, pagination, and filters.
- Vehicle detail page with image gallery, price, condition, specifications, features, availability, and enquiry actions.
- Side-by-side comparison of up to three vehicles.
- AI Car Concierge for natural-language discovery and vehicle questions.
- Vehicle Design Studio with supported preset appearance options.
- Save a configuration and continue to an enquiry.
- Submit a general vehicle enquiry or test-drive request as a guest.
- Responsive desktop, tablet, and mobile layouts.

### 3.2 AI Car Concierge

The concierge is a guided shopping assistant, not a general-purpose chatbot.

It must be able to:

- Understand natural-language preferences such as budget, vehicle type, brand, seating, use case, fuel, transmission, and preferred colours.
- Ask concise follow-up questions when important preferences are missing.
- Search published inventory using server-side tools.
- Recommend a small set of real matching vehicles and explain the match.
- Retrieve a vehicle's stored specifications and answer questions from those facts.
- Compare two or three vehicles using stored data.
- Explain when there are no exact matches and offer sensible search relaxations.
- Translate a customer's design request into supported Design Studio selections.

It must not:

- Invent a vehicle, price, feature, specification, stock status, or appointment slot.
- Claim a vehicle is available unless the database says it is published and available.
- submit an enquiry, reserve a vehicle, or book a test drive without the customer reviewing and confirming a normal form.
- Treat model-generated text as trusted data or execute arbitrary SQL, URLs, or code.

### 3.3 Vehicle Design Studio — Option A

V1 uses an asset-backed interactive configurator, not generative image editing or a 3D engine.

Supported option groups can include:

- Exterior paint colour and finish.
- Wheel style.
- Interior colour or upholstery.
- Brake-caliper colour.
- Appearance or trim package.

Each vehicle defines its own valid options. The AI can select only option IDs that exist for that vehicle.

**Preview rule:** when an exact preview asset exists for a configuration, show it. When a full combination has no preview asset, retain the closest valid base/variant image and clearly show the selected options in the configuration summary. Do not imply that a missing image has been photorealistically rendered. The first demo vehicle should have enough curated preview assets to make the experience convincing.

A saved build stores the selected option IDs and a preview asset reference. It can be reopened and attached to an enquiry.

### 3.4 Admin experience

Admin users can:

- Sign in through a protected admin login.
- View counts for published vehicles, enquiries, and test-drive requests.
- Create, edit, publish, unpublish, reserve, mark sold, and archive vehicle listings.
- Manage specifications, features, prices, currency, and availability.
- Add and reorder vehicle image URLs and preview assets.
- Define valid configuration options per vehicle.
- Review enquiries and test-drive requests.
- Update enquiry/booking workflow statuses.

V1 is a single-dealership product. It does not include dealer self-registration or multi-tenant organisation management.

### 3.5 Explicitly out of scope for V1

- Online payments, deposits, escrow, or checkout.
- Automatic vehicle financing approval or credit checks.
- Vehicle delivery/logistics management.
- Customer social accounts, public reviews, or messaging inbox.
- Multi-dealership tenancy and dealer subscriptions.
- Automated third-party vehicle valuation.
- Real-time manufacturer inventory feeds.
- AI image generation, 3D vehicle rendering, or arbitrary vehicle-part replacement.
- Claims that a test-drive request is confirmed before an administrator accepts it.

## 4. Design system and experience direction

The visual reference is a cinematic luxury dealership landing page: dark photography-led hero, refined typography, restrained amber/gold highlights, dark surfaces, and large vehicle imagery.

Initial design tokens:

| Token | Value | Use |
| --- | --- | --- |
| Obsidian | `#080909` | Main page background |
| Charcoal | `#171717` | Cards, navigation, panels |
| Amber gold | `#F5A000` | Primary accent and calls to action |
| Ivory | `#F4F1EA` | Primary text and light surfaces |
| Muted grey | `#A5A5A5` | Secondary text |

Design rules:

- Use gold sparingly for actions, active states, labels, and small highlights.
- Use authentic, high-quality vehicle imagery with consistent crops.
- Keep overlays and glass effects subtle enough to preserve text contrast.
- Use responsive navigation, accessible focus states, and touch-friendly controls.
- Prefer purposeful motion: gentle reveals, image transitions, card hover states, and reduced-motion support.
- Do not use fabricated customer testimonials, dealership statistics, or badges implying verified stock.

## 5. Technology choices

| Layer | Choice | Responsibility |
| --- | --- | --- |
| Application | Next.js App Router + React + TypeScript | Public pages, admin pages, server rendering, and API route handlers |
| Styling | Tailwind CSS + shadcn/ui | Design system and accessible UI primitives |
| Motion | Framer Motion | Restrained interface animations |
| Validation | Zod | Runtime validation for forms, API inputs, and AI tool arguments |
| Database | PostgreSQL | Persistent inventory, configurations, enquiries, bookings, and admin records |
| ORM | Prisma | Schema, migrations, typed queries, and database access |
| AI | Google Gemini through Vercel AI SDK | Natural-language concierge and tool calling |
| Authentication | Auth.js credentials provider for admin access | Admin sessions and protected routes |
| Password hashing | bcrypt | One-way admin password hashing |
| Hosting | Vercel | Application hosting and deployment |
| Image source | Curated local/public assets and approved image URLs in V1 | Vehicle photography and configurator previews |

### PostgreSQL hosting

Use a managed PostgreSQL instance. Neon or Supabase-hosted PostgreSQL are both acceptable. The application connects to PostgreSQL through Prisma; core business logic remains in our own Next.js server routes and services.

This keeps the database portable and demonstrates backend engineering without requiring us to operate a database server ourselves.

Use a pooled connection for serverless runtime queries where supported and a direct connection for Prisma migrations. The exact connection strings are supplied through deployment environment variables, never committed to Git.

### AI provider

Use Google Gemini through the Vercel AI SDK behind a server-only provider adapter. The model and provider should be replaceable without changing the UI or vehicle service layer.

The application must work in a useful non-AI mode if the AI key is absent: inventory browsing, filters, vehicle details, configuration selection, and enquiries remain available. The concierge should display a clear unavailable state rather than silently pretending to be AI-powered.

## 6. High-level architecture

```text
Browser
  |
  +-- Public storefront
  |     +-- Homepage
  |     +-- Inventory and filters
  |     +-- Vehicle detail
  |     +-- Compare
  |     +-- Design Studio
  |     +-- AI Concierge UI
  |
  +-- Admin portal
        +-- Admin login
        +-- Dashboard
        +-- Vehicle management
        +-- Configuration options
        +-- Enquiry and test-drive management
                |
                v
        Next.js server boundary
          +-- Route handlers
          +-- Auth/session checks
          +-- Zod validation
          +-- Rate limiting
          +-- Application services
          |     +-- Vehicle service
          |     +-- Search/matching service
          |     +-- Build/configuration service
          |     +-- Enquiry service
          |     +-- Test-drive service
          |     +-- Admin service
          +-- AI concierge service
                +-- Gemini model adapter
                +-- Read-only inventory tools
                +-- Structured response validation
                |
                v
          Prisma data-access layer
                |
                v
             PostgreSQL
```

All database access and AI provider calls happen on the server. The browser never receives the database connection string, AI API key, password hashes, or unrestricted database access.

## 7. Proposed application structure

The target is one canonical Next.js application at the repository root.

```text
/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── vehicles/[slug]/page.tsx
│   │   ├── compare/page.tsx
│   │   └── studio/[slug]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── vehicles/page.tsx
│   │   ├── vehicles/new/page.tsx
│   │   ├── vehicles/[id]/page.tsx
│   │   ├── enquiries/page.tsx
│   │   └── test-drives/page.tsx
│   └── api/
│       ├── vehicles/route.ts
│       ├── vehicles/[id]/route.ts
│       ├── concierge/route.ts
│       ├── builds/route.ts
│       ├── enquiries/route.ts
│       ├── test-drives/route.ts
│       └── admin/
│           ├── vehicles/route.ts
│           ├── vehicles/[id]/route.ts
│           ├── enquiries/[id]/route.ts
│           └── test-drives/[id]/route.ts
├── components/
│   ├── layout/
│   ├── home/
│   ├── vehicle/
│   ├── concierge/
│   ├── studio/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── ai/
│   ├── db/
│   ├── vehicles/
│   ├── builds/
│   ├── enquiries/
│   ├── validation/
│   └── rate-limit/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── images/vehicles/
├── tests/
├── docs/
├── ARCHITECTURE.md
├── README.md
├── .env.example
└── package.json
```

This is the intended target structure, not a description of the current repository tree. The current repository contains an older root storefront and a nested `ritewheels-autos/` starter directory. During implementation, inspect and consolidate these carefully; do not discard useful assets or history without review.

## 8. Data model

Use UUID primary keys, timestamps, explicit enums where status values are controlled, and indexes for common filters.

### Core entities

**AdminUser**
- id, email (unique), passwordHash, name, role, active, createdAt, updatedAt.
- V1 has an admin role; keep the role field extensible.

**Vehicle**
- id, slug (unique), make, model, trim, year, bodyType, description.
- price (decimal), currency (ISO currency code), condition, mileage.
- transmission, fuelType, engine, drivetrain, seats.
- exterior/interior summary fields, features (structured JSON or related records).
- status: DRAFT, AVAILABLE, RESERVED, SOLD, ARCHIVED.
- featured, publishedAt, createdAt, updatedAt.

**VehicleImage**
- id, vehicleId, url, altText, sortOrder, isPrimary, imageType.
- imageType distinguishes gallery images from configurator preview assets.

**VehicleOption**
- id, vehicleId, groupKey, optionKey, label, priceDelta, available, previewImageUrl, sortOrder.
- groupKey examples: exteriorColour, paintFinish, wheelStyle, interior, brakeCaliper, appearancePackage.
- Options are vehicle-specific; never assume every vehicle supports the same options.

**VehicleBuild**
- id, publicId (unguessable unique identifier), vehicleId, selectedOptions (JSON), previewImageUrl, createdAt, updatedAt.
- A build can be reopened through its public ID and attached to an enquiry.

**Enquiry**
- id, customerName, email, phone, message, vehicleId (optional), buildId (optional), source, status, createdAt, updatedAt.
- status: NEW, CONTACTED, QUALIFIED, CLOSED, SPAM.

**TestDriveRequest**
- id, customerName, email, phone, vehicleId, preferredDate, preferredTime, notes, status, createdAt, updatedAt.
- status: REQUESTED, ACCEPTED, DECLINED, COMPLETED, CANCELLED.
- A submitted request is not a confirmed appointment.

**AdminAuditLog**
- id, adminUserId, action, entityType, entityId, metadata (safe JSON), createdAt.
- Record high-value admin actions such as publishing a vehicle, changing price, and changing status.

### Data integrity

- Use database constraints for unique emails, vehicle slugs, and build public IDs.
- Use Prisma transactions for operations that must update more than one record.
- Store money as a decimal type, not floating-point arithmetic.
- Store a currency code with every price. Do not silently convert currencies in V1.
- Use database enums or validated status transitions to prevent invalid workflow states.
- Never expose internal-only fields such as passwordHash or private notes in public API responses.

## 9. Main application flows

### 9.1 Browse and search

1. Customer opens the homepage or inventory page.
2. UI sends filters, query, sort, page, and page size to the vehicle query service.
3. Server validates query parameters and builds a constrained Prisma query.
4. Only published vehicles with an appropriate public status are returned.
5. Inventory cards link to a stable vehicle slug.

Filters: make, body type, price range, year, mileage, transmission, fuel type, condition, seats, and availability. Filters should be composable; pagination should happen in the database, not after downloading the full inventory.

### 9.2 AI discovery

1. The browser sends the recent conversation and current search context to `POST /api/concierge`.
2. The server validates message size, history length, and request rate.
3. Gemini receives a system instruction and a limited set of read-only tools.
4. When needed, the model calls a tool such as `searchVehicles`, `getVehicleDetails`, `compareVehicles`, or `getVehicleOptions`.
5. Tool implementations call the same server-side services used by the normal UI.
6. Results are returned to the model as grounded facts.
7. The UI renders the response and structured vehicle cards using IDs returned by the tools.

The AI must not get direct database credentials or write-capable admin tools. Tool arguments and output are validated. If tool results are empty, the AI must say so and offer a useful next step.

### 9.3 Configure a vehicle

1. Customer opens the Design Studio for a vehicle.
2. Server loads only options enabled for that vehicle.
3. Customer changes one or more options manually or asks the AI to apply a supported style.
4. The server validates every selected option against the vehicle's option records.
5. The preview resolver selects an exact mapped asset where available, otherwise a safe fallback.
6. Customer reviews the option summary and saves the build.
7. A build ID can be included in an enquiry.

### 9.4 Enquiry

1. Customer opens an enquiry form from a vehicle or saved build.
2. Customer reviews the vehicle/build summary and submits name, email, phone, and message.
3. Server validates and normalises the fields, applies rate limiting, and stores the enquiry.
4. Customer sees a reference number and acknowledgement.
5. Admin sees the enquiry in the protected dashboard and updates its status.

### 9.5 Test-drive request

1. Customer selects a vehicle and preferred date/time.
2. Server validates the request and stores it with REQUESTED status.
3. Customer sees that the dealership will confirm the appointment.
4. Admin accepts or declines the request.
5. The UI reflects the actual stored status; do not imply live slot availability unless a real scheduling system is implemented.

### 9.6 Admin vehicle management

1. Admin signs in.
2. Server validates the session and admin role on every protected route and mutation.
3. Admin creates or edits vehicle information and its supported option groups.
4. Server validates input and persists through Prisma.
5. Publish/status changes are audited.
6. Public catalogue endpoints expose only fields suitable for customers.

## 10. API contract

All request bodies and query parameters are validated with Zod. Return predictable JSON error shapes and appropriate HTTP status codes.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/vehicles` | Public | Search and paginate published inventory |
| GET | `/api/vehicles/:id` | Public | Retrieve public vehicle detail |
| POST | `/api/concierge` | Public, rate-limited | AI response and read-only tool calling |
| POST | `/api/builds` | Public, rate-limited | Validate and save a vehicle configuration |
| GET | `/api/builds/:publicId` | Public | Reopen a saved build |
| POST | `/api/enquiries` | Public, rate-limited | Submit customer enquiry |
| POST | `/api/test-drives` | Public, rate-limited | Submit a test-drive request |
| POST | `/api/admin/vehicles` | Admin | Create a vehicle |
| PATCH | `/api/admin/vehicles/:id` | Admin | Update a vehicle |
| DELETE | `/api/admin/vehicles/:id` | Admin | Archive a vehicle safely |
| PATCH | `/api/admin/enquiries/:id` | Admin | Update enquiry status |
| PATCH | `/api/admin/test-drives/:id` | Admin | Accept, decline, or complete a request |

A future implementation can split these route handlers into a separate service without changing the public contract.

## 11. AI behaviour and safety contract

### System role

The AI is Ritewheel's car-shopping concierge. It helps customers discover and understand vehicles in the Ritewheel catalogue. It is friendly, concise, transparent, and commercially helpful without making unsupported claims.

### Read-only tools

- `searchVehicles(criteria)`: search published, available inventory using validated filters.
- `getVehicleDetails(vehicleId)`: return stored public specifications for one vehicle.
- `compareVehicles(vehicleIds)`: return comparable fields for two or three vehicles.
- `getVehicleOptions(vehicleId)`: return valid Design Studio options and their preview mappings.

### Tool restrictions

- Tools use server-side application services and Prisma queries.
- Search results are limited and paginated.
- User-provided IDs are checked against actual records.
- The AI cannot create, update, publish, delete, reserve, or sell inventory.
- The AI cannot submit customer enquiries or test-drive requests.
- The UI handles explicit customer confirmation and submits those forms separately.
- AI output is untrusted: validate structured output, render text safely, and never use model output as SQL or HTML.

### Grounding and conversation quality

- Use only facts returned by tools or explicitly labelled product guidance.
- Mention when mileage, history, price, or an option has not been supplied.
- Do not make mechanical, safety, warranty, legal, or financing guarantees.
- Do not invent stock, exact delivery dates, or appointment availability.
- Ask a follow-up only when it materially improves recommendations.
- Explain why each recommended vehicle matches the customer's stated priorities.
- If no vehicle matches, explain which constraint is preventing a match and suggest a customer-approved broader search.
- Keep AI prompts free of customer contact details and other unnecessary personal data.

## 12. Authentication, security, and privacy

- Admin authentication uses a server-verified session and hashed passwords.
- Protect admin pages and, independently, every admin API handler.
- Use Zod validation for every public and admin write endpoint.
- Add rate limits to login, AI, enquiry, test-drive, and build creation endpoints.
- Apply server-side allowlists for sort fields, filter values, and image URL protocols/hosts.
- Use parameterised Prisma queries; never construct SQL from AI output or raw user strings.
- Keep `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and the Gemini key server-only.
- Do not commit secrets, real customer records, or production database snapshots.
- Avoid logging phone numbers, emails, message bodies, API keys, or authentication tokens.
- Add safe error responses; detailed stack traces belong in server logs only.
- Use CSRF-aware Auth.js patterns, secure cookies, and HTTPS in production.
- Provide a honeypot or equivalent spam control for public forms.
- Use a persistent/shared rate-limit mechanism suitable for serverless instances; do not rely on process memory as the only production control.

## 13. Reliability and performance

- Use server components for data-heavy public pages where practical.
- Use client components only for interactive filters, chat, compare, and configurator state.
- Paginate inventory at the database layer.
- Add indexes for status, publishedAt, make, bodyType, year, price, and common filter combinations as needed.
- Optimise vehicle imagery and provide responsive sizes and meaningful alt text.
- Cache public catalogue reads carefully and invalidate relevant paths after admin updates.
- Set AI request timeouts and bounded conversation history.
- Return a useful fallback if the AI provider is unavailable.
- Keep forms usable on mobile and provide loading, empty, success, and error states.
- Honour reduced-motion preferences and basic WCAG contrast/focus expectations.

## 14. Environment configuration

The actual values must be created in local environment files or the hosting provider's environment settings. Never commit real values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection for runtime |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection for migrations, if required by provider |
| `AUTH_SECRET` | Yes | Auth.js signing/encryption secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For AI | Server-side Gemini API key |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical public application URL |
| `ADMIN_EMAIL` | Initial seed only | Initial administrator identity |
| `ADMIN_PASSWORD` | Initial seed only | Used by the seed/bootstrap process to hash the initial admin password; do not expose or commit it |

If the AI key is not configured, the main marketplace must remain operational and the concierge must display a clear disabled state.

## 15. Testing strategy and release gates

### Automated checks

- TypeScript type checking.
- Linting and production build.
- Unit tests for vehicle filters, matching, option validation, preview resolution, and status transitions.
- API tests for invalid payloads, unknown vehicle IDs, unauthorised admin mutations, and enquiry submission.
- AI tool tests using deterministic mocked tool results; tests must not require paid model calls.
- End-to-end tests for browse → vehicle detail → configure → save → enquiry.
- End-to-end tests for admin login → create/edit/publish vehicle → view enquiry.

### Manual release checklist

- Public homepage and inventory load without authentication.
- Public vehicle details show accurate seeded data.
- Filters and pagination work together.
- AI only recommends vehicles returned by inventory tools.
- Configurator only allows valid vehicle options.
- Unmapped image combinations are clearly represented as an option summary/fallback.
- Enquiry and test-drive requests are persisted and visible to admin.
- Unauthenticated users cannot access admin data or mutate inventory.
- No secret is exposed in browser bundles or Git history.
- Production deployment is publicly accessible and the live URL is tested on desktop and mobile.

## 16. Deployment approach

1. Consolidate the existing repository into one canonical Next.js application after reviewing its legacy root page, nested starter directory, and image assets.
2. Provision a managed PostgreSQL database.
3. Configure environment variables in Vercel.
4. Run Prisma migrations and the seed script.
5. Create the first admin account through the controlled seed/bootstrap process.
6. Deploy a preview and run the release checks.
7. Disable production SSO/deployment protection for the intended public portfolio site only after confirming the correct project and deployment.
8. Promote the verified build to production.
9. Verify public access, key customer flows, and admin protection.

## 17. Delivery phases

### Phase 1 — Public marketplace foundation
- Repository consolidation and design system.
- Homepage, inventory, filters, vehicle details, and comparison.
- PostgreSQL schema, Prisma migrations, seed inventory, and public API.
- Enquiry and test-drive request workflows.
- Admin authentication and inventory/enquiry dashboard.
- Public deployment.

### Phase 2 — AI Concierge
- Gemini integration through the AI SDK.
- Read-only inventory search, detail, and comparison tools.
- Conversational preference collection and grounded recommendations.
- AI failure fallback and request limits.

### Phase 3 — Design Studio
- Vehicle-specific option groups.
- Curated preview assets and fallback resolver.
- Manual configuration controls.
- AI-to-option mapping and saved builds.
- Enquiry flow linked to a saved build.

The first release should prioritise a finished customer journey over a long list of partially implemented features.

## 18. Key architecture decisions

| Decision | Reason |
| --- | --- |
| PostgreSQL + Prisma | Demonstrates relational modelling, migrations, queries, and backend ownership |
| Next.js route handlers and service layer | Keeps deployment simple while retaining clear backend boundaries |
| Gemini via AI SDK | Avoids dependency on an OpenAI key and keeps the model provider replaceable |
| AI tools are read-only | Prevents the model from directly changing business records |
| Asset-backed configurator | Delivers a convincing interactive V1 without a 3D/generative pipeline |
| Guest shopping and enquiries | Reduces friction and keeps authentication scope small |
| Admin-only authentication | Protects operational workflows without blocking catalogue discovery |
| Single dealership | Keeps data modelling and admin workflows focused for the first release |

---

**Implementation rule:** When code and this document disagree, update the document or code deliberately through review. Do not silently expand V1 scope.

---

## 19. Detailed visual experience specification (v1.1)

The companion screen-by-screen visual specification lives in [docs/VISUAL_BLUEPRINT.md](./docs/VISUAL_BLUEPRINT.md). It is part of the implementation contract, not a decorative reference.

The visual specification defines:
- Global public navigation, footer, typography, colour tokens, image treatment, spacing, and responsive behaviour.
- Homepage, inventory, vehicle detail, AI Concierge, Design Studio, and admin screen layouts.
- Vehicle card contents, filters, recommendation cards, configurator controls, admin navigation, and reusable components.
- Loading, empty, error, disabled-AI, unavailable vehicle, form-validation, and success states.
- The customer journey from discovery to vehicle/build enquiry.
- Currency, mock data, and factual-content rules.

### 19.1 Canonical public routes

The canonical public routes are:
- `/` — homepage.
- `/inventory` — searchable and filterable catalogue.
- `/vehicles/[slug]` — vehicle detail.
- `/compare` — compare up to three vehicles.
- `/concierge` — dedicated AI Car Concierge.
- `/studio/[slug]` — vehicle-specific Design Studio.
- `/about` and `/contact` — dealership information and contact.

The previous structure mentioned a Design Studio but did not specify a dedicated Concierge route or About/Contact screens. These are now explicit. The header navigation should expose Home, Inventory, AI Concierge, Design Studio, and About, with Contact in the footer and relevant calls to action.

### 19.2 Interaction-state requirements

Every primary screen must be designed for its full state lifecycle:
- Initial/loading state.
- Normal populated state.
- Empty/no-results state.
- Request failure and retry state.
- Disabled AI/provider-unavailable state, without disabling ordinary marketplace use.
- Validation failure and successful submission state.
- Unavailable/reserved/sold vehicle state where applicable.
- Authenticated and unauthenticated admin states.

### 19.3 Lightweight customer preferences

V1 favourites and compare selections may be stored locally in the browser; they do not require customer accounts or new database entities. Compare is capped at three vehicles. These local selections must be cleared or reconciled if a vehicle is no longer publicly available.

Concierge conversation history is session-scoped in V1. Do not persist customer identity or contact information in AI conversation records.

### 19.4 Demonstration data and visual concepts

The generated six-screen design concept is illustrative only. Values such as vehicle counts, customer counts, revenue, growth percentages, prices, availability badges, and sample vehicle details must never become hardcoded production claims. The live UI must source these values from the database or clearly label them as demo data.

### 19.5 Design review gate

Before application implementation, review the six-screen concept and `docs/VISUAL_BLUEPRINT.md`. Changes to the approved layout, navigation, colours, or core interactions should be reflected in both the visual blueprint and this architecture before coding proceeds.

## 20. Updated delivery gates

### Gate 0 — Product and visual approval
- Confirm the six-screen visual blueprint and global design system.
- Confirm public routes and customer journey.
- Confirm the single-dealership V1 scope, currency rules, and demo-data policy.
- Confirm the Design Studio preview-asset limitations.

### Gate 1 — Technical foundation
- Consolidate the legacy root app and nested starter into one canonical Next.js app.
- Preserve useful assets and inspect existing dependencies/configuration before replacing files.
- Provision PostgreSQL, Prisma schema/migrations, and deterministic demo seed.
- Implement Auth.js admin session and protected admin routes.

### Gate 2 — Customer marketplace
- Implement homepage, inventory, vehicle detail, compare, About, and Contact.
- Implement enquiries and test-drive request persistence.
- Implement admin inventory, enquiry, and test-drive workflows.
- Deploy and verify the public marketplace.

### Gate 3 — AI Concierge
- Add Gemini via the provider adapter and Vercel AI SDK.
- Expose read-only, validated inventory tools.
- Build the dedicated Concierge screen and recommendation UI.
- Verify grounded results and the no-provider fallback.

### Gate 4 — Design Studio
- Add vehicle-specific option groups and curated preview assets.
- Build the interactive configurator and option summary.
- Add validated AI-to-option proposals and saved builds.
- Link saved builds to enquiries.

The release is complete only when the relevant gate's acceptance checks pass; a page existing in the UI is not proof that its workflow works.


## 21. Performance-first design and engineering requirements

Performance is a product requirement, not a post-launch task. Ritewheel must preserve its premium visual quality on mid-range phones, modest laptops, and constrained mobile connections.

### 21.1 Experience targets

Use the "good" Core Web Vitals thresholds as the production target, assessed at the 75th percentile and segmented by mobile and desktop when field data is available:

| Metric | Target | What it protects |
| --- | ---: | --- |
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds | Perceived loading speed |
| Interaction to Next Paint (INP) | ≤ 200 milliseconds | Responsiveness to taps, clicks, and typing |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | Visual stability |

These are targets to measure, not guaranteed outcomes. Before sufficient field traffic exists, use Lighthouse/PageSpeed Insights and Chrome DevTools under mobile CPU/network throttling as lab checks. Add Vercel Speed Insights after deployment for ongoing real-user monitoring.

### 21.2 Image strategy

- Use Next.js `next/image` for vehicle and hero images, with explicit dimensions or aspect ratios and accurate `sizes` values.
- Use AVIF/WebP output through the image pipeline where supported.
- Set a fixed image frame before the image loads to prevent layout shifts.
- Preload or give high fetch priority only to the actual above-the-fold LCP hero image. Never preload every hero or gallery image.
- Lazy-load below-the-fold images and gallery images that are not initially visible.
- Inventory cards request correctly sized thumbnails, not full-resolution detail-gallery images.
- Use responsive variants or a mobile crop when a desktop image would be unnecessarily large or badly framed on a phone.
- Prefer one strong static hero image. No autoplay video backgrounds in V1.
- Serve curated images from optimised public assets or an image CDN; avoid arbitrary hotlinked URLs.
- Provide a fallback and reserve space when an image fails or has not loaded.

Initial image budgets are targets to validate visually and with measurements, not hard limits that justify blurry photography:
- Hero image: aim for approximately 300 KB or less on desktop and 180 KB or less for a mobile-specific crop.
- Vehicle card image: aim for approximately 100–140 KB or less at its rendered size.
- Detail gallery: load the lead image first; load remaining full-size images on demand.

### 21.3 JavaScript and rendering strategy

- Keep public pages as React Server Components by default.
- Introduce Client Components only for interactive areas: filters, compare tray, favourites, chat composer, configurator controls, and admin forms.
- Do not put the entire page tree behind a top-level `"use client"` directive.
- Split route-specific functionality so inventory, Concierge, Design Studio, and admin code do not all load on the homepage.
- Dynamically load expensive or rarely used interfaces, such as chat workspace, image lightbox, and optional admin charts.
- Keep shared client state small and local to the feature that needs it.
- Prefer native HTML controls and small reusable components over large dependencies that add no meaningful value.
- CSS transitions are the default for simple hover, selected, and disclosure states. Any animation library must justify its bundle and runtime cost and be isolated to the screens that need it.
- Avoid repeated state updates during scroll and resize.
- Avoid client-side fetching where a server-rendered page or route handler can provide data with less JavaScript.

### 21.4 Motion and visual-effects policy

Allowed by default:
- Short transitions on opacity and transform.
- Small card lift or image-scale changes on hover for devices that support hover.
- Simple menu and drawer transitions.
- Static skeleton/placeholder states without a continuous shimmer requirement.
- Gentle, once-per-view section entrances that do not delay content.

Avoid in V1:
- Autoplay video, animated video backgrounds, and large looping GIFs.
- 3D rendering, WebGL, canvas particles, or complex real-time vehicle rendering.
- Continuous parallax, scroll-jacking, and large animated gradients.
- Heavy blur filters across large areas or multiple stacked glass panels.
- Continuous animation of layout properties such as width, height, top, or left.
- Excessive simultaneous entrance animations.
- Motion that hides content until animation finishes.

Use transforms and opacity for motion where possible. Respect `prefers-reduced-motion`; important information and actions must never depend on animation.

### 21.5 Premium appearance without heavy rendering

- Create luxury through image quality, dark tonal separation, spacing, typography, and composition.
- Use solid or mostly opaque charcoal panels for vehicle finder and AI surfaces. Restrained translucency is permitted, but do not rely on large-area backdrop blur.
- Keep shadows soft and limited; avoid stacked shadows and glowing borders.
- Use static CSS gradients as text-contrast overlays over hero photography.
- Use SVG icons for small interface symbols.
- Use a consistent image crop and object position for vehicle cards.
- Curate a small set of high-quality preview assets for the first Design Studio showcase vehicle rather than shipping dozens of large variants immediately.

### 21.6 Data and backend efficiency

- Inventory queries return only fields needed for the current view.
- Paginate in PostgreSQL; default to 12 vehicles per inventory page, with a validated maximum page size.
- Apply filters and sorting on the server. Keep URL search parameters shareable and restorable.
- Debounce free-text search (approximately 250–350 ms) and cancel or ignore stale responses when a newer query supersedes them.
- Add database indexes for real query patterns, including public status, make, body type, year, price, and commonly combined filters. Confirm with query plans instead of adding every possible index blindly.
- Avoid N+1 query patterns and fetch only relations needed for the screen.
- Cache public vehicle data where safe and invalidate affected data after admin changes.
- Do not poll the database or AI service where the page does not need updates.
- Limit recommendation results and response payload sizes.

### 21.7 AI performance and cost controls

- Do not load the AI chat UI, model SDK, or conversation logic on the homepage before the customer uses the Concierge.
- Make model calls only after explicit customer action, never on each keystroke or page render.
- Stream assistant responses so customers receive feedback while generation continues.
- Bound message history, request size, output length, tool-call count, and recommendation count.
- Use server-side timeouts, rate limits, and clear provider-unavailable states.
- AI inventory tools return small structured records and reuse the same indexed search services as ordinary inventory.
- Do not send vehicle images to a vision model or generate custom images in V1.
- Never place the Gemini API key in the browser bundle.

### 21.8 Design Studio performance

- V1 uses curated image assets and option mapping only; no 3D engine or canvas rendering.
- Load the base vehicle image first, then load a selected preview asset when the customer changes an option.
- Preload only the small set of likely first-view options for the showcase vehicle. Other variants load on demand.
- Avoid composing many huge transparent layers in the browser.
- Keep the option summary visible while a preview image is loading.
- If an exact combined preview is unavailable, use the approved fallback without blocking the interaction.

### 21.9 Font strategy

- Use the chosen Manrope/Inter pairing through `next/font` or local font files so runtime page views do not need separate third-party font requests.
- Load only the Latin subset required for V1.
- Prefer variable font files or a minimal set of weights; avoid downloading many near-identical font weights.
- Set sensible fallback fonts and preserve layout to reduce font-related shifts.

### 21.10 Monitoring and regression checks

For every major route, check:
- Mobile and desktop Lighthouse performance.
- LCP, INP, and CLS where field data exists.
- Initial JavaScript bundle and largest route-specific chunks.
- Hero and card image transfer sizes.
- Layout stability while fonts and images load.
- Search, filter, chat, and configurator interaction responsiveness.
- Performance on a mid-range Android profile and throttled mobile network.

A visually richer change must not be merged if it introduces avoidable regressions to these checks. Record before/after results for material changes.