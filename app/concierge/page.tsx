import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConciergeWorkspace } from "@/components/concierge/concierge-workspace";

export const metadata: Metadata = {
  title: "AI Car Concierge",
  description: "Find real Ritewheel vehicle matches, understand the trade-offs and choose your next step with dealership help.",
};

export default function ConciergePage() {
  const ready = Boolean(process.env.NVIDIA_API_KEY);

  return (
    <>
      <SiteHeader />
      {ready ? (
        <ConciergeWorkspace />
      ) : (
        <main className="container feature-page">
          <section className="feature-coming-soon concierge-unavailable">
            <span className="eyebrow">RITEWHEEL AI CONCIERGE</span>
            <h1>Find the car that fits your life.</h1>
            <p className="feature-coming-lead">The AI provider is not configured in this environment yet. The Concierge will become available when the server-side NVIDIA NIM API key is set.</p>
            <div className="feature-coming-detail">You can still search, filter, view real listings and compare vehicles using the normal inventory experience. This page will not imitate an AI response while the provider is unavailable.</div>
            <Link href="/inventory" className="button button-gold">Browse inventory →</Link>
          </section>
        </main>
      )}
      <SiteFooter />
    </>
  );
}
