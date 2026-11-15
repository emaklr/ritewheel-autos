import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = { title: "Contact Ritewheel Autos" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="container contact-page">
        <div className="contact-intro">
          <span className="eyebrow">SPEAK WITH THE TEAM</span>
          <h1>Let’s talk about your next vehicle.</h1>
          <p>Send a request and the dealership can follow up with you. Submitting this form does not reserve a vehicle or confirm a purchase.</p>
        </div>
        <EnquiryForm vehicleSlug={params.vehicle} />
      </main>
      <SiteFooter />
    </>
  );
}