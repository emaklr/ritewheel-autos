# Ritewheel Autos — Product Experience

**Version:** 1.0  
**Status:** Approved product direction; phased implementation  
**Date:** 15 November 2026  
**Related:** [Architecture](../ARCHITECTURE.md) · [Visual Blueprint](./VISUAL_BLUEPRINT.md) · [Payments](./PAYMENTS_AND_TRANSACTIONS.md)

## 1. Product vision

Ritewheel Autos is an AI-assisted automotive discovery and dealership platform. It helps customers discover vehicles, understand their options, compare alternatives, personalise supported appearance choices, save their shortlist, request vehicles that are not currently listed, and work with a real dealership representative to progress towards a purchase.

Ritewheel is more than a catalogue, but it is not a generic ecommerce checkout. Vehicle purchases require confirmation of availability, condition, price, inspection, quotation, payment terms, documentation and handover. The product must support those steps honestly.

**Product promise: Discover confidently. Personalise thoughtfully. Get help from real people when it matters.**

## 2. Product principles

1. **Guest-first discovery:** browse, search, compare, use AI, start a build and submit enquiries without registration.
2. **My Garage, not a cart:** organise saved vehicles, builds, recommendations and requests. A saved car is not a promise of stock, a reservation or a purchase.
3. **Inventory truth:** a Ritewheel listing is a real dealership-managed record. Suggestions outside stock are clearly distinguished.
4. **AI assists; people and systems decide:** AI searches, explains, compares and prepares summaries. It does not invent stock, approve quotes, confirm appointments, reserve vehicles, accept payments or change dealership records.
5. **Human contact remains available:** callback, quotation, test-drive, sourcing and configured phone/WhatsApp contact paths.
6. **Consent-based persistence:** guest activity is browser/session-scoped; synchronised history requires an account and appropriate customer consent.
7. **Progressive complexity:** marketplace first, accounts/CRM second, verified purchasing/payment third.
8. **Performance is part of luxury:** AI, account, Studio and payment code must not burden unrelated public pages.

## 3. User types

### Guest visitor
Can browse, search, filter, sort, paginate, compare up to three listings, use AI in the current session, save favourites locally, create a local/shareable build, and submit enquiries, callback, test-drive or sourcing requests by providing contact details. Guest items are not automatically available on another device.

### Registered customer (Release 2)
Can do everything a guest can, plus sync saved vehicles, builds, saved AI recommendations, preferences, comparisons and request history across devices. Can see enquiry, sourcing and test-drive status and, in Release 3, view/accept quotes and pay approved obligations.

### Sales representative (Release 2)
Can view assigned leads, customer-approved handover summaries, relevant saved vehicles/builds, record calls/messages/meetings and private notes, set follow-up dates, update workflow states, and request approval for a quotation or appointment. Access is role- and assignment-controlled.

### Inventory/operations administrator
Manages vehicle records, images, specifications, prices, publication, availability, supported Design Studio options and relevant sourcing operations. Important changes are audited.

### Owner/administrator
Manages staff access, business settings, assignments, reporting and later quotation/payment policies. V1 may use one admin role; fine-grained roles arrive with CRM.

## 4. First visit and public discovery

### Homepage
The customer sees the approved cinematic homepage, vehicle finder, featured published listings, categories based on current inventory, and clear entry points to Inventory, AI Concierge and Design Studio. No sign-in wall, fabricated customer totals, fake reviews or unverified stock/certification claims.

### Inventory
Customers search make/model/trim/keyword, filter, sort and paginate database results, open vehicle details, save favourites locally, compare up to three vehicles and open AI only when requested. The catalogue has no permanent AI chat column.

### Vehicle details
Show actual listing name, year, trim, condition, status, price/currency or "Price on request", gallery, supplied specifications and features. Offer enquiry, test-drive, save, compare and Design Studio where configured. Omit unknown fields or label them "Not provided". Similar vehicles must be actual published records.

