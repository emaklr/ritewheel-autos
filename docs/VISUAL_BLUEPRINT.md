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
**Status:** Approved design direction for V1; implementation not yet started.  
**Purpose:** Establish a premium first impression, then move customers into real vehicle discovery with minimal friction.

### Approved design decisions

The homepage uses the three approved choices:

1. One dominant cinematic vehicle photograph in the hero.
2. A wide vehicle finder panel immediately **below** the hero, not floating over its right side.
3. Three large featured-vehicle cards per desktop row.

The result should feel like a luxury showroom editorial landing page, not a dense ecommerce homepage.

### Layout order

1. Global navigation.
2. Cinematic hero with one vehicle image.
3. Full-width vehicle finder panel.
4. Browse by category.
5. Featured vehicles.
6. AI Concierge promotional panel.
7. Design Studio promotional panel.
8. Short dealership/product promise section.
9. Contact call-to-action and footer.

### Global navigation on the homepage

- Left: Ritewheel emblem and wordmark.
- Centre: Home, Inventory, AI Concierge, Design Studio, About.
- Right: compact compare shortcut and a gold **Get in Touch** action.
- Do not include a customer sign-in control in V1; guest browsing and enquiries are the intended customer path.
- Do not invent a telephone number, location, hours, or social links.
- The header overlays the hero with a subtle dark background and becomes a solid dark sticky header after the hero.

### Hero composition

**Desktop**
- One static, wide cinematic image, approximately 560–640 px tall depending on the viewport.
- The vehicle is prominent on the right or centre-right.
- The headline and supporting copy sit on the left, protected by a static dark gradient.
- Suggested headline: **"Find the car that moves you."**
- Short supporting line: "Discover exceptional vehicles, get AI-powered recommendations, and make your next car feel like yours."
- Primary action: **Explore Inventory**.
- Secondary action: **Meet the AI Concierge**.
- Do not add a rotating hero carousel, autoplay video, large animated overlay, or a statistics strip.
- Do not place the vehicle finder inside the hero.

**Mobile**
- Use a carefully art-directed crop of the same hero photography, not an unrelated second visual concept.
- Present headline and actions first, with the vehicle visible without making text unreadable.
- Keep the hero compact enough that customers reach the finder without excessive scrolling.
- Stack the primary and secondary actions when the viewport cannot fit them comfortably side by side.

### Vehicle finder panel

Place a wide, dark charcoal finder directly underneath the hero, visually connected to it through spacing and subtle borders.

V1 fields:
- **Make** — defaults to Any Make.
- **Body Type** — defaults to Any Type.
- **Budget** — defaults to Any Budget and must make the selected currency explicit.

Primary action: **Search Vehicles**.

Secondary action: a quiet text/link action such as **Use AI to Find for Me**, linking to `/concierge`. The AI interface itself must not load on the homepage.

Interaction:
- Each field uses values supported by the current inventory.
- Submitting navigates to `/inventory` with URL search parameters.
- The inventory page applies the same server-side validation and query service as all other searches.
- Empty filters are omitted from the URL.
- Finder options are populated from supported database values where practical; never invent makes or categories to fill empty menus.
- Advanced filters (price range, year, fuel, transmission, mileage, seating, condition) belong on the Inventory page, not in this compact finder.

**Mobile finder**
- Full-width stacked controls.
- Search button spans the panel width.
- Keep labels visible; do not depend on placeholder text alone.
- Use native/select controls or lightweight accessible selects; avoid a heavy third-party combobox for three fields.

### Browse by category

- Heading: **Browse by Category**.
- Short line: "Explore vehicles by the style that fits your lifestyle."
- Image-led category tiles for categories supported by published inventory, for example SUVs, Sedans, Coupes, Pickups, Luxury, and Electric.
- Six tiles may appear across a wide desktop row; use a responsive grid below that width.
- Each tile includes a representative image and readable category label.
- Do not show category counts in V1 unless computed from the database and meaningful.
- Hide categories that have no published matching vehicles.
- Clicking a category opens Inventory with the category filter applied.

### Featured vehicles

