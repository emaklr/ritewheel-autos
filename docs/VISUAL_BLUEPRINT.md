# Ritewheel Autos — Visual Blueprint

**Version:** 1.0  
**Status:** Design direction for review; not implemented  
**Date:** 14 November 2026  
**Companion:** `ARCHITECTURE.md`

## 1. Design objective

Ritewheel should feel like a premium automotive showroom with a personal digital buying assistant. The interface should be cinematic and editorial, but the underlying shopping flows must remain fast, understandable, and usable.

The supplied Prestige Motors screenshot is the primary visual reference: large, dark automotive photography; a bold headline; compact gold calls to action; a translucent but readable vehicle-finder panel; and editorial vehicle cards.

The six-screen concept board created during this design pass illustrates the intended direction. It is a visual concept, not a pixel-perfect specification or a source of factual dealership content. Any figures, vehicle names, prices, badges, logos, or performance metrics visible in that concept are placeholders and must not be copied into the live application unless they are verified records.

## 2. Brand and design language

### 2.1 Personality

- Premium, confident, modern, and knowledgeable.
- Automotive rather than generic ecommerce.
- Helpful without feeling pushy.
- AI-assisted, but human and dealership-oriented.
- Restrained use of motion and visual effects.

### 2.2 Colour tokens

| Token | Hex | Intended use |
| --- | --- | --- |
| Obsidian | `#080909` | Main application background |
| Charcoal | `#171717` | Main cards and panels |
| Elevated charcoal | `#202222` | Inputs, hover surfaces, secondary cards |
| Subtle border | `#303333` | Dividers and card boundaries |
| Amber gold | `#F5A000` | Primary actions, selected states, key highlights |
| Gold hover | `#FFB52E` | Hover/active emphasis |
| Ivory | `#F4F1EA` | Main text |
| Muted grey | `#A5A5A5` | Supporting text and metadata |
| Success | `#2EAD72` | Available/accepted states only |
| Warning | `#D99A32` | Pending/attention states |
| Danger | `#D95E59` | Destructive actions and errors |

Gold is an accent, not a background colour for every component. Large surfaces stay dark. Avoid bright gold gradients, excessive glass blur, and unnecessary glowing effects.

### 2.3 Typography

- Display and headings: **Manrope**, with a strong but clean weight.
- Body and interface: **Inter**.
- Use a clear type scale: large editorial hero heading, restrained section headings, readable card titles, and compact labels.
- Keep body copy short. Avoid all-caps for long text.
- Prices use a high-contrast, tabular-number style.

Fonts should be loaded through the Next.js font system rather than blocking third-party font requests at runtime.

### 2.4 Layout and shape

- Desktop content maximum width: approximately 1,440 px.
- Desktop page gutters: 48–72 px depending on viewport.
- Tablet gutters: 28–36 px.
- Mobile gutters: 18–22 px.
- Main card radius: 14–20 px.
- Buttons and compact controls: 8–12 px radius.
- Use a consistent 8 px spacing rhythm.
- Product imagery is the visual priority. Keep cards uncluttered.

### 2.5 Photography and imagery

- Use high-resolution, approved vehicle photographs with consistent aspect ratios.
- Hero image: wide landscape image, vehicle prominent on the right or centre-right, with darker negative space behind the headline.
- Vehicle listing cards: 16:10 or 3:2 landscape crop.
- Detail gallery: large landscape lead image with consistent thumbnails.
- Design Studio: use curated matching asset variants for the selected vehicle.
- Do not hotlink random images or use manufacturer logos without appropriate rights.
- Keep a source/usage note for all assets used in the portfolio demo.
- Provide a neutral fallback image when a listing image is absent.

## 3. Global application shell

### 3.1 Desktop navigation

A single consistent header appears on all public pages:

- Left: Ritewheel wordmark and emblem.
- Centre: Home, Inventory, AI Concierge, Design Studio, About.
- Right: search icon, compare shortcut, and a gold "Get in touch" action.
- A Contact link is available in the footer and About page.
- Header overlays the homepage hero and becomes a solid/darker sticky surface after scrolling.
- Active page is shown with a thin gold underline or subtle text accent.

Do not hardcode a business telephone number, address, opening time, or social account. Add these only when a real contact profile is configured.

### 3.2 Mobile navigation