## 5. Discovery paths and AI recommendations

Customers can discover vehicles through conventional search or the AI Concierge.

The AI progressively collects:
- Budget and currency.
- Make/model preference.
- Body type and seating.
- Intended use (family, commute, business, long-distance, performance).
- Fuel and transmission.
- Year and mileage.
- Exterior/interior preference.
- Required features.
- Must-have constraints versus flexible preferences.

It should distinguish hard constraints from preferences and ask only relevant follow-up questions.

### Three distinct recommendation types

1. **Available Ritewheel listings:** real published inventory records with current database status.
2. **Similar Ritewheel alternatives:** different actual listings that may satisfy the customer, with reasons and trade-offs.
3. **Not currently listed:** general model suggestions or external references. These are not stock offers, have no invented local price or availability, and cannot be booked as Ritewheel inventory.

For an unlisted model, AI may suggest a model to explore. Claims about current market price, exact specification, local seller or current availability require verified external sources. Without such sources, it must say the information is unverified.

### When no exact match exists
Offer the customer:
- Relax a flexible preference and search actual similar stock.
- Explore clearly labelled vehicle/model suggestions outside the catalogue.
- Submit a sourcing request so the dealership can investigate.

A sourcing request is not a listing, purchase or guarantee that the dealership can obtain the vehicle.

## 6. AI Car Concierge

The AI Concierge is a discovery assistant for customers who are unsure what vehicle they need. It should:
- Understand needs and ask concise follow-up questions.
- Search real inventory with server-side read-only tools.
- Rank a small set of genuine listings and explain matches.
- Identify trade-offs and missing listing information.
- Answer questions using supplied listing facts.
- Suggest unlisted model ideas with clear availability/source caveats.
- Explain supported Design Studio capabilities and direct customers to the Studio.
- Prepare an editable customer requirement summary for human handover.
- Offer explicit save actions for recommendations/preferences.

**Product boundary:** Concierge is not the comparison workspace and must not perform a side-by-side comparison workflow. When customers already have vehicles in mind, it links to the separate /compare page. Compare buttons populate that workspace; they never route a customer into the AI conversation.

A persistent floating **Talk to AI** launcher is available across public storefront pages. It opens the same Concierge conversation in a compact panel and links to the full /concierge page. The launcher must not cover primary actions, interrupt forms, or appear inside the admin workspace. Reuse a maintained chat component/runtime rather than building message transport, retries, accessibility and streaming UI from scratch.

The customer must confirm each save or submission in the normal UI. AI does not silently mutate Garage data, submit forms, reserve vehicles, issue quotes or charge money.

Guest conversation state is session-local. Release 2 can persist conversations for signed-in customers with clear notice and controls. The customer explicitly chooses whether to share a concise handover summary with staff; full chat history is not shared by default.

## 7. My Garage

My Garage is the customer's personal automotive workspace. It is not a cart.

### Guest Garage
A lightweight local browser collection:
- Saved vehicles.
- Compare selection (maximum three at a time).
- Saved or shareable builds.
- Recently viewed vehicles where practical.
- AI recommendations explicitly saved during the current session.

The interface explains that local items may not appear on another browser/device.

### Registered My Garage (Release 2)
Proposed route: `/garage`. It is the landing page after customer sign-in.

Sections:
- **Overview:** continue browsing/building, recent activity and next steps.
- **Saved Vehicles:** available, reserved, sold and unavailable saved items.
- **AI Recommendations:** explicitly saved recommendations with reason and preference snapshot.
- **Comparisons:** saved comparison sets, maximum three vehicles.
- **My Builds:** saved Design Studio configurations.
- **Enquiries:** submitted requests and statuses.
- **Test Drives:** requested, accepted, declined, completed or cancelled requests.
- **Vehicle Requests:** sourcing progress.
- **Preferences:** editable car-shopping profile and notification choices.
- **Account:** profile, sign-in and account controls.