- Heading: **Featured Vehicles** or **Exceptional Vehicles**.
- Short description: "Handpicked vehicles from our collection."
- View All Inventory link aligned opposite the heading.
- Exactly three large cards per desktop row on the homepage.
- Two cards per row on tablet when there is enough width; otherwise stack.
- One card per row on narrow mobile.
- A card shows:
  - Optimised landscape vehicle photograph.
  - A factual badge only when its database state supports it (for example Featured, New Arrival, Reserved, or Demo Listing).
  - Make, model, trim and year where available.
  - One concise specification line.
  - Price with the record's currency, or "Price on request" when not set.
  - Favourite and compare controls.
  - A clear link to vehicle details.
- Use a consistent image ratio and fixed card geometry to prevent layout shifts.
- Do not hardcode vehicle prices, inventory counts, availability, customer totals, growth percentages, or fabricated social proof.
- The section is driven by a small server query for published featured vehicles; it does not load the entire catalogue.

### AI Concierge promotional panel

- Editorial feature section with a concise benefit statement, such as **"Your personal car expert."**
- Show one short illustrative prompt, clearly labelled as an example, rather than a fake customer testimonial.
- Primary action: **Start a Conversation** linking to `/concierge`.
- Use one lightweight static graphic or optimised still image.
- Do not load model SDK, chat state, chat components, or AI requests on the homepage.

### Design Studio promotional panel

- Heading: **Design Your Dream Car**.
- Explain that the customer can personalise supported colours, wheels, interior and styling options.
- Primary action: **Start Designing**.
- Show one curated preview image from a vehicle that actually has supported Design Studio assets.
- If there is no configured showcase vehicle, show a branded non-interactive preview and do not invent a working configurator.
- Design Studio code and option images load only after navigation to `/studio/[slug]`.

### Product promise and contact

A restrained information strip can explain the real customer value:
- Explore vehicle information in one place.
- Get help comparing suitable vehicles.
- Send an enquiry or request a test drive.

These are descriptions of implemented features, not claims of mechanical certification, independent verification, secure payment, nationwide delivery, or guaranteed stock.

A final contact CTA links to the configured contact route. Contact details are displayed only when real values have been configured.

### Homepage interactions

- Navigation links open their corresponding routes.
- Hero actions lead to Inventory and Concierge.
- Finder submits Make, Body Type and Budget into URL query parameters.
- Category tiles apply the matching inventory filter.
- Featured cards open the actual vehicle record.
- Favourite toggles persist locally in the current browser.
- Compare toggles add/remove vehicles, with a maximum of three.
- Concierge and Studio promotion panels are links only; their feature bundles are not loaded on the homepage.
- Get in Touch opens Contact or the configured enquiry flow.

### Responsive behaviour

**Wide desktop**
- Max content width around 1,440 px.
- Hero copy on left, vehicle visual on right/centre-right.
- Finder fields in one horizontal row.
- Category tiles in a compact image-led grid.
- Featured vehicles in three columns.

**Tablet**
- Hero remains image-led, with the copy and actions protected by gradient/spacing.
- Finder may wrap into two rows.
- Category tiles use three columns.
- Featured vehicles use two columns where possible.

**Mobile**
- Navigation collapses to a menu sheet.
- Hero uses a phone-appropriate crop and stacked calls to action.
- Finder fields stack vertically and retain explicit labels.
- Categories use a two-column grid or compact horizontal scroll only if labels stay legible.
- Featured vehicles use one card per row.
- AI Concierge and Design Studio panels stack.
- No horizontal page overflow.

### Homepage performance constraints

- One static hero image; no video or carousel.
- Use `next/image`, responsive `sizes`, a reserved aspect ratio, and an appropriately compressed desktop/mobile crop.
- Prioritise only the actual hero/LCP image.
- Lazy-load category, featured, and promotional images below the fold.
- Use three featured-vehicle records only; do not fetch the whole catalogue for the homepage.
- Render page content as Server Components by default.
- Keep favourite/compare controls as small client-side islands.
- Do not load AI SDK, chat UI, configurator code, charting libraries, or admin code on the homepage.
- Use CSS-first transitions and a static dark gradient overlay.
- Avoid large-area blur, parallax, animated gradients, and layout animations.
- Reserve image and component dimensions to prevent CLS.

### Required homepage states