- Brand at left; menu control at right.
- Menu opens as a full-height or full-screen dark navigation sheet.
- Inventory search and AI Concierge remain prominent entry points.
- Compare state is available from a compact header/menu action.
- Buttons and tap targets should be comfortable for touch.
- Avoid squeezing desktop navigation into a single row.

### 3.3 Footer

- Wordmark and one-sentence product statement.
- Explore links: Inventory, AI Concierge, Design Studio.
- Company links: About, Contact.
- Contact details only when configured.
- Legal / privacy links can be added before production use.
- No fake trust badges, fake review scores, or fabricated dealership claims.

## 4. Screen 1 — Homepage

**Route:** `/`  
**Purpose:** Establish trust and visual quality immediately, then guide customers into vehicle discovery.

### Layout order

1. Global header.
2. Cinematic hero.
3. Featured vehicles.
4. Browse by category / body type.
5. AI Concierge feature section.
6. Design Studio feature section.
7. About / dealership promise section.
8. Contact call-to-action.
9. Footer.

### Hero composition

Desktop uses a wide hero, approximately 600–720 px high depending on viewport:

- Full-bleed automotive photograph with a dark left-to-right gradient.
- Left column: small eyebrow label, strong two-line headline, short description, primary and secondary actions.
- Suggested headline: **"Find the car that moves you."**
- Primary action: **Explore inventory**.
- Secondary action: **Ask the AI Concierge**.
- Right/centre-right: a dark, compact "Find your vehicle" panel containing Make, Body Type, and Budget selectors plus Search Vehicles.
- Hero search is a shortcut into the full inventory page; it must use the same validated filters as the inventory UI.

The hero should not be overcrowded with paragraphs, badges, or made-up metrics.

### Featured inventory

- Section eyebrow and heading: "Exceptional vehicles" or "Featured collection".
- View all inventory link aligned to the right.
- Three cards per desktop row, two per tablet row, one per mobile row.
- Each card contains image, availability/condition badge when grounded in data, make/model/year, short specification row, displayed price, favourite control, and compare control.
- Use consistent card heights and image crops.

### Discovery categories

A compact row or grid for body types (SUV, Sedan, Coupe, Pickup, Electric/Hybrid where available). Categories should be driven by supported inventory values. Hide categories with no matching published stock.

### Concierge and Studio promotional sections

Use two editorial feature blocks with contrasting vehicle imagery:
- **Find your match:** introduces conversational AI discovery.
- **Make it yours:** introduces the Design Studio and shows real, supported option previews.

Each block has one clear action. Do not repeat the same CTA in every section.

### Homepage interactions

- Header search opens inventory search or focuses search input.
- Hero selectors update the destination inventory query.
- Vehicle cards navigate to vehicle detail.
- Compare toggles add/remove up to three vehicles.
- Favourite toggles persist locally in the current browser.
- Concierge CTA opens the dedicated AI Concierge page.

### Responsive behaviour

- Hero becomes a stacked composition on mobile: text/actions first, search panel below or within the hero.
- Hero photography remains visible without compromising text contrast.
- Featured cards become horizontally scrollable only where that improves browsing; otherwise stack.
- The header uses the mobile menu.

## 5. Screen 2 — Inventory

**Route:** `/inventory`  
**Purpose:** Let customers browse, filter, sort, and shortlist real published stock.

### Desktop layout

- Breadcrumb or compact page eyebrow.
- Heading: "Our vehicle collection".
- Short subtitle and a real result count.
- Main content split: filter sidebar (approximately 250–280 px) and result grid.
- Toolbar above grid: active filter chips, sort selector, and grid/list toggle only if both layouts are implemented.
- Three-column vehicle grid on wide desktop; two columns on smaller desktop/tablet.

### Filter controls

- Search by make/model/keyword.
- Make.
- Body type.
- Price range (with currency clear).
- Year range.
- Mileage range.
- Fuel type.
- Transmission.
- Seating capacity.
- Condition.
- Availability.

Use collapsible filter groups. Show selected filters as removable chips and provide a clear-all action. Filter changes update URL search parameters so a search can be shared or refreshed.

### Vehicle card

Each card includes:

- Large landscape image.
- One data-backed badge, such as Featured, New Arrival, or Reserved; never infer a status from the age of the record.
- Favourite heart button.
- Make, model, trim, and year.
- A concise row of key specs: transmission, fuel, mileage, and/or body type.
- Formatted price with the stored currency.
- View details action or clickable card.
- Compare checkbox/control.