### Saving recommendations
Nothing is saved automatically. For an actual listing, store the vehicle ID, save time, brief reason/preference snapshot and state at save time. For an unlisted model, store an external-interest/reference type or create a sourcing request—never create a fake Vehicle record.

### Unavailable saved vehicles
Do not silently remove a saved vehicle:
- Available: show the current listing.
- Reserved: label it Reserved and explain the limitation.
- Sold: preserve in history, disable availability-implying actions, offer similar stock or sourcing.
- Unpublished/archived: explain the listing is no longer public and offer help.
- Price changed: display current database price and a price-changed notice where relevant.

Revalidate listing status and price on the server whenever Garage loads. Browser storage is not authoritative.

## 8. Compare and shortlist

Compare is a standalone, non-AI workspace inspired by specification comparison sites such as GSMArena. It compares up to three actual Ritewheel listings in a **row-by-row specification matrix**, with one vehicle per column and grouped rows for overview, engine/drivetrain, comfort and appearance.

The matrix displays every supported field returned by the listing record, including make, model, trim, year, body type, condition, asking price/currency, listing status, mileage, engine, transmission, fuel, drivetrain, seating, exterior/interior colour and recorded features. Missing values are shown as **Not provided**; never fill gaps with model-generated or guessed facts. Price values retain their original currency and are never converted or ranked across NGN, USD, GBP or EUR.

The comparison selection is local to the guest browser and limited to three vehicles in Release 1. Vehicle cards provide a separate **View comparison** action after a car is selected. Saved comparison sets become account-scoped in Release 2. If a saved vehicle sells, retain history and flag the status. More detailed technical specifications (for example power, torque, acceleration, dimensions and economy) are added only when the listing schema and verified source data support them.

## 9. Design Studio

Design Studio is a creative build workspace, separate from Concierge and Compare. It has two complementary experiences:

1. **AI visual concept builder (first):** let a customer start from a prompt, an uploaded reference photo, or a selected Ritewheel vehicle, then describe imaginative changes such as paint, wheels, body kits, spoilers, stance, tint, lighting and interior styling. Reuse a proven photo-editing workflow and a currently supported image-generation/editing model. The output is a visual concept only, not proof of mechanical fitment, road legality, cost, stock, or build feasibility. Keep the original image and generated result visible for before/after review. Rate-limit generation, validate uploads, protect the API key, and show usage/cost limits before generation.
2. **Asset-backed 3D configurator (later/curated):** reuse a proven React Three Fiber/Three.js studio for specific vehicle models where Ritewheel has a licensed GLB and verified material/part mappings. Paint, finish, wheels and separate parts can be interactive only where the model actually supports them. Never imply any make/model can be fully configured in 3D without a suitable model asset.

The customer can save a concept/build locally/shareably in Release 1 and sync it to My Garage in Release 2. Clearly label AI concepts as illustrative.

## 10. Human dealership experience

### Release 1 contact actions
- Vehicle/general enquiry.
- Callback request.
- Request a quotation or additional information (not payment-ready until the team verifies the offer).
- Test-drive request.
- Vehicle sourcing request.
- Configured phone/WhatsApp/email links, only where real business contact settings exist.

There is no full real-time customer-agent chat in Release 1.

### Customer-approved handover
When asking for a human, a customer may share:
- Their requirements.
- Vehicles selected/saved.
- Relevant saved Design Studio build.
- Questions they want answered.
- Preferred contact channel/time.

Do not share full AI chat history by default.

### Human interaction records (Release 2)
Staff may record calls, email, WhatsApp, meetings/showroom visits, test-drive interactions, quotation sent, private notes and follow-up tasks. Internal notes are staff-only. Customer-visible updates are deliberately separate.

## 11. Vehicle sourcing requests

The form may capture desired make/model/trim, year/range, new/used condition, budget/currency, mileage, specifications, location/delivery expectations if volunteered, notes and contact details.