- Loading state for featured vehicles with stable image/card dimensions.
- No featured vehicles: display a designed empty state and a link to Inventory.
- Finder options unavailable: keep defaults usable and allow navigation to Inventory.
- Failed featured inventory request: show a small retryable message; do not fail the entire homepage.
- Missing hero/vehicle image: use a neutral premium fallback.
- AI provider unavailable: homepage remains fully usable; Concierge route explains its unavailable state.
- Demo inventory: visible **Demo Listing** marker or a clear demo catalogue notice where appropriate.

### Homepage acceptance criteria

- The single-image hero and finder placement match the approved concept.
- The finder is directly below the hero, not inside a floating right-hand hero panel.
- Featured vehicles use three large desktop cards per row.
- Mobile layout is intentionally designed and has no horizontal overflow.
- All prices, vehicle details, categories and badges are database-backed or clearly labelled as demo content.
- The homepage remains usable if Gemini is unavailable.
- No AI/Design Studio runtime bundle is loaded before the customer opens those experiences.
- Hero image dimensions are reserved and below-fold imagery is lazy-loaded.
- No fake statistics, testimonials, verification, stock or delivery claims are displayed.

## 5. Screen 2 — Inventory

**Route:** `/inventory`  
**Status:** Proposed V1 design direction.  
**Purpose:** Help customers quickly find and shortlist real vehicles without turning the page into a dense or slow filter dashboard.

### Approved design direction

Use the same dark luxury language as the homepage, but make Inventory more functional and compact:

- Use the selected second concept as the visual reference: a compact panoramic vehicle banner above the catalogue. It is a shallow visual header, not a second full-height hero.
- Place the page title and short description over the left side of the banner, with one optimised vehicle image on the right.
- Search, result count and sort controls above the results.
- Filter sidebar on the left on desktop.
- Three large, readable vehicle cards per row on wide desktop.
- A small floating AI Concierge launcher that opens a drawer only when clicked.
- No permanently visible chatbot column beside the inventory grid.

The inventory page should prioritise vehicle discovery and imagery. It should feel spacious rather than crammed with controls. The second generated inventory concept is the selected visual reference, but its always-visible AI chat column is intentionally removed; the vehicle grid expands into that space.

### Desktop layout

1. Global public header with Inventory selected.
2. Compact panoramic banner (approximately 190–250 px tall on desktop):
   - Static wide vehicle photograph, darkened for legible copy.
   - Eyebrow: "Premium Vehicle Inventory".
   - Heading: **"Exceptional vehicles. Real opportunities."**
   - One short sentence explaining that customers can browse or use filters to narrow the catalogue.
   - Keep the banner much shorter than the homepage hero; no carousel or video.
3. Search and results toolbar:
   - Search by make, model, trim or keyword.
   - Current result count, for example "Showing 12 of 48 vehicles" only when those values come from the query result.
   - Sort selector and compact compare shortcut.
   - Optional grid/list toggle only if both modes are fully implemented and tested.
4. Main two-column content:
   - Left filter sidebar: approximately 240–270 px.
   - Right result area: three columns on wide desktop; two columns on medium desktop/tablet.
   - Use the full result-area width for vehicle cards; do not reserve a permanent column for AI.
5. Pagination below the grid.
6. Footer and small floating AI Concierge launcher at the lower-right.

### Search and toolbar

- Search placeholder: "Search by make, model or keyword…"
- Sort options: Newest First, Price: Low to High, Price: High to Low, Year, and Mileage where the data supports it.
- Keep selected sort and search values in URL search parameters.
- Debounce free-text search by approximately 250–350 ms.
- Apply search on the server; do not download the full inventory to filter in the browser.
- Display the true result count from the server response.
- Preserve the current filter state when sorting or navigating between pages.

### Desktop filter sidebar

Keep the sidebar visually quiet: charcoal surface, subtle border, clear section labels, compact spacing and a single gold Apply Filters action where an explicit apply step is necessary.

Filter groups:

1. **Make** — available makes from published inventory.
2. **Model** — options narrowed by selected make, where practical.
3. **Body Type** — SUV, Sedan, Coupe, Pickup, Hatchback, Van and other types only when present in inventory.
4. **Price Range** — min/max range with the currency clearly displayed. Never combine different currencies into one misleading range.
5. **Year** — min/max or supported year selection.
6. **Mileage** — optional range when mileage is recorded.
7. **Fuel Type** — Petrol, Diesel, Hybrid, Electric and other supported types.
8. **Transmission** — Automatic, Manual and other supported values.
9. **Exterior Colour** — labelled swatches and accessible names.
10. **Features** — a small set of useful features such as Leather Seats, Panoramic Roof, 360° Camera and Apple CarPlay only when those fields exist in inventory.

