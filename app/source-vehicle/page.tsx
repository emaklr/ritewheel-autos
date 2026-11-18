import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SourcingRequestForm } from "@/components/sourcing-request-form";

export const metadata: Metadata = {
  title: "Request a vehicle",
  description: "Tell Ritewheel what vehicle you are looking for and let the dealership review your sourcing request.",
};

export default function SourceVehiclePage() {
  return (
    <>
      <SiteHeader />
      <main className="container contact-page sourcing-page">
        <div className="contact-page-layout">
          <section className="contact-intro">
            <span className="eyebrow">LOOKING FOR SOMETHING SPECIFIC?</span>
            <h1>Let us help you find it.</h1>
            <p>
              Tell us about the vehicle you have in mind. Share your preferred model, year, budget and the details
              that matter. The Ritewheel team will review your brief and let you know what may be possible.
            </p>
            <div className="contact-trust-note">
              A sourcing request is the start of a conversation, not a promise that a vehicle is available or can
              be obtained. The dealership must verify a real vehicle, its condition, price and availability before
              making an offer.
            </div>
            <p className="contact-privacy-note">
              You can submit a request without creating an account. Your details are used to respond to this request.
            </p>
            <Link href="/inventory" className="text-link sourcing-back-link">← Back to inventory</Link>
          </section>

          <section className="contact-form-panel" aria-label="Vehicle sourcing request form">
            <span className="eyebrow">YOUR VEHICLE BRIEF</span>
            <h2>What are you looking for?</h2>
            {process.env.DATABASE_URL ? (
              <SourcingRequestForm />
            ) : (
              <div className="enquiry-disabled" role="status">
                <strong>Vehicle requests are not connected yet.</strong>
                <p>The sourcing form becomes active once the dealership database is configured. You can continue exploring the demo catalogue in the meantime.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
