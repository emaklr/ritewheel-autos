import Link from "next/link";
import { notFound } from "next/navigation";
import { TestDriveStatusForm } from "@/components/admin/test-drive-status-form";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export default async function AdminTestDriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPrismaClient().testDriveRequest.findUnique({
    where: { id },
    select: {
      id: true, reference: true, customerName: true, email: true, phone: true,
      preferredDate: true, preferredTime: true, confirmedDate: true, confirmedTime: true,
      notes: true, status: true, createdAt: true, updatedAt: true,
      vehicle: {
        select: { slug: true, make: true, model: true, trim: true, year: true, status: true, price: true, currency: true },
      },
    },
  });

  if (!item) notFound();

  const dateForInput = item.confirmedDate?.toISOString().slice(0, 10) ?? item.preferredDate.toISOString().slice(0, 10);

  const price = item.vehicle.price === null
    ? "Price not recorded"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: item.vehicle.currency,
        maximumFractionDigits: 0,
      }).format(Number(item.vehicle.price.toString()));

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-back-link" href="/admin/test-drives">← Back to test drives</Link>
          <span className="eyebrow">TEST-DRIVE REQUEST</span>
          <h1>{item.customerName}</h1>
          <p>Reference: {item.reference}</p>
        </div>
        <span className={"admin-status admin-status-" + item.status.toLowerCase()}>
          {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="admin-test-drive-detail-grid">
        <section className="admin-detail-panel">
          <div className="admin-detail-panel-heading">
            <div><span className="eyebrow">CUSTOMER PREFERENCE</span><h2>Requested appointment</h2></div>
          </div>
          <div className="admin-appointment-block">
            <span>Preferred date</span>
            <strong>{formatDate(item.preferredDate)}</strong>
            <span>Preferred time</span>
            <strong>{item.preferredTime} WAT</strong>
          </div>
          {item.confirmedDate && item.confirmedTime ? (
            <div className="admin-appointment-block is-confirmed">
              <span>Confirmed appointment</span>
              <strong>{formatDate(item.confirmedDate)} · {item.confirmedTime} WAT</strong>
            </div>
          ) : null}
          <div className="admin-enquiry-message">
            {item.notes?.trim() || "The customer did not include additional notes."}
          </div>
          <div className="admin-detail-meta">
            <span>Received</span><strong>{formatDate(item.createdAt)}</strong>
            <span>Last updated</span><strong>{formatDate(item.updatedAt)}</strong>
          </div>
        </section>

        <aside className="admin-detail-side">
          <section className="admin-detail-panel">
            <span className="eyebrow">CUSTOMER CONTACT</span>
            <h2>Contact details</h2>
            <div className="admin-contact-detail"><span>Email</span><a href={"mailto:" + item.email}>{item.email}</a></div>
            <div className="admin-contact-detail"><span>Phone</span><a href={"tel:" + item.phone}>{item.phone}</a></div>
          </section>

          <section className="admin-detail-panel">
            <span className="eyebrow">APPOINTMENT DECISION</span>
            <h2>Update request</h2>
            <TestDriveStatusForm
              requestId={item.id}
              initialStatus={item.status}
              requestedDate={item.preferredDate.toISOString().slice(0, 10)}
              requestedTime={item.preferredTime}
              initialConfirmedDate={dateForInput}
              initialConfirmedTime={item.confirmedTime}
            />
          </section>

          <section className="admin-detail-panel">
            <span className="eyebrow">VEHICLE OF INTEREST</span>
            <h2>{item.vehicle.year} {item.vehicle.make} {item.vehicle.model}</h2>
            <p className="admin-detail-vehicle-meta">{item.vehicle.trim ?? "Trim not specified"}</p>
            <p className="admin-detail-vehicle-meta">Listed price: {price}</p>
            <p className="admin-detail-vehicle-meta">Current listing status: {item.vehicle.status}</p>
            <Link className="text-link" href={"/vehicles/" + item.vehicle.slug} target="_blank" rel="noreferrer">Open public listing ↗</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
