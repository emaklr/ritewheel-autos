import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeatureComingSoon } from "@/components/feature-coming-soon";

export const metadata: Metadata = { title: "Request a vehicle" };

export default function SourceVehiclePage() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <FeatureComingSoon
          eyebrow="VEHICLE SOURCING"
          title="Looking for something we don't have listed?"
          description="Tell Ritewheel what you're looking for. Our sourcing workflow will let the dealership review the request and follow up when a real supply option is verified."
          detail="The sourcing request form and protected dealership queue are part of Release 1. They will be enabled after the PostgreSQL database and request safeguards are configured. No vehicle will be described as sourced until staff verify its supply, condition, price and availability."
        />
      </main>
      <SiteFooter />
    </>
  );
}