### Sorting and pagination

- Sort options: newest, price low-to-high, price high-to-low, year, and mileage when those fields are present.
- Pagination is database-backed.
- Keep filters when the user changes pages.
- Never fetch the full catalogue and filter everything in the browser.

### Mobile layout

- Search remains near the top.
- Filters open in a bottom sheet or full-height drawer.
- Show active filter count.
- One or two cards per row depending on viewport width; prioritize readable card details.
- Keep sort and filter actions sticky/accessible while browsing.

### Required states

- Loading skeletons.
- No inventory available.
- No results for current filters, with clear-filters action.
- Failed inventory request with retry.
- Missing image fallback.
- Reserved and sold listings clearly distinguished; sold vehicles are excluded from available inventory by default.

## 6. Screen 3 — Vehicle detail

**Route:** `/vehicles/[slug]`  
**Purpose:** Give a customer enough accurate information to enquire or request a test drive.

### Above-the-fold layout

Desktop uses a two-column layout:

- Left (approximately 60–65%): lead gallery image and thumbnail strip; gallery navigation; image expand action.
- Right (approximately 35–40%): availability status, vehicle name, year/trim, price, concise key facts, primary Enquire Now action, secondary Book a Test Drive action, and Open in Design Studio action where the vehicle supports configurations.
- The right column may become sticky while the gallery/detail header scrolls.
- Add breadcrumbs above the gallery.

### Below-the-fold sections

Use clear tabs or anchored sections:

1. Overview — concise vehicle description.
2. Specifications — engine, drivetrain, transmission, fuel, mileage, seating, body type, condition, and other available facts.
3. Features — data-backed feature list grouped by category.
4. Gallery — full image set.
5. Similar vehicles — real published inventory recommendations.

Omit unknown fields or label them "Not provided". Do not display empty specification labels.

### Main actions

- Enquire Now opens a form pre-filled with the selected vehicle reference.
- Book a Test Drive opens a request form with vehicle preselected.
- Build Your Version opens the Design Studio for this vehicle.
- Compare toggles the vehicle in the compare tray.
- Favourite saves locally in the current browser.

### Enquiry form

Collect name, email, phone, and optional message. Show a concise summary of the vehicle and any attached saved build. Display a clear consent/notice explaining that the dealership will use the details to respond. Submit only after customer action.

### Test-drive form

Collect name, email, phone, preferred date, preferred time, and optional note. State clearly that the request is pending until the dealership confirms it.

### Required states

- Vehicle unavailable, reserved, or sold.
- Price not provided.
- Gallery image unavailable.
- Enquiry submitted / validation failed / server error.
- Test-drive request submitted and awaiting confirmation.

## 7. Screen 4 — AI Concierge

**Route:** `/concierge`  
**Purpose:** Provide a guided, natural-language route into the real vehicle catalogue.

### Desktop layout

Use a full-height workspace below the public header:

- Main left panel (approximately 60–65%): conversation.
- Right panel (approximately 35–40%): structured preference summary and vehicle recommendations.
- The chat and recommendation panel share the same dark surface system, separated by a subtle border.

### Empty state

- Ritewheel Concierge title and one-sentence explanation.
- Short prompt: "Tell me what kind of car you're looking for."
- Prompt chips such as:
  - Find a family SUV under my budget.
  - Compare two luxury SUVs.
  - I need an economical daily driver.
  - Help me choose a first car.
- A clear privacy note: do not include payment details or other sensitive personal information.

### Conversation

- Distinguish customer and assistant messages clearly.
- Assistant messages can contain a small set of structured vehicle result cards.
- Stream responses with a visible generating state.
- Show a retry action on model/provider errors.
- Keep a concise conversation history in the active browser session; customer accounts and cross-device chat history are not part of V1.
- Add a new conversation/reset control with confirmation if it would clear a current session.

### Preference panel

Show editable chips or fields for values the AI has extracted:

- Budget and currency.
- Make(s).
- Body type.
- Seats.
- Use case.
- Fuel.
- Transmission.
- Exterior/interior preference.
- Must-have features.

The customer can edit these values directly. The AI's extracted preferences are suggestions, not final filters until the customer applies or confirms them.

### Recommendation cards

Each result shows vehicle image, exact catalogue name/year, stored price and currency, key matching specifications, and concise "Why this matches" reasons. Include View Details, Compare, and Design Studio actions when supported.

### AI behaviour in the UI

