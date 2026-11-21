# Ritewheel Autos — Project Status & Continuity Handoff

**Last updated:** 21 November 2026  
**Repository:** [emaklr/ritewheel-autos](https://github.com/emaklr/ritewheel-autos)  
**Production:** https://ritewheel-autos.vercel.app  
**Current main commit:** `76f6c58ac9a4da91b345506d66f6ff1aa3bafa8e`  
**Purpose:** This is the working execution/status record for the next development session. The approved product and payments documents remain the detailed specifications. Update this file whenever a milestone, decision, scope or blocker changes.

---

## 1. Product direction and working agreements

Ritewheel Autos is an AI-assisted automotive discovery and dealership platform. It is not a generic shopping cart. It helps visitors discover cars, understand choices, shortlist vehicles, contact the dealership, request vehicles that are not listed and ultimately buy through a verified dealership process.

### Working agreements

- **Reuse before reinventing:** before building a component or workflow, look for a maintained public project or library that already solves the problem. Check its fit, licence, dependency compatibility, security and asset licences. Reuse the smallest useful part; do not copy a whole app blindly.
- **One step at a time:** agree the scope, implement one focused change, open one focused PR, wait for CI and Preview, have the user review/merge, then verify Production. Avoid giant multi-feature PRs.
- **GitHub-first workflow:** edit the connected GitHub repository directly. Do not ask the user to paste code into VS Code or PowerShell for ordinary implementation work.
- **Preserve user control:** do not merge PRs or change Production environment variables without the user's explicit instruction. Preview deployments are automatic from feature branches; Production deploys from merged `main`.
- **Keep the releases distinct:** don't silently pull Release 2/3 work into Release 1.
- **No invented commercial facts:** don't describe a demo record as live stock, a sample price as an offer, a sourcing request as a guaranteed supply, or an AI recommendation as a quote.
- **Challenge scope creep:** keep the immediate task tied to the agreed release and customer journey.

### Current product decisions

1. **Design Studio is deferred.** It is intended as a customer-retention/engagement feature, not a blocker for completing the purchase journey. The current `/studio` page is a Coming Soon screen. Leave it parked until the sales journey is complete and the user prioritises it again.
2. **Universal GSM Arena-style car comparison is deferred.** The current page compares up to three Ritewheel inventory listings. The requested future experience compares any make/model/trim regardless of stock. Paid vehicle-data APIs were outside the user's current budget. Do not resume paid API research or the experimental comparison branch unless asked.
3. **Demo vehicles are allowed in AI and discovery.** They must remain clearly labelled illustrative, with illustrative prices distinguished from actual offers. A customer may ask Ritewheel to source a demo vehicle. Do not automatically remove demo records from AI search or treat this as a showstopper.
4. **The customer must have a clear purchase path.** Add a customer-facing `Start purchase` action for a real available Ritewheel listing in the Release 1 sales-journey closeout. This captures purchase intent; it does not create a quote, reserve the vehicle or collect money.
5. **Release 3 payment choice:** for a verified quote, the customer should be able to choose among the payment options the dealership has enabled for that offer, ideally full payment or a deposit with the balance due later. The server-side quote controls the permitted choices and exact amounts. Do not force deposits globally and do not expose arbitrary client-entered amounts.
6. **No generic cart.** My Garage is for discovery and saved items, not a cart or promise of availability.

---

## 2. Current technical and Production state

### Application

- Next.js application, TypeScript, React, PostgreSQL, Prisma and Vercel.
- GitHub repository: [emaklr/ritewheel-autos](https://github.com/emaklr/ritewheel-autos).
- Production URL: https://ritewheel-autos.vercel.app.
- Main commit at this handoff: `76f6c58ac9a4da91b345506d66f6ff1aa3bafa8e`.
- Latest Production Vercel deployment observed: `dpl_6CVJ7Ung5kEuXE7Jt7i9E1xtg8db`, status READY, deployed from the merge of PR #26.
- Homepage returned HTTP 200 and its HTML contained the floating Talk to AI launcher.
- Do not treat a successful build or page response as proof that every end-to-end flow has been tested.

### Concierge

- PR #21 introduced the grounded AI Concierge.
- PR #22 moved it to NVIDIA NIM / Nemotron.
- PR #23 added NVIDIA → OpenRouter → Groq provider fallback.
- PR #24 adjusted Nemotron reasoning/fallback behaviour.
- PR #25 fixed request validation for the AI SDK's default chat transport. The route had rejected transport metadata before reaching a provider.
- The user manually confirmed a successful normal chat response and a successful vehicle inventory search using the Concierge.
- Production environment has the secret keys `NVIDIA_API_KEY`, `OPENROUTER_API_KEY` and `GROQ_API_KEY`. Never reveal or request these secrets in chat.
- The user has not independently verified every provider. Do not claim all three work just because their keys are present.
- Demo inventory results are displayed separately and labelled as illustrative. This is intentional.

### Floating Talk to AI

- PR #26, [Add a floating Talk to AI launcher](https://github.com/emaklr/ritewheel-autos/pull/26), was merged on 21 November 2026.
- It adds a fixed accessible launcher to public pages that use the shared site header. Clicking it navigates to the existing full `/concierge` page.
- It is hidden on the Concierge page itself. It does not create a second chat runtime or a second conversation.
- CI passed, Vercel Preview was READY, and the merged commit is in Production.
- Design decision: use a floating entry point that navigates to the full Concierge, not a separate mini-chat overlay. The full Concierge has a conversation plus a vehicle-match workspace, preferences and human handover; duplicating the chat surface would split state and increase maintenance.

### Dealership settings migration

- The Prisma migration `20261118171500_dealership_settings` was present in GitHub but absent from both Neon Development and Production.
- It was applied to both Neon branches on 20 November 2026.
- Verification confirmed the `DealershipSetting` table and all 12 expected columns exist in both branches, and the migration is recorded in each `_prisma_migrations` table with one applied step.
- No existing vehicle/customer/admin records were changed. The new table had zero settings rows at verification time; application defaults are used until dealership settings are saved in Admin.
- The previous missing-table diagnosis is resolved at the schema level. Recheck logs if the error is reported again.

### Outstanding experimental branch

- `feat/compare-matrix-reuse-first` contains an unmerged prototype from an earlier attempt. It is not the approved universal comparison implementation and must not be merged or used as the base for current work.
- Universal make/model comparison remains deferred pending a suitable affordable/licensed vehicle specification data source.

---

## 3. Release scope and status

### Release 1 — Public discovery, lead capture and pre-purchase intent

**Original purpose:** a guest can discover a vehicle, understand it, use AI, save/compare items, submit a request, and the dealership can review those requests in a protected workspace. No customer account is required and no online payment is processed in this release.

| Capability | Current status | Notes / remaining verification |
|---|---|---|
| Homepage and public navigation | Implemented | Homepage has inventory finder, categories, featured vehicles and Concierge entry points. |
| Inventory search/filter/sort/pagination | Implemented | Verify with genuine dealership stock before public launch. |
| Vehicle detail pages and image gallery | Implemented | Current CTA is enquiry and test-drive; no dedicated Start purchase action yet. |
| PostgreSQL/Prisma vehicle catalogue | Implemented | Production and Development schemas are in use. |
| Admin login and inventory management | Implemented | Protected single-admin workspace; verify publish/status lifecycle. |
| Enquiry intake and Admin queue | Implemented | Verify form submission and full Admin review/update flow. |
| Test-drive requests and Admin appointment handling | Implemented | Verify request and accepted/declined states. |
| Sourcing request intake and Admin queue | Implemented | Demo/unlisted models can lead to a sourcing request; sourcing is not a guarantee. |
| Dealership public settings | Implemented | Migration now applied; configure actual contact details in Admin and verify public display. |
| AI Concierge and grounded inventory lookup | Implemented and user-tested | User confirmed normal chat and a vehicle search. Continue regression testing. |
| Floating Talk to AI launcher | Implemented and merged | PR #26 is in Production. User should visually verify desktop and mobile. |
| Guest My Garage / local favourites | Implemented in Release 1 design/code | Verify save/remove/refresh/browser behaviour and clearly communicate local-only persistence. |
| Compare up to three current Ritewheel listings | Implemented in current scope | Not the universal any-car comparison the user ultimately wants; that larger scope is paused. |
| Direct purchase-intent entry point | **Not implemented — next Release 1 priority** | Add `Start purchase` for a real, published, genuinely available Ritewheel listing. It creates a purchase-intent lead/request, not a payment. |
| Design Studio | **Deferred by user** | It remains a retention/engagement feature. Current page is Coming Soon. Do not hold sales journey completion for it. |
| Universal make/model/trim comparison | **Deferred by user** | Data APIs currently exceed budget. |
| Online checkout/payment | **Not in Release 1** | Belongs to Release 3 after quote, reservation and financial controls are ready. |

### Release 1 sales-journey closeout

The remaining functional gap identified by the user is that a person who has decided to buy a genuine available Ritewheel vehicle currently sees Enquire and Request a Test Drive, but no direct purchase-intent action.

Implement a focused `Start purchase` / `I'm interested in buying` path:

1. Show it only when the vehicle is a genuine, published, available Ritewheel listing (not a demo or unverified external reference).
2. Ask for the minimum contact and purchase information needed to follow up; prefill the selected vehicle and the current listed asking price as indicative, not binding.
3. Clearly explain that submitting interest does not reserve the vehicle or lock the price. Ritewheel will verify availability, condition, documents and final costs.
4. Save it as a distinguishable purchase-intent request/lead associated with the vehicle. Prefer a structured request type/source that Admin can recognise, rather than disguising it as an ordinary general enquiry.
5. Make the request visible in the existing protected Admin operations queue. At Release 1 scale, this can be a small purchase-intent filter/section in Enquiries; do not build full CRM prematurely.
6. Give the customer an acknowledgement/reference and tell them what happens next.
7. Demo records should instead offer `Request this vehicle` / `Ask Ritewheel to source it`; do not show `Buy now` as if it were an actual offer.
8. Reserved/sold/unavailable records should show an availability enquiry, not a purchase action.

This closes the **pre-purchase intent** path in Release 1. It does not make the customer pay, accept a quote, reserve a vehicle or become a buyer yet. Those capabilities require Release 3's verified commercial workflow.

### Other Release 1 closeout checks

Before declaring Release 1 ready for broad customer use, complete a test pass for:

- Desktop and mobile public navigation, vehicle pages and floating Concierge launcher.
- Inventory filters, pagination, status labels and empty/error states.
- Demo-vs-real listing labels, illustrative prices and sourcing route.
- Guest favourites/My Garage persistence and Compare add/remove.
- Enquiry, test-drive and sourcing form validation, submission, acknowledgement and Admin processing.
- Admin authentication, authorisation, inventory mutations and audit trail.
- Dealership contact settings and correct public phone/email/WhatsApp details.
- Production database health, storage/image handling, environment configuration and error monitoring.
- Customer-facing terms, privacy notice, cancellation/refund disclosures where relevant, and accurate business contact information.
- No claims that the site offers confirmed stock, inspection, warranties, financing or delivery unless the dealership can substantiate them.

Do not add customer accounts, full CRM, quotes or live payment processing merely to complete Release 1.

---

## 4. Release 2 — Customer accounts, Garage and CRM

Release 2 begins after Release 1's sales-intent journey and its acceptance checks are complete.

### Customer-facing work

1. Customer registration, sign-in, verified email/recovery and sign-out/session controls.
2. Move the guest Garage into an account-backed Garage with consent-based syncing.
3. Synchronise saved vehicles, comparisons, builds (when Studio is resumed), AI recommendations and preferences.
4. Customer history for enquiries, test drives and sourcing requests.
5. Request status, notifications and customer-visible updates.
6. Persistent AI history/preferences only with clear notice and customer controls. Full AI conversations are never shared with staff by default.

### Dealership-facing work

1. Staff accounts and roles (not only one administrator).
2. Leads and customer records, with access control and assignment.
3. Sales activity timeline: calls, email, WhatsApp, meetings, notes and follow-up tasks.
4. Customer-approved AI handover summaries.
5. Operational dashboards based on actual records only.
6. Optional draft quote preparation/review, without taking live payments.

Release 2 should make it easy for customers to continue a relationship and for staff to manage that relationship without relying on spreadsheets or scattered messages.

---

## 5. Release 3 — Verified buying, checkout and ownership journey

Ritewheel should support the customer's choice of payment method while allowing the dealership to control what is actually available on each verified quote.

### Purchase flow

1. Customer selects `Start purchase` from a genuine listing or responds to a sourced vehicle offer.
2. Dealership checks the actual vehicle/unit, condition, mileage, ownership/import documents, availability, price, fees, delivery/collection and terms.
3. Dealership issues a versioned formal quote with line items, total, currency, expiry, payment options, reservation policy and cancellation/refund terms.
4. Customer reviews and accepts that exact quote version.
5. Customer selects an enabled payment option:
   - Full payment.
   - Deposit now, balance later.
   - Another explicitly approved instalment/schedule if the dealership offers it.
   - Approved offline/dealership-assisted payment where supported and audited.
6. If required, create a server-controlled time-limited reservation/hold with concurrency protection. Do not treat opening checkout as a reservation.
7. Create a payment obligation and hosted checkout session. Amount/currency are server authoritative.
8. Verify payment using authenticated provider webhooks and transaction lookup. Browser redirects alone never establish success.
9. Provide receipt and purchase status after verified payment.
10. Track inspection, documentation, registration, delivery/collection and handover.
11. Support cancellation/refund, partial refunds, disputes and reconciliation with proper audit records.

### Commercial rules

- Do not force deposits globally. Offer full payment and/or deposit only where the dealership has enabled those choices for that quote.
- A deposit is not the same as a completed purchase.
- A reservation is not a sale.
- Do not collect payment for partner inventory unless Ritewheel has the appropriate agreement and authorised commercial role.
- A sourced/demo model cannot be quoted or paid for until a specific supply offer, unit/condition, price and availability have been verified.
- Never trust client-supplied price, deposit, currency or payment status.
- Use a provider-independent payment adapter and select a provider only after assessing Nigerian business onboarding, currencies, payment methods, fees, settlement, webhooks, refunds, disputes and compliance.
- Keep raw card data out of Ritewheel systems; use hosted checkout/approved provider components.

See [PAYMENTS_AND_TRANSACTIONS.md](./PAYMENTS_AND_TRANSACTIONS.md) for the detailed planned domain model and safety invariants.

---

## 6. Deferred capabilities — do not start without renewed approval

| Capability | Reason for pause | Resume when |
|---|---|---|
| Universal comparison for any car model | Appropriate structured data API/licensing currently exceeds budget | Affordable licensed reference data or another approved data plan is found |
| AI image Design Studio / broad visual customisation | Customer-retention feature, not current sales-journey blocker | User reprioritises after buying flow or sets a separate retention milestone |
| Real-time 3D configurator | Requires per-model licensed 3D assets and mappings | Selected models/assets and commercial rights are available |
| External seller/affiliate integrations | Requires actual agreements, offer feeds and commercial model | Partner terms, data freshness and referral/checkout responsibilities are agreed |
| Financing | Requires regulated/qualified finance partners and clear disclosures | Suitable provider/partner and compliance process are approved |

---

## 7. Immediate next steps

Do these in order; do not skip ahead.

1. **Record and visually verify PR #26 in Production** on desktop and mobile. Its code is merged and deployed, but visual confirmation from the user is still useful.
2. **Close the Release 1 purchase-intent gap:** agree the minimal form and admin handling, then implement `Start purchase` as a distinct purchase-intent lead for real available Ritewheel listings. Demo/unavailable records route to sourcing or availability enquiry.
3. **Run the Release 1 end-to-end acceptance checklist** in Section 3, including public pages, AI, all lead forms and Admin queues.
4. **Freeze Release 1** once the purchase-intent path and QA pass are complete. Explicitly mark Design Studio and universal comparison as deferred, not as silently completed.
5. **Plan Release 2 in small PRs**, starting with customer identity and secure account-scoped Garage architecture before adding CRM features.

No Release 2 customer-account implementation or Release 3 payment/checkout implementation has been started as part of this status snapshot.

---

## 8. GitHub workflow and continuity instructions

- Start new work from the current `main` branch, not from old feature branches.
- Before editing, inspect the exact current code and relevant docs.
- Create one feature branch per focused change.
- Group related file changes into one commit and one PR.
- Let GitHub Actions run the repository checks (Prisma validation/generation/migrations, seed, TypeScript, ESLint and Next.js build).
- Verify the Vercel Preview before merge.
- The user reviews and merges PRs unless they explicitly asks otherwise.
- After merge, verify the Production deployment and the real customer flow.
- Do not create repeated commits/deployments for tiny changes; batch a focused task.
- Do not decrypt, display or copy API credentials into chat.
- Do not use the experimental `feat/compare-matrix-reuse-first` branch as a base.
- Ask one direct question only when a genuine product/security decision blocks the next task. Otherwise make the smallest safe, documented assumption.

### Next-chat handoff prompt

When continuing in a new ChatGPT chat, the user can say:

> Continue Ritewheel Autos from `docs/PROJECT_STATUS.md` in the GitHub repository `emaklr/ritewheel-autos`. Read that file and the linked product/payment specs before doing anything. Preserve the release boundaries and working agreements. We are closing Release 1's purchase-intent gap, then doing Release 1 QA, then planning Release 2. Do not restart the project or work on deferred Design Studio/universal comparison unless I reprioritise them.

**Update this file after every meaningful milestone or scope decision.** It is the working continuity record; `PRODUCT_EXPERIENCE.md` remains the approved product specification and `PAYMENTS_AND_TRANSACTIONS.md` remains the payment architecture specification.
