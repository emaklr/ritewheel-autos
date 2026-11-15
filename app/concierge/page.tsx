import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeatureComingSoon } from "@/components/feature-coming-soon";

export const metadata: Metadata = { title: "AI Car Concierge" };

export default function ConciergePage() {
  const ready = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return (
    <>
      <SiteHeader />
      <main className="feature-page container">
        <FeatureComingSoon
          eyebrow="RITEWHEEL AI CONCIERGE"
          title="Find the car that fits your life."
          description="Describe what matters to you. The Concierge will help narrow the search, compare real Ritewheel listings and explain the trade-offs."
          detail={ready
            ? "The AI provider key is configured. The conversational inventory tools and recommendation workspace are the next implementation milestone."
            : "The AI provider is not connected in this preview yet. You can still search, filter and compare the catalogue using the normal inventory experience."}
        />
      </main>
      <SiteFooter />
    </>
  );
}