Proposed states:
`NEW → REVIEWING → SOURCING → MATCH_FOUND → QUOTED → CUSTOMER_APPROVED → FULFILLED`

Alternative terminal states: `UNAVAILABLE`, `DECLINED`, `CANCELLED`, `CLOSED`.

Staff can review, request clarification, assign an owner, record supplier/match information privately, send customer updates and create a quote only after a real supply option is verified. Do not claim "sourced" until the supply offer, price, condition and availability are checked.

## 12. Customer accounts

Registration is introduced at value moments such as "Save your Garage across devices" or "Keep your recommendations and builds", never as a barrier to discovery.

After sign-in, send the customer to `/garage`. Provide secure account-scoped data access, verified email recovery, sign-out/session invalidation, rate limits and customer data controls. A customer must never access another Garage by guessing an ID.

Proposed routes:
- `/account/sign-in`, `/account/register`, `/account/recover`.
- `/garage`, `/garage/vehicles`, `/garage/recommendations`, `/garage/comparisons`, `/garage/builds`.
- `/garage/enquiries`, `/garage/test-drives`, `/garage/requests`, `/garage/preferences`, `/garage/settings`.

## 13. Dealership workspace and CRM

### Release 1 — Single-admin operations workspace

The first release provides one protected dealership workspace for a single administrator role. This is an operational dashboard and request queue, not a staff CRM.

Navigation:
- Overview.
- Inventory.
- Enquiries.
- Test Drives.
- Sourcing Requests.
- Basic Settings (public dealership/contact information).

Release 1 capabilities:
- Review database-derived overview counts.
- Create, edit, publish/unpublish, reserve, mark sold and archive vehicle listings.
- Manage vehicle facts, pricing/currency, images and supported Design Studio options.
- Review customer enquiries and update basic statuses.
- Review test-drive requests and accept/decline them with explicit confirmed appointment details.
- Review sourcing requests and move them through the basic request statuses.
- Configure actual public contact channels and dealership profile details.

Release 1 does not include multiple staff accounts, granular roles, lead assignment, customer CRM records, internal sales activity timelines, private staff notes, quote management or payments. Each admin route and API mutation must still require a valid server-side administrator session.

### Release 2 — Staff CRM and customer operations

Navigation expands to include Leads, Customers, Staff and Settings alongside Inventory, Enquiries, Sourcing Requests and Test Drives.

Dashboard metrics are calculated from actual records only: available vehicles, new/unassigned leads, pending callback/sourcing requests, requested/confirmed test drives and other defined workflow counts. No invented revenue, growth or conversion metrics.

Proposed lead states:
`NEW → ASSIGNED → CONTACTING → QUALIFIED → QUOTED → NEGOTIATING → WON`

Alternative states: `LOST`, `UNRESPONSIVE`, `CLOSED`.

A lead can link to a customer or guest contact snapshot, enquiry, vehicle, build, sourcing request and quote. Staff have an owner, can record activities and follow-ups, and can escalate commercial decisions. Internal notes and AI drafts are not automatically customer-visible.

### Release 3 — Commercial and payment operations

Add Quotations, Reservations and Transactions/Payment Exceptions. These operate against verified quotes, server-controlled reservations and the payment architecture documented separately. Do not expose payment screens in Release 1 or Release 2 before their workflows exist.

## 14. Purchase model: no traditional cart

The future purchase path is:
1. Customer expresses interest.
2. Human staff verifies vehicle/sourcing offer, condition, price and terms.
3. Dealership issues a formal quote.
4. Customer reviews amount, currency, line items, expiry, payment terms and conditions.
5. Customer accepts the exact quote version.
6. An optional time-limited vehicle reservation is created.
7. Customer pays an agreed deposit/full/balance obligation through the future payment flow or approved offline arrangement.
8. Verified payment is recorded.
9. Dealership completes documentation, handover and remaining checks.

A quote is the formal offer. A payment applies to an accepted quote obligation. A sourcing request cannot be paid until staff have verified an actual supply option and issued a quote.