Sidebar behaviour:
- Show selected filters as removable chips above results.
- Offer Reset All / Clear Filters.
- Use collapsible groups for long lists.
- Do not create fake makes, colours, feature counts or available filter values.
- Filter option counts are optional; omit them unless accurately calculated.
- Avoid a giant all-filters form occupying the first viewport.
- Use URL parameters as the canonical shareable filter state.

### Mobile filters

- Replace the desktop sidebar with a Filters button opening an accessible bottom sheet or full-height drawer.
- Show the active filter count on the button.
- The drawer contains the same filter controls as desktop.
- Provide Clear All and Apply Filters actions.
- Keep the panoramic banner shallow on mobile and use an appropriate image crop.
- Keep applied filter chips and sort accessible above results.
- The drawer must support keyboard focus, escape-to-close, scroll containment and touch-friendly controls.
- Do not render the desktop sidebar off-screen or hide it with CSS while still loading its controls.

### Vehicle result cards

Wide desktop: three cards per row.  
Medium desktop/tablet: two cards per row where there is sufficient width.  
Narrow mobile: one card per row.

Each card contains:

- Consistent landscape vehicle image, approximately 16:10.
- A small factual badge when supported, such as Featured, New Arrival, Reserved or Demo Listing.
- Favourite control.
- Make, model, trim and year.
- One concise metadata line such as body type and transmission.
- Price and its stored currency, or "Price on request".
- Up to three relevant specification highlights, chosen from recorded engine, fuel, mileage, seating or drivetrain values.
- View Details as the primary card navigation.
- Compare as a secondary action.

Do not squeeze every specification onto the card. Put full specifications on the vehicle detail page. Keep card height, image crop, price position and action placement consistent.

All vehicle card information must come from the vehicle record. Demo vehicles must be visibly labelled as demo content. Never invent availability, mileage, engine output, price, popularity or stock status to make the grid look fuller.

### Compare behaviour

- Compare action adds/removes a vehicle from the local compare selection.
- Maximum of three vehicles.
- A compact compare tray appears only when at least one vehicle is selected.
- The tray shows selected vehicle thumbnails/names and a Compare button.
- Disable adding a fourth vehicle and explain the limit.
- Compare selection persists locally in the current browser only; no customer account is required.
- If a selected vehicle becomes unpublished, sold or unavailable, reconcile it before comparison and tell the customer.
- The compare tray must not cover card actions or obscure mobile content.

### AI Concierge entry point

- Show a small floating **Ask AI Concierge** launcher at the lower-right on desktop.
- On mobile, use a compact button that does not obscure the result grid or pagination.
- Clicking opens a side drawer on desktop and a full-height/bottom-sheet experience on mobile.
- Load the chat component, AI client code and conversation UI only when opened.
- Do not automatically send a prompt or call Gemini when Inventory first loads.
- Include the current search/filter context when the user explicitly opens the Concierge and chooses to use it.
- The Concierge remains a helper, not a required route through the catalogue.

### Pagination

- Default page size: 12 vehicles.
- Pagination and sorting are server/database-backed.
- Keep active filters and sort in the URL when moving between pages.
- Show the current page and a small set of page links plus previous/next.
- Avoid infinite scroll in V1; explicit pagination is predictable, shareable and lighter to maintain.
- If the filtered result set changes and the current page becomes invalid, return a clear empty state or reset to the first valid page.

### Inventory API and query contract

The public `GET /api/vehicles` endpoint accepts a validated set of query parameters:

- `q`: make/model/trim/keyword search.
- `make`, `model`, `bodyType`.
- `minPrice`, `maxPrice`, and `currency`.
- `minYear`, `maxYear`.
- `minMileage`, `maxMileage`.
- `fuelType`, `transmission`, `exteriorColour`.
- `features` as a bounded list of supported feature keys.
- `sort`, `page`, `pageSize`.

