import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = { title: "Contact Ritewheel" };

type Props = {
  searchParams: Promise<{ vehicle?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const vehicleSlug = params.vehicle?.trim().slice(0, 100) || undefined;

  return (
    <>
      <SiteHeader />
      <main className="container contact-page">
        <div className="contact-page-layout">
          <section className="contact-intro">
            <span className="eyebrow">TALK TO RITEWHEEL</span>
            <h1>Human help, when you need it.</h1>
            <p>
              Ask a question about a vehicle, request more information or tell us what you are looking for.
              The dealership can review your request and follow up.
            </p>
            <div className="contact-trust-note">
              An enquiry does not reserve a vehicle, confirm a test drive or lock a price. The dealership
              must verify availability and terms separately.
            </div>
            <p className="contact-privacy-note">
              Your contact details are used to respond to this request. Do not include payment details or passwords.
            </p>
          </section>

          <section className="contact-form-panel" aria-label="Send an enquiry">
            <span className="eyebrow">SEND AN ENQUIRY</span>
            <h2>How can we help?</h2>
            {process.env.DATABASE_URL ? (
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
