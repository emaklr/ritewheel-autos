import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Contact Ritewheel" };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <section className="feature-coming-soon">
          <span className="eyebrow">TALK TO RITEWHEEL</span>
          <h1>Human help, when you need it.</h1>
          <p className="feature-coming-lead">The dealership contact channels have not been configured for this preview. We will publish verified phone, WhatsApp and email details once the business settings are supplied.</p>
          <div className="feature-coming-detail">No telephone number, email address or office location is being displayed until it has been confirmed. Enquiry and callback submissions will be enabled after the PostgreSQL database and request safeguards are connected.</div>
          <div className="hero-actions"><Link href="/inventory" className="button button-gold">Continue browsing →</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
