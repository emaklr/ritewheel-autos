import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryStatusForm } from "@/components/admin/enquiry-status-form";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function sourceLabel(source: string) {
  if (source === "PURCHASE_INTENT") return "Purchase interest";
  return source === "VEHICLE_DETAIL" ? "Vehicle detail page" : "Contact page";
}

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await getPrismaClient().enquiry.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      customerName: true,
      email: true,
      phone: true,
      message: true,
      source: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          slug: true,
          make: true,
          model: true,
          trim: true,
          year: true,
          status: true,
          price: true,
          currency: true,
        },
      },
    },
  });

  if (!enquiry) notFound();

  const vehiclePrice = !enquiry.vehicle || enquiry.vehicle.price === null
    ? "Price not recorded"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: enquiry.vehicle.currency,
        maximumFractionDigits: 0,
      }).format(Number(enquiry.vehicle.price.toString()));

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-back-link" href="/admin/enquiries">← Back to enquiries</Link>
          <span className="eyebrow">{enquiry.source === "PURCHASE_INTENT" ? "PURCHASE INTEREST" : "ENQUIRY DETAILS"}</span>
          <h1>{enquiry.customerName}</h1>
          <p>Reference: {enquiry.reference}</p>
        </div>
        <span className={"admin-status admin-status-" + enquiry.status.toLowerCase()}>
          {enquiry.status.charAt(0) + enquiry.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="admin-enquiry-detail-grid">
        <section className="admin-detail-panel">
          <div className="admin-detail-panel-heading">
            <div>
              <span className="eyebrow">CUSTOMER MESSAGE</span>
              <h2>What they need</h2>
            </div>
            <span className="admin-detail-date">{formatDate(enquiry.createdAt)}</span>
          </div>
          <div className="admin-enquiry-message">
            {enquiry.message?.trim() || "The customer did not include an additional message."}
          </div>
          <div className="admin-detail-meta">
            <span>Source</span>
            <strong>{sourceLabel(enquiry.source)}</strong>
            <span>Last updated</span>
            <strong>{formatDate(enquiry.updatedAt)}</strong>
          </div>
        </section>

        <aside className="admin-detail-side">
          <section className="admin-detail-panel">
            <span className="eyebrow">CUSTOMER CONTACT</span>
            <h2>Contact details</h2>
            <div className="admin-contact-detail">
              <span>Email</span>
              <a href={"mailto:" + enquiry.email}>{enquiry.email}</a>
            </div>
            <div className="admin-contact-detail">
              <span>Phone</span>
              {enquiry.phone
                ? <a href={"tel:" + enquiry.phone}>{enquiry.phone}</a>
                : <strong>Not provided</strong>}
            </div>
          </section>

          <section className="admin-detail-panel">
            <span className="eyebrow">FOLLOW-UP</span>
            <h2>Enquiry status</h2>
            <EnquiryStatusForm enquiryId={enquiry.id} initialStatus={enquiry.status} />
          </section>

          {enquiry.vehicle ? (
            <section className="admin-detail-panel">
              <span className="eyebrow">VEHICLE OF INTEREST</span>
              <h2>{enquiry.vehicle.make} {enquiry.vehicle.model}</h2>
              <p className="admin-detail-vehicle-meta">
                {enquiry.vehicle.year}{enquiry.vehicle.trim ? " · " + enquiry.vehicle.trim : ""}
              </p>
              <p className="admin-detail-vehicle-meta">Current listed price: {vehiclePrice}</p>
              <p className="admin-detail-vehicle-meta">Current listing status: {enquiry.vehicle.status}</p>
              <Link
                className="text-link"
                href={"/vehicles/" + enquiry.vehicle.slug}
                target="_blank"
                rel="noreferrer"
              >
                Open public listing ↗
              </Link>
            </section>
          ) : (
            <section className="admin-detail-panel">
              <span className="eyebrow">REQUEST TYPE</span>
              <h2>General enquiry</h2>
              <p className="admin-detail-vehicle-meta">No specific vehicle was attached to this request.</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
