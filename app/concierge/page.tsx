import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default function ConciergePage() {
  const configured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return (
    <>
      <SiteHeader active="/concierge" />
      <main className="container concierge-placeholder">
        <div className="feature-panel feature-panel-centered">
          <span className="eyebrow">RITEWHEEL AI CONCIERGE</span>
          <h1>Find the car that fits your life.</h1>
          <p>{configured ? "The AI provider key is present. The grounded inventory assistant is the next integration step." : "The AI Concierge is being connected. The marketplace and inventory search are available while the AI service is configured."}</p>
          <Link href="/inventory" className="button button-gold">Browse vehicle listings</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}