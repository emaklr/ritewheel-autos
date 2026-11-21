import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";
import { PurchaseIntentForm } from "@/components/purchase-intent-form";
import { TestDriveRequestForm } from "@/components/test-drive-request-form";
import { getVehicleBySlug } from "@/lib/vehicles";
import { getPublicDealershipSettings } from "@/lib/dealership-settings";

export const metadata: Metadata = { title: "Contact Ritewheel" };

type Props = {
  searchParams: Promise<{ vehicle?: string; type?: string; summary?: string }>;
};

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Price on request";
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ContactPage({ searchParams }: Props) {
  const [params, settings] = await Promise.all([searchParams, getPublicDealershipSettings()]);
  const vehicleSlug = params.vehicle?.trim().slice(0, 100) || undefined;
  const initialMessage = params.summary?.trim().slice(0, 1_900) || undefined;
  const isTestDrive = params.type === "test-drive";
  const isPurchaseIntent = params.type === "purchase";
  const vehicle = isTestDrive && vehicleSlug ? await getVehicleBySlug(vehicleSlug) : null;
  const purchaseVehicle = isPurchaseIntent && vehicleSlug ? await getVehicleBySlug(vehicleSlug) : null;
  const canRequestTestDrive = Boolean(
    process.env.DATABASE_URL &&
    vehicle?.isPublished &&
    vehicle &&
    !vehicle.isDemo &&
    vehicle.status === "AVAILABLE",
  );
  const canStartPurchase = Boolean(
    process.env.DATABASE_URL &&
    purchaseVehicle?.isPublished &&
    purchaseVehicle &&
    !purchaseVehicle.isDemo &&
    purchaseVehicle.status === "AVAILABLE",
  );
  const vehicleName = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` · ${vehicle.trim}` : ""}`
    : "";
  const purchaseVehicleName = purchaseVehicle
    ? `${purchaseVehicle.year} ${purchaseVehicle.make} ${purchaseVehicle.model}${purchaseVehicle.trim ? ` · ${purchaseVehicle.trim}` : ""}`
    : "";

  return (
    <>
      <SiteHeader />
      <main className="container contact-page">
        <div className="contact-page-layout">
          <section className="contact-intro">
            <span className="eyebrow">
              {isTestDrive ? "EXPERIENCE THE VEHICLE" : isPurchaseIntent ? "PURCHASE INTEREST" : "TALK TO RITEWHEEL"}
            </span>
            <h1>
              {isTestDrive ? "Get behind the wheel." : isPurchaseIntent ? "Take the next step." : "Human help, when you need it."}
            </h1>
            <p>
              {isTestDrive
                ? "Choose a preferred date and time. A dealership representative will review your request and contact you to confirm the appointment."
                : isPurchaseIntent
                  ? "Tell us you're interested in buying this vehicle. A Ritewheel representative will review your request and contact you to confirm the next steps."
                  : "Ask a question about a vehicle, request more information or tell us what you are looking for. The dealership can review your request and follow up."}
            </p>
            <div className="contact-trust-note">
              {isTestDrive
                ? "This is an appointment request, not a confirmed booking. Your test drive is scheduled only after the dealership confirms the exact date and time."
                : isPurchaseIntent
                  ? "This is a purchase-interest request only. It does not place an order, reserve the vehicle, lock its price or collect payment. The dealership must verify availability, condition, documents and final costs before making a formal offer."
                  : "An enquiry does not reserve a vehicle, confirm a test drive or lock a price. The dealership must verify availability and terms separately."}
            </div>
            <p className="contact-privacy-note">
              Your contact details are used to respond to this request. Do not include payment details or passwords.
            </p>

            {settings.contactPhone || settings.contactEmail || settings.whatsappNumber || settings.addressLine || settings.city || settings.state || settings.country || settings.openingHours ? (
              <div className="public-contact-details" aria-label="Dealership contact details">
                <span className="eyebrow">DEALERSHIP CONTACT</span>
                {settings.contactPhone ? <a href={"tel:" + settings.contactPhone}>Call {settings.contactPhone}</a> : null}
                {settings.contactEmail ? <a href={"mailto:" + settings.contactEmail}>{settings.contactEmail}</a> : null}
                {settings.whatsappNumber ? <a href={"https://wa.me/" + settings.whatsappNumber} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a> : null}
                {[
                  settings.addressLine,
                  settings.city,
                  settings.state,
                  settings.country,
                ].filter(Boolean).length ? (
                  <p>{[
                    settings.addressLine,
                    settings.city,
                    settings.state,
                    settings.country,
                  ].filter(Boolean).join(", ")}</p>
                ) : null}
                {settings.openingHours ? <p className="public-opening-hours">{settings.openingHours}</p> : null}
              </div>
            ) : null}
          </section>

          <section className="contact-form-panel" aria-label={isTestDrive ? "Request a test drive" : isPurchaseIntent ? "Send purchase interest" : "Send an enquiry"}>
            <span className="eyebrow">{isTestDrive ? "TEST-DRIVE REQUEST" : isPurchaseIntent ? "START A PURCHASE CONVERSATION" : "SEND AN ENQUIRY"}</span>
            <h2>{isTestDrive ? "Choose a time that suits you." : isPurchaseIntent ? "I'm interested in this vehicle." : "How can we help?"}</h2>
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
            ) : isPurchaseIntent ? (
              canStartPurchase && purchaseVehicle ? (
                <>
                  <p className="test-drive-vehicle-summary">{purchaseVehicleName}</p>
                  <p className="purchase-price-note">Indicative listed price: <strong>{formatPrice(purchaseVehicle.price, purchaseVehicle.currency)}</strong></p>
                  <PurchaseIntentForm vehicleSlug={purchaseVehicle.slug} />
                </>
              ) : (
                <div className="enquiry-disabled" role="status">
                  <strong>This vehicle is not accepting purchase-interest requests.</strong>
                  <p>
                    This action is available only for a published, non-demo vehicle currently listed as available.
                    You can contact the dealership or request that it source an illustrative model.
                  </p>
                </div>
              )
            ) : process.env.DATABASE_URL ? (
              <EnquiryForm vehicleSlug={vehicleSlug} initialMessage={initialMessage} />
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
