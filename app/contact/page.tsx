import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";
import { TestDriveRequestForm } from "@/components/test-drive-request-form";
import { getVehicleBySlug } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Contact Ritewheel" };

type Props = {
  searchParams: Promise<{ vehicle?: string; type?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const vehicleSlug = params.vehicle?.trim().slice(0, 100) || undefined;
  const isTestDrive = params.type === "test-drive";
  const vehicle = isTestDrive && vehicleSlug ? await getVehicleBySlug(vehicleSlug) : null;
  const canRequestTestDrive = Boolean(
    process.env.DATABASE_URL &&
    vehicle &&
    !vehicle.isDemo &&
    vehicle.status === "AVAILABLE",
  );
  const vehicleName = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` · ${vehicle.trim}` : ""}`
    : "";

  return (
    <>
      <SiteHeader />
      <main className="container contact-page">
        <div className="contact-page-layout">
          <section className="contact-intro">
            <span className="eyebrow">{isTestDrive ? "EXPERIENCE THE VEHICLE" : "TALK TO RITEWHEEL"}</span>
            <h1>{isTestDrive ? "Get behind the wheel." : "Human help, when you need it."}</h1>
            <p>
              {isTestDrive
                ? "Choose a preferred date and time. A dealership representative will review your request and contact you to confirm the appointment."
                : "Ask a question about a vehicle, request more information or tell us what you are looking for. The dealership can review your request and follow up."}
            </p>
            <div className="contact-trust-note">
              {isTestDrive
                ? "This is an appointment request, not a confirmed booking. Your test drive is scheduled only after the dealership confirms the exact date and time."
                : "An enquiry does not reserve a vehicle, confirm a test drive or lock a price. The dealership must verify availability and terms separately."}
            </div>
            <p className="contact-privacy-note">
              Your contact details are used to respond to this request. Do not include payment details or passwords.
            </p>
          </section>

          <section className="contact-form-panel" aria-label={isTestDrive ? "Request a test drive" : "Send an enquiry"}>
            <span className="eyebrow">{isTestDrive ? "TEST-DRIVE REQUEST" : "SEND AN ENQUIRY"}</span>
            <h2>{isTestDrive ? "Choose a time that suits you." : "How can we help?"}</h2>
            {isTestDrive ? (
              canRequestTestDrive && vehicle ? (
                <>
                  <p className="test-drive-vehicle-summary">{vehicleName}</p>
                  <TestDriveRequestForm vehicleSlug={vehicle.slug} />
                </>
              ) : (
                <div className="enquiry-disabled" role="status">
                  <strong>This vehicle is not accepting test-drive requests.</strong>
                  <p>
                    Test drives can only be requested for a published, non-demo vehicle currently listed as available.
                    Please return to inventory or contact the dealership for help.
                  </p>
                </div>
              )
            ) : process.env.DATABASE_URL ? (
              <EnquiryForm vehicleSlug={vehicleSlug} />
            ) : (
              <div className="enquiry-disabled" role="status">
                <strong>Enquiry submissions are not connected yet.</strong>
                <p>
                  The request form will become active after the PostgreSQL database is configured and the initial
                  migration is applied. You can continue browsing the demo catalogue in the meantime.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
