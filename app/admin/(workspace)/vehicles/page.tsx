import Image from "next/image";
import Link from "next/link";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const statuses = ["DRAFT", "AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"] as const;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function formatPrice(price: { toString(): string } | null, currency: string) {
  if (price === null) return "Price on request";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price.toString()));
}

export default async function AdminVehiclesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.trim().slice(0, 80) ?? "";
  const statusRaw = first(params.status);
  const status = statuses.includes(statusRaw as typeof statuses[number])
    ? statusRaw as typeof statuses[number]
    : undefined;
  const pageRaw = Number(first(params.page) ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;
  const pageSize = 20;

  const where = {
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { make: { contains: q, mode: "insensitive" as const } },
        { model: { contains: q, mode: "insensitive" as const } },
        { trim: { contains: q, mode: "insensitive" as const } },
        { slug: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const prisma = getPrismaClient();
  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, slug: true, make: true, model: true, trim: true, year: true,
        price: true, currency: true, status: true, featured: true, isDemo: true,
        publishedAt: true, updatedAt: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return `/admin/vehicles?${query.toString()}`;
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CATALOGUE MANAGEMENT</span>
          <h1>Vehicle inventory</h1>
          <p>Maintain listing details, pricing, images and public availability.</p>
        </div>
        <Link className="button button-gold" href="/admin/vehicles/new">＋ Add vehicle</Link>
      </div>

      <section className="admin-panel">
        <form className="admin-filter-bar" action="/admin/vehicles" method="get">
          <label className="admin-search-field">
            <span className="sr-only">Search inventory</span>
            <input name="q" defaultValue={q} placeholder="Search make, model, trim or slug…" maxLength={80} />
          </label>
          <label className="admin-select-field">
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={status ?? ""}>
              <option value="">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button type="submit" className="button button-outline button-small">Apply filters</button>
          {(q || status) ? <Link className="admin-clear-filter" href="/admin/vehicles">Clear</Link> : null}
          <span className="admin-filter-count">{total} {total === 1 ? "vehicle" : "vehicles"}</span>
        </form>

        {vehicles.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-inventory-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Publication</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <div className="admin-vehicle-cell">
                          <div className="admin-vehicle-thumb">
                            {vehicle.images[0]?.url
                              ? <Image src={vehicle.images[0].url} alt={vehicle.images[0].altText ?? `${vehicle.make} ${vehicle.model}`} width={76} height={54} unoptimized />
                              : <span>{vehicle.make.slice(0, 1)}</span>}
                          </div>
                          <div>
                            <strong>{vehicle.make} {vehicle.model}</strong>
                            <small>
                              {vehicle.trim ?? "No trim"}{vehicle.featured ? " · Featured" : ""}{vehicle.isDemo ? " · Demo" : ""}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{vehicle.year}</td>
                      <td>{formatPrice(vehicle.price, vehicle.currency)}</td>
                      <td><span className={`admin-status admin-status-${vehicle.status.toLowerCase()}`}>{vehicle.status}</span></td>
                      <td>{vehicle.publishedAt ? "Published" : "Unpublished"}</td>
                      <td>{new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(vehicle.updatedAt)}</td>
                      <td><Link className="admin-row-link" href={`/admin/vehicles/${vehicle.id}`}>Edit</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <span>Page {page} of {totalPages}</span>
              <div>
                {page > 1 ? <Link href={makeHref(page - 1)}>← Previous</Link> : null}
                {page < totalPages ? <Link href={makeHref(page + 1)}>Next →</Link> : null}
              </div>
            </div>
          </>
        ) : (
          <div className="admin-empty-state">
            <span className="admin-empty-icon">⌕</span>
            <h3>{q || status ? "No vehicles match those filters." : "No vehicles yet."}</h3>
            <p>{q || status ? "Try another search or clear the filters." : "Add a listing to get your dealership catalogue started."}</p>
            {q || status
              ? <Link className="button button-outline button-small" href="/admin/vehicles">Clear filters</Link>
              : <Link className="button button-gold button-small" href="/admin/vehicles/new">Add vehicle</Link>}
          </div>
        )}
      </section>
    </>
  );
}