- Ask one useful follow-up at a time.
- Avoid re-asking information already supplied.
- Display a clear no-match state and let the customer relax a filter.
- Never display AI-generated price, stock badge, specification, or vehicle as if it were a real record.
- When the model is unavailable, provide a link to normal inventory search; do not imitate an AI response.

### Mobile layout

- Conversation occupies the main screen.
- Preference summary and recommendations are accessible in a bottom drawer or switchable tab.
- Composer remains visible above the mobile keyboard.
- Result cards fit mobile width and remain easy to tap.

## 8. Screen 5 — Vehicle Design Studio

**Route:** `/studio/[slug]`  
**Purpose:** Let the customer personalise a vehicle using only configuration options and preview assets supported by that vehicle.

### Desktop layout

- Compact Studio header with vehicle name, back-to-detail link, and build status.
- Main left area (approximately 62–68%): large vehicle preview with a dark studio background.
- Right panel (approximately 32–38%): configuration controls in a clear sequence.
- A persistent bottom or side summary displays selected options and any stored option price adjustments.
- Save Build is the primary gold action.

### Configuration groups

Only show groups and choices enabled for the current vehicle.

1. Exterior paint colour.
2. Paint finish.
3. Wheel style.
4. Interior colour/material.
5. Brake-caliper colour.
6. Appearance/trim package.

A selected state must be unambiguous. Use swatches for colours and visual thumbnail options for wheels/interiors where suitable assets exist. Include text labels for accessibility and users who cannot distinguish colours.

### AI styling helper

Provide a small "Describe your style" prompt in the Studio:

- Example: "Make it sporty but elegant, with a dark exterior and a tan interior."
- AI returns a structured list of proposed valid option IDs.
- Display the changes as a previewable proposal.
- Customer reviews and applies them.
- If no supported option matches the request, explain that and offer the closest available choices.
- Never silently substitute an unavailable colour or part.

### Preview resolver

- Exact mapping: show the curated asset assigned to the selected option combination.
- Partial mapping: show the closest supported vehicle/variant preview and a visible option summary.
- No mapped combination: keep the base vehicle preview and show selected options separately.
- Never claim to dynamically repaint or render the real vehicle when only a preset image is shown.

### Saving a build

- Customer reviews selected options and any supported price adjustments.
- Save Build persists the vehicle ID, selected valid option IDs, preview asset reference, and a public unguessable build ID.
- Show a success state and allow the customer to continue to an enquiry.
- Build can be reopened using its public ID.

### Mobile layout

- Vehicle image first, with thumbnail/preview controls.
- Configuration groups below in an accordion or step-by-step selector.
- Sticky bottom bar with summary and Save Build.
- Avoid a cramped split-screen layout.

## 9. Screen 6 — Admin dashboard

**Routes:** `/admin`, `/admin/vehicles`, `/admin/enquiries`, `/admin/test-drives`  
**Purpose:** Demonstrate real dealership operations through a protected interface.

### Desktop shell

- Fixed left sidebar with Ritewheel admin identity.
- Navigation: Overview, Inventory, Enquiries, Test Drives, Settings.
- Main content area with page title, current admin identity, and period/filter controls only where meaningful.
- Dark charcoal surfaces with gold for selected nav/actions; use less cinematic imagery than the public site to prioritise operational clarity.

### Dashboard overview

KPI cards should be calculated from the database:

- Published/available inventory.
- New/open enquiries.
- Pending test-drive requests.
- Reserved vehicles.

Below the KPIs:

- Recent inventory table with vehicle, price, status, and updated date.
- Recent enquiries list with customer, vehicle, date, and status.
- Pending test-drive requests.
- Quick action to add a vehicle.

Do not use fictional sales volume, revenue, customer count, growth percentages, or "vehicles in stock" claims. If a metric cannot be derived from stored records, omit it.

### Inventory management

- Search/filter inventory.
- Add vehicle action.
- Table or compact list with thumbnail, vehicle, year, price, status, featured state, and last updated.
- Row actions: Edit, Publish/Unpublish, Mark Reserved, Mark Sold, Archive.
- Confirmation dialog for destructive/status-changing actions.
- Vehicle create/edit form groups: identity, price/currency, specifications, images, features, configuration options, publishing.

### Enquiries

