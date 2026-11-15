import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="/about" />
      <main className="container about-page">
        <span className="eyebrow">ABOUT RITEWHEEL</span>
        <h1>A more considered way to find your next vehicle.</h1>
        <p>Ritewheel brings vehicle discovery, comparison and personalisation into one premium experience. We are building the platform around clear information, honest availability and helpful human follow-up.</p>
        <Link href="/inventory" className="button button-gold">Explore inventory</Link>
      </main>
      <SiteFooter />
    </>
  );
}