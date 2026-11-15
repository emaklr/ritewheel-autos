import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vehicle Inventory", description: "Browse and filter the Ritewheel Autos vehicle collection." };

type SearchParams = {
  q?: string; make?: string; bodyType?: string; maxPrice?: string;
  currency?: string; sort?: "newest" | "price-asc" | "price-desc" | "year"; page?: string;
};

function positiveNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = ["newest", "price-asc", "price-desc", "year"].includes(params.sort ?? "") ? params.sort : "newest";
  const result = await getVehicles({
    q: params.q?.slice(0, 80),
    make: params.make,
    bodyType: params.bodyType,
    maxPrice: positiveNumber(params.maxPrice),
    currency: params.currency ?? "NGN",
    sort,
    page,
    pageSize: 12
  });

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.make) query.set("make", params.make);
  if (params.bodyType) query.set("bodyType", params.bodyType);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.currency) query.set("currency", params.currency);
  if (sort && sort !== "newest") query.set("sort", sort);

  return (
    <>
      <SiteHeader active="/inventory" />
      <main>
        <section className="page-banner">
          <div className="page-banner-image"><Image src="/images/vehicles/bmw-x6.webp" alt="BMW X6 demonstration vehicle" fill priority sizes="100vw" /></div>
          <div className="page-banner-content">
            <span className="eyebrow">PREMIUM VEHICLE INVENTORY</span>
            <h1>Exceptional vehicles.<br />A more considered search.</h1>
            <p>Explore the collection, refine your preferences and open any listing for its details.</p>
          </div>
        </section>
        <div className="container inventory-layout">
          <aside className="filter-sidebar">
            <h2>Refine your search</h2>
            <form action="/inventory" method="get">
              <div className="filter-group"><label htmlFor="q">Search</label><input className="filter-control" id="q" name="q" placeholder="Make or model" defaultValue={params.q} /></div>
              <div className="filter-group"><label htmlFor="make">Make</label><select id="make" name="make" defaultValue={params.make ?? ""}><option value="">Any make</option><option>Mercedes-Benz</option><option>BMW</option><option>Land Rover</option></select></div>
              <div className="filter-group"><label htmlFor="bodyType">Body type</label><select id="bodyType" name="bodyType" defaultValue={params.bodyType ?? ""}><option value="">Any type</option><option value="SUV">SUV</option><option value="Sedan">Sedan</option><option value="Coupe">Coupe</option><option value="Pickup">Pickup</option></select></div>
              <div className="filter-group"><label htmlFor="maxPrice">Maximum budget (NGN)</label><select id="maxPrice" name="maxPrice" defaultValue={params.maxPrice ?? ""}><option value="">Any budget</option><option value="30000000">₦30 million</option><option value="50000000">₦50 million</option><option value="80000000">₦80 million</option><option value="150000000">₦150 million</option></select><input type="hidden" name="currency" value="NGN" /></div>
              <div className="filter-group"><label htmlFor="sort">Sort by</label><select id="sort" name="sort" defaultValue={sort}><option value="newest">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="year">Year</option></select></div>
              <div className="filter-actions"><button className="button button-gold" type="submit">Apply filters</button><Link href="/inventory" className="text-link text-center">Clear all filters</Link></div>
            </form>
          </aside>
          <section className="inventory-results">
            <div className="inventory-toolbar"><p><strong>{result.total}</strong> {result.total === 1 ? "vehicle" : "vehicles"} found</p><span className="eyebrow">PAGE {result.page} OF {result.totalPages}</span></div>
            {result.isDemoMode && <p className="notice notice-spaced">Demo inventory is active because DATABASE_URL is not configured. Sample vehicles are not verified offers.</p>}
            {result.items.length > 0 ? <div className="inventory-grid">{result.items.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : (
              <div className="empty-state"><h2>No vehicles match those filters</h2><p>Try a broader search or remove one of your filters. Unpriced demo listings will not match a numeric budget filter.</p><Link href="/inventory" className="button button-outline">Clear filters</Link></div>
            )}
            {result.totalPages > 1 && (
              <nav className="pagination" aria-label="Inventory pagination">
                {result.page > 1 && <Link href={"/inventory?" + new URLSearchParams({ ...Object.fromEntries(query), page: String(result.page - 1) }).toString()}>←</Link>}
                <span className="current">{result.page}</span>
                {result.page < result.totalPages && <Link href={"/inventory?" + new URLSearchParams({ ...Object.fromEntries(query), page: String(result.page + 1) }).toString()}>→</Link>}
              </nav>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}