- Table/list with customer, vehicle/build reference, submitted date, contact method, and current status.
- Detail drawer/page with message and linked build.
- Status transitions: NEW, CONTACTED, QUALIFIED, CLOSED, SPAM.
- Do not expose customer details to public endpoints or logs.

### Test drives

- List requests with vehicle, requested date/time, contact, and status.
- Admin actions: Accept, Decline, Mark Completed, Cancel.
- Clearly distinguish requested/preferred time from confirmed appointment time.
- No calendar availability claim in V1 unless a real schedule and conflict check are implemented.

### Admin states

- Unauthenticated redirect to admin login.
- Empty inventory/enquiry state with a useful first action.
- Loading skeleton.
- Permission denied.
- Failed save with field-level validation.
- Success toast and refreshed server data.
- Destructive action confirmation.

### Mobile admin

Admin remains usable on tablet and phone but desktop is the primary design target. Sidebar collapses to a drawer; dense tables become cards or horizontally scrollable tables with clear row actions.

## 10. Shared component inventory

Build reusable primitives rather than page-specific copies:

- `PublicHeader`, `MobileNav`, `PublicFooter`.
- `HeroSearchPanel`, `InventoryFilterSidebar`, `FilterDrawer`, `ActiveFilterChips`.
- `VehicleCard`, `VehicleGallery`, `VehicleSpecGrid`, `VehicleStatusBadge`.
- `CompareTray`, `CompareTable`, `FavouriteButton`.
- `ConciergeChat`, `ChatMessage`, `PromptChips`, `PreferenceSummary`, `RecommendationCard`.
- `DesignStudioPreview`, `OptionGroup`, `ColourSwatch`, `VariantThumbnail`, `BuildSummary`.
- `AdminSidebar`, `AdminKpiCard`, `AdminDataTable`, `StatusPill`, `ConfirmDialog`.
- Shared form fields, buttons, dialogs, tooltips, skeletons, empty states, and toast notifications.

Component APIs should use typed data models and should not embed database calls. Data fetching belongs in server pages, route handlers, or focused hooks/services.

## 11. Shared interaction rules

- Gold button: primary action. Use one primary action per major panel.
- Secondary button: outlined or charcoal; never compete visually with the main action.
- Destructive actions: danger style plus confirmation.
- Selected controls: clear border/fill treatment and accessible text state.
- Status colour must always be paired with a label; do not rely on colour alone.
- All interactive controls have hover, focus, pressed, disabled, loading, and error states as relevant.
- Use skeletons for content loading, not large blank regions.
- Every form has field-level feedback and a clear submission result.
- Respect reduced-motion user preference.
- Keyboard navigation, visible focus, semantic headings, accessible labels, and sufficient contrast are required.

## 12. Currency, copy, and demo-data rules

- Each vehicle record stores a currency code. Format the amount from that code; never infer a currency from the user's browser locale.
- The initial demo catalogue can use NGN where that is the chosen sample record currency. USD and other currencies can be supported as separately labelled records.
- V1 does not perform currency conversion. AI must not compare monetary values across different currencies as if they were equivalent.
- Seed vehicles and images must be clearly treated as demonstration content unless they represent real, approved dealership stock.
- All result counts, availability statuses, prices, badges, and dashboard KPIs come from database records.
- Do not hardcode "500+ vehicles", "50+ brands", "15K+ happy clients", "24/7", revenue, growth figures, testimonials, or other claims shown in visual concepts.
- Use realistic neutral copy for empty states and examples; never represent illustrative chat examples as customer reviews or actual purchase histories.

## 13. Screen-to-route map

| Screen | Route | Data source |
| --- | --- | --- |
| Homepage | `/` | Featured published vehicles, supported categories, configured business profile |
| Inventory | `/inventory` | Published vehicle query with URL filters and pagination |
| Vehicle detail | `/vehicles/[slug]` | One public vehicle record, images, specifications, options |
| Compare | `/compare` | Up to three vehicle IDs held locally, public vehicle query |
| AI Concierge | `/concierge` | Conversation state plus read-only inventory tools |
| Design Studio | `/studio/[slug]` | Vehicle-specific options and preview asset mapping |
| About | `/about` | Configured dealership profile and curated copy |
| Contact | `/contact` | Configured contact details and enquiry form |
| Admin overview | `/admin` | Authenticated database aggregates |
| Admin inventory | `/admin/vehicles` | Authenticated vehicle records |
| Admin enquiries | `/admin/enquiries` | Authenticated enquiries |
| Admin test drives | `/admin/test-drives` | Authenticated test-drive requests |

