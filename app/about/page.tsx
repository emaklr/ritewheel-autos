import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "About Ritewheel" };

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <section className="feature-coming-soon">
          <span className="eyebrow">ABOUT RITEWHEEL</span>
          <h1>A clearer way to find your next vehicle.</h1>
          <p className="feature-coming-lead">Ritewheel brings vehicle discovery, thoughtful recommendations, personalisation and real dealership assistance into one experience.</p>
          <div className="about-principles">
            <article><strong>Discover confidently</strong><p>Explore vehicle information and compare the details that matter.</p></article>
            <article><strong>Choose with context</strong><p>Use AI assistance to understand options, not to replace verified vehicle information.</p></article>
            <article><strong>Get human support</strong><p>Move from online discovery to a real dealership conversation when you are ready.</p></article>
          </div>
          <div className="hero-actions"><Link href="/inventory" className="button button-gold">Explore inventory →</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
