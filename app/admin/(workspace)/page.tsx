import Link from "next/link";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPrice(price: { toString(): string } | null, currency: string) {
  if (price === null) return "Price on request";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price.toString()));
}

export default async function AdminOverviewPage() {
  const prisma = getPrismaClient();
  const [totalVehicles, availableVehicles, drafts, demoVehicles, recentVehicles] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE", publishedAt: { not: null } } }),
    prisma.vehicle.count({ where: { status: "DRAFT" } }),
    prisma.vehicle.count({ where: { isDemo: true } }),
    prisma.vehicle.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true, slug: true, make: true, model: true, trim: true, year: true,
        price: true, currency: true, status: true, isDemo: true, updatedAt: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
  ]);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">DEALERSHIP OVERVIEW</span>
          <h1>Good to see you.</h1>
          <p>Keep your vehicle catalogue accurate and up to date.</p>
        </div>
        <Link className="button button-gold" href="/admin/vehicles/new">＋ Add a vehicle</Link>
      </div>

      <section className="admin-metric-grid" aria-label="Inventory overview">
        <article className="admin-metric-card">
          <span>Total vehicles</span>
          <strong>{totalVehicles}</strong>
          <small>All records in your catalogue</small>
        </article>
        <article className="admin-metric-card">
          <span>Available vehicles</span>
          <strong>{availableVehicles}</strong>
          <small>Published and marked available</small>
        </article>
        <article className="admin-metric-card">
          <span>Draft listings</span>
          <strong>{drafts}</strong>
          <small>Not visible in public inventory</small>
        </article>
        <article className="admin-metric-card">
          <span>Demo listings</span>
          <strong>{demoVehicles}</strong>
          <small>Illustrative records, not live stock</small>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">CATALOGUE</span>
            <h2>Recently updated vehicles</h2>
          </div>
          <Link className="text-link" href="/admin/vehicles">View inventory ↗</Link>
        </div>

        {recentVehicles.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recentVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <div className="admin-vehicle-cell">
                        <div className="admin-vehicle-thumb">
                          {vehicle.images[0]?.url
                            ? <img src={vehicle.images[0].url} alt={vehicle.images[0].altText ?? `${vehicle.make} ${vehicle.model}`} />
                            : <span>{vehicle.make.slice(0, 1)}</span>}
                        </div>
                        <div>
                          <strong>{vehicle.make} {vehicle.model}</strong>
                          <small>{vehicle.trim ?? "—"}{vehicle.isDemo ? " · Demo" : ""}</small>
                        </div>
                      </div>
                    </td>
                    <td>{vehicle.year}</td>
                    <td>{formatPrice(vehicle.price, vehicle.currency)}</td>
                    <td><span className={`admin-status admin-status-${vehicle.status.toLowerCase()}`}>{vehicle.status}</span></td>
                    <td>{formatDate(vehicle.updatedAt)}</td>
                    <td><Link className="admin-row-link" href={`/admin/vehicles/${vehicle.id}`}>Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <span className="admin-empty-icon">▣</span>
            <h3>Your inventory starts here.</h3>
            <p>Add your first vehicle to begin building the public catalogue.</p>
            <Link className="button button-gold button-small" href="/admin/vehicles/new">Add first vehicle</Link>
          </div>
        )}
      </section>

      <div className="admin-info-note">
        <strong>Demo inventory reminder</strong>
        <p>Records marked Demo are illustrations only. Replace them with verified dealership details before presenting them as actual stock or offers.</p>
      </div>
    </>
  );
}
