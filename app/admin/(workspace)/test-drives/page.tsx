import Link from "next/link";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

const statuses = ["REQUESTED", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatDateTime(date: Date, time: string) {
  return `${formatDate(date)} · ${time} WAT`;
}

export default async function AdminTestDrivesPage({
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
    ...(q ? {
      OR: [
        { customerName: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
        { reference: { contains: q, mode: "insensitive" as const } },
        { vehicle: { is: { OR: [
          { make: { contains: q, mode: "insensitive" as const } },
          { model: { contains: q, mode: "insensitive" as const } },
        ] } } },
      ],
    } : {}),
  };

  const prisma = getPrismaClient();
  const [requests, total, requestedCount, acceptedCount, completedCount, otherCount] = await Promise.all([
    prisma.testDriveRequest.findMany({
      where,
      orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, reference: true, customerName: true, phone: true,
        preferredDate: true, preferredTime: true, confirmedDate: true, confirmedTime: true,
        status: true, createdAt: true,
        vehicle: { select: { slug: true, make: true, model: true, trim: true, year: true } },
      },
    }),
    prisma.testDriveRequest.count({ where }),
    prisma.testDriveRequest.count({ where: { status: "REQUESTED" } }),
    prisma.testDriveRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.testDriveRequest.count({ where: { status: "COMPLETED" } }),
    prisma.testDriveRequest.count({ where: { status: { in: ["DECLINED", "CANCELLED"] } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return "/admin/test-drives?" + query.toString();
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CUSTOMER APPOINTMENTS</span>
          <h1>Test Drives</h1>
          <p>Review preferred slots and confirm appointments with exact dates and times.</p>
        </div>
      </div>

      <section className="admin-metric-grid" aria-label="Test-drive overview">
        <article className="admin-metric-card"><span>Requested</span><strong>{requestedCount}</strong><small>Awaiting a dealership decision</small></article>
        <article className="admin-metric-card"><span>Accepted</span><strong>{acceptedCount}</strong><small>Confirmed appointments</small></article>
        <article className="admin-metric-card"><span>Completed</span><strong>{completedCount}</strong><small>Test drives marked complete</small></article>
        <article className="admin-metric-card"><span>Declined / cancelled</span><strong>{otherCount}</strong><small>Not proceeding</small></article>
      </section>

      <section className="admin-panel">
        <form className="admin-filter-bar" action="/admin/test-drives" method="get">
          <label className="admin-search-field">
            <span className="sr-only">Search test-drive requests</span>
            <input name="q" defaultValue={q} placeholder="Search customer, vehicle or reference…" maxLength={100} />
          </label>
          <label className="admin-select-field">
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={status ?? ""}>
              <option value="">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
            </select>
          </label>
          <button type="submit" className="button button-outline button-small">Apply filters</button>
          {(q || status) ? <Link className="admin-clear-filter" href="/admin/test-drives">Clear</Link> : null}
          <span className="admin-filter-count">{total} {total === 1 ? "request" : "requests"}</span>
        </form>

        {requests.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-test-drive-table">
                <thead><tr><th>Customer</th><th>Vehicle</th><th>Preferred slot</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {requests.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-enquiry-customer">
                          <strong>{item.customerName}</strong>
                          <small>{item.phone}</small>
                          <small>{item.reference}</small>
                        </div>
                      </td>
                      <td>
                        <div className="admin-enquiry-vehicle">
                          <strong>{item.vehicle.make} {item.vehicle.model}</strong>
                          <small>{item.vehicle.year}{item.vehicle.trim ? " · " + item.vehicle.trim : ""}</small>
                        </div>
                      </td>
                      <td>
                        <strong>{formatDateTime(item.preferredDate, item.preferredTime)}</strong>
                        {item.confirmedDate && item.confirmedTime ? <small className="admin-confirmed-slot">Confirmed: {formatDateTime(item.confirmedDate, item.confirmedTime)}</small> : null}
                      </td>
                      <td><span className={"admin-status admin-status-" + item.status.toLowerCase()}>{statusLabel(item.status)}</span></td>
                      <td><Link className="admin-row-link" href={"/admin/test-drives/" + item.id}>Review</Link></td>
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
            <span className="admin-empty-icon">◷</span>
            <h3>{q || status ? "No test-drive requests match those filters." : "No test-drive requests yet."}</h3>
            <p>{q || status ? "Try another search or clear the filters." : "Customer requests for test drives will appear here."}</p>
            {q || status ? <Link className="button button-outline button-small" href="/admin/test-drives">Clear filters</Link> : null}
          </div>
        )}
      </section>
    </>
  );
}