Rules:
- Validate all query inputs with Zod.
- Use allowlisted sort keys and bounded page/pageSize.
- Default to 12 results and enforce a maximum page size.
- Apply filters in Prisma/PostgreSQL, not after fetching all records.
- Return only fields needed by cards and filter facets.
- Use indexed fields and inspect query plans for the real search patterns.
- Apply price filters within one currency only. A request without a currency should not silently mix currencies.
- Return a stable result shape including items, page, pageSize, total, totalPages, and available filter facets where appropriate.
- Exclude draft, archived and sold vehicles from default available results. Reserved vehicles can be shown only with a clear status and according to the selected availability filter.

### Loading, empty and error states

- **Initial loading:** stable card skeletons with fixed image aspect ratio; avoid large animated shimmer.
- **No inventory:** explain that the catalogue is being updated and provide a contact link only if configured.
- **No matches:** show the applied filter chips and a Clear Filters action.
- **Search error:** show a concise message and Retry action; keep the page shell usable.
- **Image failure:** use a neutral premium fallback without changing card geometry.
- **Filter option unavailable:** retain safe defaults and show a clear control state.
- **Compare empty:** no tray until the first vehicle is selected.
- **AI unavailable:** normal inventory functionality remains usable; the launcher can show a disabled/limited explanation if the provider is not configured.
- **Sold or reserved record:** show its real status and make the next available action clear.

### Performance constraints

- Keep the inventory page and cards as Server Components by default.
- Use small client-side islands for filters, compare, favourites and the mobile filter drawer.
- Server-render the first page of 12 vehicles.
- Fetch only fields required for the current result cards.
- Use Next.js image optimisation, explicit dimensions/aspect ratios, accurate `sizes` and lazy loading for below-fold cards.
- Do not fetch full-resolution vehicle-gallery images for inventory cards.
- Debounce search and ignore stale responses.
- Do not load AI code, Gemini SDK, Design Studio assets, or admin code on initial Inventory render.
- AI drawer is dynamically imported only after the customer opens it.
- No infinite-scroll machinery, live polling, large charts or complex grid animation.
- Keep card hover effects to a small transform/opacity transition.
- The page must remain useful without JavaScript for core content and navigation wherever practical.

### Inventory acceptance criteria

- Search, sorting, filters and pagination work together and are represented in the URL.
- All filtering and pagination happen at the database/server layer.
- The first page displays no more than 12 vehicles by default.
- Three large cards appear per row on wide desktop.
- The desktop sidebar becomes an accessible mobile filter drawer.
- Cards use consistent dimensions and data-backed content.
- Compare supports a maximum of three vehicles.
- AI Concierge loads only when the customer opens it.
- No fictional filter counts, vehicles, prices, specifications or availability claims appear.
- Loading, empty, error, unavailable and no-match states are designed.
- The page is tested on mobile and desktop under constrained network/CPU settings.

## 6. Screen 3 — Vehicle detail

**Route:** `/vehicles/[slug]`  
**Status:** Proposed V1 design direction; visual concept created for review.  
**Purpose:** Help the customer understand the actual vehicle, decide whether it fits their needs, and take a clear next step with the dealership.

### Approved design direction

Use the same premium black/charcoal and restrained amber-gold visual language as the homepage and Inventory.

The page is a vehicle detail experience, not a cart/checkout page:
- Large vehicle photography is the visual focus.
- A compact information and action panel sits alongside the gallery on desktop.
- Price and availability are prominent but must be factual and current.
- Enquiry is the primary action; test-drive request is the clear secondary action.
- Save, compare and Design Studio actions are available without competing with the main actions.
- No payment button, checkout/cart or reservation promise appears in Release 1.

### Desktop layout

1. Global public header.
2. Breadcrumbs: Home → Inventory → Body Type (when known) → Vehicle name.
3. Main two-column area:
   - Left: approximately 60–65% width for the image gallery.
   - Right: approximately 35–40% for the vehicle summary/action card.
4. A thin thumbnail strip below the main image.
5. Vehicle information sections below the main two-column area.
6. Similar available vehicles.
7. Footer.

The summary card may use sticky positioning while the gallery and main details are in view, but it must stop before colliding with the footer and must not create nested scroll areas.

### Vehicle image gallery

