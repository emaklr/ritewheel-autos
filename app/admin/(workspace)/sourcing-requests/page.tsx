import Link from "next/link";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

const statuses = ["NEW", "REVIEWING", "SOURCING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"] as const;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: string) {
  return status.split("_").map((part) => part.charAt(0) + part.slice(1).toLowerCase()).join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatBudget(budget: { toString(): string } | null, currency: string | null) {
  if (budget === null || !currency) return "Not specified";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(budget.toString()));
}

export default async function AdminSourcingRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q)?.trim().slice(0, 100) ?? "";
  const statusRaw = first(params.status);
  const status = statuses.includes(statusRaw as (typeof statuses)[number])
    ? statusRaw as (typeof statuses)[number]
    : undefined;
  const pageRaw = Number(first(params.page) ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;
  const pageSize = 20;

  const where = {
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { customerName: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
        { reference: { contains: q, mode: "insensitive" as const } },
        { requestedMake: { contains: q, mode: "insensitive" as const } },
        { requestedModel: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const prisma = getPrismaClient();
  const [
    requests,
    total,
    newCount,
    reviewingCount,
    sourcingCount,
    matchFoundCount,
    closedCount,
  ] = await Promise.all([
    prisma.sourcingRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, reference: true, customerName: true, email: true,
        requestedMake: true, requestedModel: true, requestedTrim: true,
        minYear: true, maxYear: true, budget: true, currency: true,
        status: true, createdAt: true,
      },
    }),
    prisma.sourcingRequest.count({ where }),
    prisma.sourcingRequest.count({ where: { status: "NEW" } }),
    prisma.sourcingRequest.count({ where: { status: "REVIEWING" } }),
    prisma.sourcingRequest.count({ where: { status: "SOURCING" } }),
    prisma.sourcingRequest.count({ where: { status: "MATCH_FOUND" } }),
    prisma.sourcingRequest.count({ where: { status: { in: ["UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"] } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return "/admin/sourcing-requests?" + query.toString();
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">VEHICLE REQUESTS</span>
          <h1>Sourcing requests</h1>
          <p>Review what customers are looking for and keep each request moving.</p>
        </div>
      </div>

      <section className="admin-metric-grid" aria-label="Vehicle sourcing overview">
        <article className="admin-metric-card"><span>New requests</span><strong>{newCount}</strong><small>Awaiting first review</small></article>
        <article className="admin-metric-card"><span>Reviewing</span><strong>{reviewingCount}</strong><small>Being assessed</small></article>
        <article className="admin-metric-card"><span>Sourcing</span><strong>{sourcingCount}</strong><small>Actively being looked for</small></article>
        <article className="admin-metric-card"><span>Match found</span><strong>{matchFoundCount}</strong><small>Potential option identified</small></article>
      </section>
      <p className="admin-sourcing-closed-count">{closedCount} requests unavailable, declined, cancelled or closed</p>

      <section className="admin-panel">
        <form className="admin-filter-bar" action="/admin/sourcing-requests" method="get">
          <label className="admin-search-field">
            <span className="sr-only">Search vehicle requests</span>
            <input name="q" defaultValue={q} placeholder="Search customer, make, model or reference…" maxLength={100} />
          </label>
          <label className="admin-select-field">
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={status ?? ""}>
              <option value="">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
            </select>
          </label>
          <button type="submit" className="button button-outline button-small">Apply filters</button>
          {(q || status) ? <Link className="admin-clear-filter" href="/admin/sourcing-requests">Clear</Link> : null}
          <span className="admin-filter-count">{total} {total === 1 ? "request" : "requests"}</span>
        </form>

        {requests.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-sourcing-table">
                <thead><tr><th>Customer</th><th>Requested vehicle</th><th>Budget</th><th>Received</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {requests.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-enquiry-customer">
                          <strong>{item.customerName}</strong>
                          <small>{item.email}</small>
                          <small>{item.reference}</small>
                        </div>
                      </td>
                      <td>
                        <div className="admin-enquiry-vehicle">
                          <strong>{[item.requestedMake, item.requestedModel].filter(Boolean).join(" ") || "Specification-led request"}</strong>
                          <small>
                            {item.minYear || item.maxYear ? (item.minYear ?? "Any") + "–" + (item.maxYear ?? "Any") : "Any year"}
                            {item.requestedTrim ? " · " + item.requestedTrim : ""}
                          </small>
                        </div>
                      </td>
                      <td>{formatBudget(item.budget, item.currency)}</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td><span className={"admin-status admin-status-" + item.status.toLowerCase()}>{statusLabel(item.status)}</span></td>
                      <td><Link className="admin-row-link" href={"/admin/sourcing-requests/" + item.id}>Review</Link></td>
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
            <h3>{q || status ? "No vehicle requests match those filters." : "No sourcing requests yet."}</h3>
            <p>{q || status ? "Try another search or clear the filters." : "Customer vehicle briefs submitted from the public sourcing form will appear here."}</p>
            {q || status ? <Link className="button button-outline button-small" href="/admin/sourcing-requests">Clear filters</Link> : null}
          </div>
        )}
      </section>
    </>
  );
}
