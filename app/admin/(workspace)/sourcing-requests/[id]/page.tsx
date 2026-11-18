import Link from "next/link";
import { notFound } from "next/navigation";
import { SourcingRequestStatusForm } from "@/components/admin/sourcing-request-status-form";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function statusLabel(status: string) {
  return status.split("_").map((part) => part.charAt(0) + part.slice(1).toLowerCase()).join(" ");
}

function formatBudget(budget: { toString(): string } | null, currency: string | null) {
  if (budget === null || !currency) return "Not specified";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(budget.toString()));
}

export default async function AdminSourcingRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPrismaClient().sourcingRequest.findUnique({
    where: { id },
    select: {
      id: true, reference: true, customerName: true, email: true, phone: true,
      requestedMake: true, requestedModel: true, requestedTrim: true,
      minYear: true, maxYear: true, conditionPreference: true,
      budget: true, currency: true, mileagePreference: true,
      requiredSpecifications: true, preferredLocation: true, notes: true,
      status: true, createdAt: true, updatedAt: true,
    },
  });

  if (!item) notFound();

  const vehicleName = [item.requestedMake, item.requestedModel, item.requestedTrim]
    .filter(Boolean)
    .join(" ") || "Vehicle described by specifications";
  const yearRange = item.minYear || item.maxYear
    ? (item.minYear ?? "Any year") + " to " + (item.maxYear ?? "Any year")
    : "No year preference";

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-back-link" href="/admin/sourcing-requests">← Back to sourcing requests</Link>
          <span className="eyebrow">VEHICLE SOURCING REQUEST</span>
          <h1>{vehicleName}</h1>
          <p>Reference: {item.reference}</p>
        </div>
        <span className={"admin-status admin-status-" + item.status.toLowerCase()}>{statusLabel(item.status)}</span>
      </div>

      <div className="admin-sourcing-detail-grid">
        <section className="admin-detail-panel">
          <span className="eyebrow">CUSTOMER BRIEF</span>
          <h2>Vehicle requirements</h2>
          <div className="admin-sourcing-facts">
            <div><span>Requested vehicle</span><strong>{vehicleName}</strong></div>
            <div><span>Year range</span><strong>{yearRange}</strong></div>
            <div><span>Condition</span><strong>{item.conditionPreference || "Not specified"}</strong></div>
            <div><span>Budget</span><strong>{formatBudget(item.budget, item.currency)}</strong></div>
            <div><span>Mileage</span><strong>{item.mileagePreference || "No preference"}</strong></div>
            <div><span>Preferred location</span><strong>{item.preferredLocation || "Not specified"}</strong></div>
          </div>
          <div className="admin-sourcing-text-block">
            <span>Must-have specifications</span>
            <p>{item.requiredSpecifications?.trim() || "No additional specifications provided."}</p>
          </div>
          <div className="admin-sourcing-text-block">
            <span>Additional notes</span>
            <p>{item.notes?.trim() || "No additional notes provided."}</p>
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
            <div className="admin-contact-detail"><span>Name</span><strong>{item.customerName}</strong></div>
            <div className="admin-contact-detail"><span>Email</span><a href={"mailto:" + item.email}>{item.email}</a></div>
            <div className="admin-contact-detail"><span>Phone</span>{item.phone ? <a href={"tel:" + item.phone}>{item.phone}</a> : <strong>Not provided</strong>}</div>
          </section>

          <section className="admin-detail-panel">
            <span className="eyebrow">REQUEST PROGRESS</span>
            <h2>Update status</h2>
            <SourcingRequestStatusForm requestId={item.id} initialStatus={item.status} />
          </section>

          <div className="admin-info-note">
            <strong>Verify before making an offer</strong>
            <p>A potential match is not a confirmed supply offer. Verify the actual vehicle, condition, price and availability before any quotation or customer commitment.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
