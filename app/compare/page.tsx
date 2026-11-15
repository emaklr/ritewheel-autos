import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Compare vehicles" };

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <section className="feature-coming-soon">
          <span className="eyebrow">MAKE A CONFIDENT CHOICE</span>
          <h1>Compare the details that matter.</h1>
          <p className="feature-coming-lead">Ritewheel comparison will let you shortlist up to three vehicles and review their specifications side by side.</p>
          <div className="feature-coming-detail">The comparison workspace is the next customer interaction to be connected. For now, open vehicle details from the catalogue to inspect the available specifications.</div>
          <div className="hero-actions"><Link href="/inventory" className="button button-gold">Choose vehicles →</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