## 15. Notifications

Release 2 may notify customers of enquiry acknowledgement, lead assignment, additional information requests, test-drive updates, sourcing progress, quote issuance/expiry, reservation expiry, price/status changes on saved items (opt-in), and later payment/refund states. Use in-app records and a transactional email provider. WhatsApp requires an approved integration or configured click-to-chat link.

## 16. Information architecture

### Public
- `/`, `/inventory`, `/vehicles/[slug]`, `/compare`.
- `/concierge`, `/studio/[slug]`.
- `/source-vehicle`, `/about`, `/contact`.

### Customer account (Release 2)
- Account sign-in/register/recovery.
- Garage overview, vehicles, recommendations, comparisons, builds, enquiries, test-drives, sourcing requests, preferences and settings.

### Dealership
- `/admin`, `/admin/vehicles`, `/admin/enquiries`, `/admin/test-drives`, `/admin/sourcing-requests`.
- Release 2: `/admin/leads`, `/admin/customers`, `/admin/staff`.
- Release 3: `/admin/quotes`, `/admin/transactions`.

## 17. Approved release plan

### Release 1 — Public marketplace and lead capture
- Homepage, Inventory, vehicle details and comparison.
- PostgreSQL/Prisma backend and real vehicle CRUD.
- Guest/local favourites, shortlist and shareable builds.
- AI Concierge with grounded current-inventory search/comparison.
- Asset-backed Design Studio.
- Enquiries, callback and test-drive requests.
- Basic vehicle sourcing request and protected staff review queue.
- Basic dealership dashboard and configured human contact paths.
- No required customer accounts, no cart and no online payments.

### Release 2 — My Garage, customer accounts and CRM
- Customer registration, sign-in and recovery.
- Synchronised Garage, saved vehicles/builds/comparisons/recommendations.
- Persistent customer preferences and account-scoped AI history with controls.
- Enquiry/test-drive/sourcing history and customer notifications.
- Staff roles, lead assignment, customer records, sales activity and internal notes.
- Customer-approved AI handover summaries.
- Draft quote preparation can be introduced without accepting payments.

### Release 3 — Quotations, reservations and payments
- Versioned formal quotes and customer acceptance.
- Vehicle reservation/hold and expiry.
- Deposit/full/balance payment obligations.
- Provider-agnostic hosted checkout.
- Verified, idempotent webhooks.
- Transaction history, receipts, refunds, reconciliation and append-only financial journal.
- Payment exception workflow and purchase/handover tracking.
- Provider selected after due diligence on market coverage, fees, settlement, payment methods, webhooks, refunds, currency and compliance.

## 18. Out of scope until separately approved

- Full real-time customer-agent chat.
- Financing approval or credit decisions.
- Multi-dealership tenancy.
- Live external inventory feeds.
- AI image generation or 3D vehicle rendering.
- Automated delivery/logistics management.
- Public reviews/social network features.

## 19. Trust and privacy

- Explain local guest storage and its limitations.
- Persist AI history/preferences only with suitable customer notice and controls.
- Customer chooses whether to share AI handover summary with staff.
- Keep internal sales notes private.
- Validate vehicle status and quote data server-side.
- Never treat AI suggestions as stock commitments or offers.
- Payment secrets and verification remain server-side.
- Keep customer account data scoped to the authenticated identity.

## 20. Product acceptance

Release 1 succeeds when a guest can discover a real listing, inspect and compare it, use AI to find a grounded match, configure supported options, save locally, submit enquiry/test-drive/sourcing request, and the dealership can review it in a protected workspace.

The long-term product succeeds when customers can continue across devices in My Garage, staff can manage human relationships in CRM, and customers can review verified quotes and complete a secure, auditable payment lifecycle.

---
**Source of truth:** this document defines the approved experience and release boundaries. Do not silently move Release 2/3 functions into Release 1.
