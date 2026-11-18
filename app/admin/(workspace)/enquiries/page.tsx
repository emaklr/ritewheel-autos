import Link from "next/link";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"] as const;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function sourceLabel(source: string) {
  return source === "VEHICLE_DETAIL" ? "Vehicle enquiry" : "General enquiry";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q)?.trim().slice(0, 100) ?? "";
  const statusRaw = first(params.status);
  const status = statuses.includes(statusRaw as (typeof statuses)[number])
    ? (statusRaw as (typeof statuses)[number])
    : undefined;
  const pageRaw = Number(first(params.page) ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;
  const pageSize = 20;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { reference: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const prisma = getPrismaClient();
  const [enquiries, total, allCount, newCount, activeCount, closedCount] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        reference: true,
        customerName: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,
        vehicle: {
          select: { slug: true, make: true, model: true, year: true },
        },
      },
    }),
    prisma.enquiry.count({ where }),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.enquiry.count({ where: { status: { in: ["CONTACTED", "QUALIFIED"] } } }),
    prisma.enquiry.count({ where: { status: { in: ["CLOSED", "SPAM"] } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return "/admin/enquiries?" + query.toString();
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CUSTOMER REQUESTS</span>
          <h1>Enquiries</h1>
          <p>Review customer questions and keep track of follow-up progress.</p>
        </div>
      </div>

      <section className="admin-metric-grid" aria-label="Enquiry overview">
        <article className="admin-metric-card">
          <span>All enquiries</span>
          <strong>{allCount}</strong>
          <small>Every customer submission</small>
        </article>
        <article className="admin-metric-card">
          <span>New</span>
          <strong>{newCount}</strong>
          <small>Awaiting first contact</small>
        </article>
        <article className="admin-metric-card">
          <span>In progress</span>
          <strong>{activeCount}</strong>
          <small>Contacted or qualified</small>
        </article>
        <article className="admin-metric-card">
          <span>Closed / spam</span>
          <strong>{closedCount}</strong>
          <small>Completed or dismissed</small>
        </article>
      </section>

      <section className="admin-panel">
        <form className="admin-filter-bar" action="/admin/enquiries" method="get">
          <label className="admin-search-field">
            <span className="sr-only">Search enquiries</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone or reference…"
              maxLength={100}
            />
          </label>
          <label className="admin-select-field">
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={status ?? ""}>
              <option value="">All statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>{statusLabel(value)}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-outline button-small">Apply filters</button>
          {(q || status) ? (
            <Link className="admin-clear-filter" href="/admin/enquiries">Clear</Link>
          ) : null}
          <span className="admin-filter-count">
            {total} {total === 1 ? "enquiry" : "enquiries"}
          </span>
        </form>

        {enquiries.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-enquiry-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle / request</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td>
                        <div className="admin-enquiry-customer">
                          <strong>{enquiry.customerName}</strong>
                          <small>{enquiry.email}</small>
                          {enquiry.phone ? <small>{enquiry.phone}</small> : null}
                          <small>{enquiry.reference}</small>
                        </div>
                      </td>
                      <td>
                        {enquiry.vehicle ? (
                          <div className="admin-enquiry-vehicle">
                            <strong>{enquiry.vehicle.make} {enquiry.vehicle.model}</strong>
                            <small>{enquiry.vehicle.year} · {sourceLabel(enquiry.source)}</small>
                          </div>
                        ) : (
                          <div className="admin-enquiry-vehicle">
                            <strong>General enquiry</strong>
                            <small>{sourceLabel(enquiry.source)}</small>
                          </div>
                        )}
                      </td>
                      <td>{formatDate(enquiry.createdAt)}</td>
                      <td>
                        <span className={"admin-status admin-status-" + enquiry.status.toLowerCase()}>
                          {statusLabel(enquiry.status)}
                        </span>
                      </td>
                      <td>
                        <Link className="admin-row-link" href={"/admin/enquiries/" + enquiry.id}>
                          View
                        </Link>
                      </td>
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
            <span className="admin-empty-icon">✉</span>
            <h3>{q || status ? "No enquiries match those filters." : "No enquiries yet."}</h3>
            <p>
              {q || status
                ? "Try another search or clear the filters."
                : "Customer submissions from the public enquiry forms will appear here."}
            </p>
            {q || status ? (
              <Link className="button button-outline button-small" href="/admin/enquiries">Clear filters</Link>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