- Show one large lead image with a stable landscape aspect ratio.
- Use a dark neutral background and consistent image fit/crop.
- Provide previous/next buttons only when multiple images exist.
- Show a thumbnail strip with a clear selected state; show a remaining-image count if the gallery contains more thumbnails than fit.
- Provide an accessible open-large-image/lightbox control.
- Keyboard users can navigate the gallery and close the lightbox with Escape.
- The image alt text comes from the vehicle's make/model and image description where available.
- A neutral premium fallback is shown when the primary image is missing.
- If there is only one image, hide unnecessary arrows and thumbnail controls.
- Do not autoplay a gallery, video or 360-degree viewer in V1.

### Vehicle summary and action panel

Display fields only when stored on the selected listing:

1. Listing/status badge: Available, Reserved, Sold or other configured public state.
2. Demo Listing label where the vehicle is demonstration data.
3. Make, model, trim and year.
4. Condition where recorded (for example new or used).
5. Price with currency, or **Price on request** if no price exists.
6. A concise row of up to four key facts from available data: engine, power, fuel, transmission, drivetrain, seats or mileage.

Price rules:
- Never infer currency from the browser, location or language.
- Never invent or calculate a market price.
- The price displayed is the current listing price; if it changes after the customer saved the vehicle, My Garage can show a price-changed notice.
- Demonstration prices must carry a clear **Illustrative demo price** or Demo Listing marker.
- A price on request must not be rendered as zero or as a fake placeholder amount.

### Primary customer actions

**Enquire Now**
- Primary gold full-width action in the summary card.
- Opens an accessible modal/drawer or dedicated enquiry step.
- The vehicle is preselected and shown in the form summary.
- Collect customer name, email, phone and optional message.
- Guest submissions are allowed.
- Explain that the dealership will use the supplied contact details to respond.
- On submit, create a persisted Enquiry and show a reference/acknowledgement.
- Never imply that submitting an enquiry reserves the vehicle or locks its price.

**Request a Test Drive**
- Secondary outlined action.
- Opens a form prefilled with the vehicle.
- Collect name, email, phone, preferred date, preferred time and optional note.
- Clearly state that this is a request; the dealership confirms date/time separately.
- Persist as REQUESTED and show an acknowledgement/reference.
- Do not expose fake available appointment slots in V1.

**Save to My Garage**
- Guest: save the listing locally in the current browser and explain that cross-device sync requires an account in Release 2.
- Registered customer (Release 2): persist under their authenticated account.
- A saved vehicle remains in the customer's history if it later becomes sold or unavailable; show its actual current status.

**Compare**
- Add/remove the vehicle from the current local compare selection.
- Maximum of three actual listings.
- Provide a visible selected state and clear feedback if the limit is reached.

**Build Your Version**
- Show only if the vehicle has active Design Studio options and preview assets.
- Navigate to `/studio/[slug]`.
- If no options are configured, hide or disable the action with a brief explanation; do not imply unsupported configurability.

**Request a Quote / Talk to a Specialist**
- A quote request in Release 1 is an enquiry for dealership follow-up, not a formal payable quote.
- Human contact uses configured business channels only.
- A formal versioned quote and payment flow belong to Release 3.

### Ask AI about this vehicle

- A small secondary action can say **Ask AI about this vehicle** near the overview/specification content.
- It opens the AI Concierge drawer or route only after the customer clicks.
- Pass the vehicle ID and a limited set of safe public listing facts as context; the server re-fetches authoritative data.
- The assistant can explain listed specifications, compare this listing with other actual inventory, describe relevant trade-offs and suggest questions to ask the dealership.
- It must distinguish listing facts from general advice and identify fields that are missing.
- It cannot confirm stock, negotiate/approve a price, reserve the vehicle, generate a formal quote, book a test drive or take payment.
- Do not send customer name, email, phone or private enquiry content to Gemini.
- Do not load the AI SDK or chat component with the initial vehicle detail page. Dynamically load only after explicit interaction.

### Vehicle information sections

Use a simple anchored tab row or section navigation:
1. **Overview** — concise, factual description from the listing.
2. **Specifications** — structured information grouped into engine/performance, dimensions/capacity, drivetrain, fuel/transmission, mileage and other supplied fields.
3. **Features** — only features explicitly recorded for the vehicle, grouped where useful.
4. **Gallery** — full image collection, loaded as the customer explores it.
5. **Similar Vehicles** — a small number of relevant current Ritewheel listings.

Do not show empty specification labels or generic feature lists that have not been verified. If a fact is unknown, omit it or state **Not provided** where its absence matters to the customer.

