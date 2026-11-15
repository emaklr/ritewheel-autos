import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import {
  getAvailableVehicleCategories,
  getAvailableVehicleCurrencies,
  getAvailableVehicleMakes,
  searchVehicles,
} from "@/lib/vehicles";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.trim().slice(0, 80) || undefined;
  const make = first(params.make)?.trim().slice(0, 60) || undefined;
  const bodyType = first(params.bodyType)?.trim().slice(0, 40) || undefined;
  const budgetRaw = first(params.maxBudget);
  const budgetNumber = budgetRaw ? Number(budgetRaw) : undefined;
  const maxBudget = Number.isFinite(budgetNumber) && budgetNumber! > 0 ? budgetNumber : undefined;
  const sortRaw = first(params.sort);
  const requestedSort = sortRaw === "price-low" || sortRaw === "price-high" ? sortRaw : "newest";
  const pageRaw = Number(first(params.page) ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;

  const [makes, categories, currencies] = await Promise.all([
    getAvailableVehicleMakes(),
    getAvailableVehicleCategories(),
    getAvailableVehicleCurrencies(),
  ]);

  const requestedCurrency = first(params.currency)?.toUpperCase();
  const needsCurrency = Boolean(maxBudget || requestedSort !== "newest" || requestedCurrency);
  const currency = needsCurrency
    ? currencies.includes(requestedCurrency ?? "")
      ? requestedCurrency
      : currencies.includes("NGN")
        ? "NGN"
        : currencies[0]
    : undefined;

  const results = await searchVehicles({
    q, make, bodyType, maxBudget, currency, sort: requestedSort, page, pageSize: 12,
  });

  const hasFilters = Boolean(q || make || bodyType || maxBudget || requestedCurrency);
  const query = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(make ? { make } : {}),
    ...(bodyType ? { bodyType } : {}),
    ...(maxBudget ? { maxBudget: String(maxBudget) } : {}),
    ...(currency ? { currency } : {}),
    sort: requestedSort,
  });

  return (
    <>
      <SiteHeader />
      <main>
        <section className="inventory-banner">
          <Image
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1900&q=82"
            alt="Luxury vehicle detail in a dark automotive setting"
            fill
            priority
            sizes="100vw"
          />
          <div className="inventory-banner-overlay" />
          <div className="container inventory-banner-copy">
            <span className="eyebrow">THE RITEWHEEL COLLECTION</span>
            <h1>Exceptional vehicles.<br /><em>Real possibilities.</em></h1>
            <p>Explore the collection and find the vehicle that fits your life.</p>
          </div>
        </section>

        <div className="container inventory-page">
          <div className="inventory-toolbar">
            <form action="/inventory" method="get">
              {make ? <input type="hidden" name="make" value={make} /> : null}
              {bodyType ? <input type="hidden" name="bodyType" value={bodyType} /> : null}
              {maxBudget ? <input type="hidden" name="maxBudget" value={maxBudget} /> : null}
              {currency ? <input type="hidden" name="currency" value={currency} /> : null}
              <input name="q" defaultValue={q} placeholder="Search make, model or keyword…" aria-label="Search inventory" />
              <select name="sort" defaultValue={requestedSort} aria-label="Sort vehicles">
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high ({currency ?? "NGN"})</option>
                <option value="price-high">Price: high to low ({currency ?? "NGN"})</option>
              </select>
              <button className="button button-gold button-small" type="submit">Search</button>
            </form>
            <span className="results-count">{results.total} {results.total === 1 ? "vehicle" : "vehicles"} found</span>
          </div>

          <div className="inventory-layout">
            <aside className="filter-panel">
              <div className="filter-panel-heading"><h2>Refine your search</h2>{hasFilters ? <Link href="/inventory">Clear</Link> : null}</div>
              <form action="/inventory" method="get">
                {q ? <input type="hidden" name="q" value={q} /> : null}
                <label className="field">
                  <span>Make</span>
                  <select name="make" defaultValue={make ?? ""}>
                    <option value="">Any make</option>
                    {makes.map((availableMake) => <option key={availableMake} value={availableMake}>{availableMake}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Body type</span>
                  <select name="bodyType" defaultValue={bodyType ?? ""}>
                    <option value="">Any body type</option>
                    {categories.map(({ bodyType: availableBodyType }) => <option key={availableBodyType} value={availableBodyType}>{availableBodyType}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Currency for price filters</span>
                  <select name="currency" defaultValue={currency ?? ""}>
                    <option value="">All currencies</option>
                    {currencies.map((availableCurrency) => <option key={availableCurrency} value={availableCurrency}>{availableCurrency}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Maximum budget{currency ? ` (${currency})` : ""}</span>
                  <input
                    name="maxBudget"
                    type="number"
                    min="1"
                    step="1000"
                    defaultValue={maxBudget ?? ""}
                    placeholder={currency ? `Amount in ${currency}` : "Choose currency first"}
                    disabled={!currency}
                  />
                </label>
                <input type="hidden" name="sort" value={requestedSort} />
                <button type="submit" className="button button-gold">Apply filters</button>
              </form>
              <p className="filter-help">Price sorting and budget filters are always scoped to one selected currency. Vehicle prices are never compared across currencies.</p>
            </aside>

            <section className="inventory-results" aria-label="Vehicle results">
              <div className="results-heading">
                <div><span className="eyebrow">AVAILABLE VEHICLES</span><h2>{hasFilters ? "Your search results" : "Explore the collection"}</h2></div>
                <span className="results-count">Page {results.page} of {results.totalPages}</span>
              </div>
              {results.items.length ? (
                <div className="vehicle-grid">
                  {results.items.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />)}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">NO EXACT MATCH</span>
                  <h3>We couldn't find a vehicle for those filters.</h3>
                  <p>Try broadening your search, or ask Ritewheel to help source the vehicle you want.</p>
                  <div className="hero-actions"><Link href="/inventory" className="button button-outline">Clear filters</Link><Link href="/source-vehicle" className="button button-gold">Request a vehicle ↗</Link></div>
                </div>
              )}
              {results.dataSource === "demo" ? <p className="demo-notice">You are viewing illustrative demo inventory. These are not confirmed dealership listings, prices or availability.</p> : null}
              {results.totalPages > 1 ? (
                <nav className="pagination" aria-label="Inventory pagination">
                  {page > 1 ? <Link href={`/inventory?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page - 1) }).toString()}`}>←</Link> : null}
                  <span className="current">{page}</span>
                  {page < results.totalPages ? <Link href={`/inventory?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page + 1) }).toString()}`}>→</Link> : null}
                </nav>
              ) : null}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