## 14. Main customer journey

1. Land on the homepage and understand the value proposition.
2. Choose Explore Inventory or Ask the AI Concierge.
3. Browse filters or describe preferences in natural language.
4. Review real vehicle recommendations.
5. Open a vehicle detail page and inspect verified record fields.
6. Compare shortlisted options if needed.
7. Open the Design Studio if the vehicle has supported options.
8. Select options manually or ask AI for a supported style proposal.
9. Save the configuration.
10. Submit a vehicle/build enquiry or test-drive request.
11. Receive a request acknowledgement; await dealership confirmation.

The journey should never force AI usage. Every important discovery and enquiry action remains possible through conventional UI.

## 15. Visual acceptance criteria

The visual blueprint is accepted for implementation when:

- All six principal screens share the same brand, header, colour, typography, and component language.
- The homepage has the dark cinematic hero and finder panel inspired by the supplied reference.
- Vehicle imagery is prominent and consistent.
- Inventory filters are readable and usable on desktop and mobile.
- Vehicle detail prioritises gallery, price, availability, and clear next steps.
- Concierge is a dedicated product experience with grounded recommendation cards and an editable preference summary.
- Design Studio clearly separates real preview assets from option summaries.
- Admin pages prioritise data clarity and actual operational states.
- No mockup metrics or invented dealership claims appear in the application.
- Empty, loading, error, disabled-AI, and success states are designed as deliberately as the default screen.
- Keyboard navigation, focus, labels, contrast, and reduced motion are addressed.

## 16. Decisions that remain intentionally configurable

These can be adjusted without changing the main architecture:

- Final logo/emblem treatment.
- Exact hero photograph and vehicle image library.
- Final contact details and About copy.
- Which demonstration vehicle receives the richest Design Studio asset set.
- Exact option groups supported by each seeded vehicle.
- Whether the hero finder panel is always visible or opens as a focused search interaction on narrow screens.

No real application code should be implemented until the visual blueprint and revised architecture have been reviewed.

## 17. Performance-friendly visual implementation rules

The luxury design must be achieved with image quality, composition and detail—not expensive runtime effects.

### Photography
- Use one carefully art-directed static hero image with a dark gradient overlay.
- Use a separate mobile crop when necessary, sized for the phone viewport.
- Use consistent 16:10 or 3:2 image frames on vehicle cards.
- Reserve image dimensions so cards never jump as photographs load.
- Give high priority only to the actual above-the-fold hero image; lazy-load below-fold cards and non-active gallery images.
- Keep first-screen content meaningful while the hero loads; use a quiet dark placeholder rather than a large animated shimmer.
- Do not add an autoplay background video or rotating full-screen hero carousel.

### Effects and animation
- Use static gradients for image contrast, not continuously animated gradients.
- Prefer solid charcoal surfaces to broad backdrop blur.
- Use short opacity/transform transitions for buttons, menus, cards, and selected states.
- Avoid parallax, scroll-jacking, 3D, particle effects, and continuously moving background elements.
- Do not delay text or actions until entrance animations complete.
- Respect reduced-motion settings.

### Page weight
- Homepage must not download AI model code, Design Studio assets, or every inventory image.
- Concierge code loads only on its dedicated route or when its interface is explicitly opened.
- Design Studio code and preview assets load only when a customer enters the screen or selects an option.
- Inventory initially renders 12 results; further results use server pagination.
- Mobile navigation and filters use lightweight drawers/sheets.

### Responsiveness and visual stability
- Every image has a known aspect ratio or reserved dimensions.
- Header, card, and content dimensions remain stable while loading.
- Forms show immediate local feedback without blocking the whole page.
- Search debounces requests and keeps the existing layout stable while new data loads.
- Use skeletons only where they clarify structure; continuous shimmer is unnecessary.
- On small screens, prioritise readable controls and one-column flows over desktop-like density.

### Performance acceptance gates
- Target Core Web Vitals "good" thresholds at the 75th percentile: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Check Lighthouse on mobile and desktop.
- Verify hero and initial card payload sizes at realistic viewport widths.
- Verify homepage browsing does not load AI or Design Studio route bundles.
- Verify the AI response streams while the interface remains responsive.
- Verify reduced-motion mode and throttled mobile-network behaviour.
- Every rich effect or new dependency must justify its impact and have a measured reason to remain.