### Similar vehicles

- Recommend up to three actual published Ritewheel listings.
- Use server-side matching based on a modest combination of body type, make, budget band, year, seats or other available facts.
- Label recommendations as similar alternatives, not AI-confirmed equivalents.
- Exclude the current vehicle.
- Revalidate current status before display.
- If there are no suitable alternatives, show a clear link back to Inventory rather than fabricated vehicles.

### Status and unavailable states

**Available**
- Show current price and normal enquiry/test-drive actions.

**Reserved**
- Show a clear Reserved badge and explain that the vehicle may not be immediately obtainable.
- Customer can ask for status clarification or similar alternatives.
- Do not imply that a new customer can reserve it.

**Sold**
- Preserve the detail page when reached through an old link or saved item.
- Show Sold / No longer available.
- Disable actions that imply the vehicle can be purchased or test-driven now.
- Offer similar current stock and a sourcing request.

**Unpublished / archived / no longer publicly listed**
- Do not expose private listing fields.
- For a stale direct link, show a polite unavailable state and links to Inventory or Contact.

**Missing price**
- Show Price on request and allow a price enquiry.

**Missing facts/images**
- Omit empty facts, use a neutral image fallback, and never fabricate data.

### Mobile layout

- Header and breadcrumbs remain compact.
- Main gallery is full width, followed by name, year/trim, status and price.
- Show one row of concise key facts where space permits; otherwise use a compact two-column summary.
- Primary actions remain easy to tap.
- A restrained sticky bottom action bar may show Enquire and a secondary action while scrolling. It must account for safe-area insets and never cover content, gallery controls, forms or the mobile navigation.
- Save, Compare and Design Studio actions move into the summary/action section rather than crowding the sticky bar.
- Tabs/section links may horizontally scroll with accessible labels.
- Similar vehicles stack as one card per row.
- No horizontal page overflow.

### Loading, empty and error states

- Server-render the vehicle name, core summary and lead image when the listing is available.
- If the slug does not exist or the listing is no longer public, return the correct not-found/unavailable state without leaking private fields.
- Enquiry validation errors appear beside the corresponding fields.
- Enquiry success shows a reference and next-step explanation.
- Test-drive submission success explains that the dealership must confirm the request.
- Failed submission preserves safe, non-sensitive form values so the customer does not have to start again.
- Gallery image failure uses a dimension-preserving fallback.
- Similar vehicles can fail independently; their failure must not break the detail page.
- AI unavailable state must not affect ordinary vehicle content, enquiry or compare actions.

### Performance constraints

- Fetch one public vehicle record plus only the image/specification/feature relations required for this page.
- Use Server Components for the primary page, summary and information sections by default.
- Use small client-side islands for gallery selection, lightbox, compare, favourites and enquiry/test-drive forms.
- Use Next.js image optimisation with explicit aspect ratios and accurate `sizes`.
- Prioritise only the lead gallery image. Do not eagerly download every gallery image.
- Load small thumbnails for the visible strip; lazy-load additional images and dynamically import the lightbox only when opened.
- Avoid autoplay video, 3D models, large image compositing and heavy carousel packages.
- Dynamically load AI code only after the customer chooses Ask AI.
- Keep enquiry/test-drive forms lightweight and avoid loading them until opened if they are modal/drawer forms.
- Do not poll the vehicle status. Revalidate server-side when a customer submits a new enquiry/test-drive request and again before future quote/reservation operations.
- Reserve gallery and card geometry to avoid CLS.

### Vehicle detail acceptance criteria

- The actual listing name, price/currency, status, condition, specs and features are database-backed.
- Demo data and demo prices are clearly labelled.
- Desktop uses the gallery/action-panel layout; mobile has a deliberate stacked layout.
- Enquiry and test-drive requests are persisted and show clear confirmation.
- A test-drive request is never presented as confirmed before staff acceptance.
- Save and Compare work without requiring an account.
- Build Your Version only appears for supported vehicles.
- AI is contextual and opens only when the customer chooses it.
- Sold/reserved/unavailable/missing-price states are honest and useful.
- Similar vehicles are actual listings.
- Main vehicle content remains usable if Gemini is unavailable.
- Gallery images, lightbox and feature code load on demand.
- Mobile/desktop performance and accessibility checks pass.

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
