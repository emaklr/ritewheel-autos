import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeatureComingSoon } from "@/components/feature-coming-soon";

export const metadata: Metadata = { title: "Vehicle Design Studio" };

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <main className="feature-page container">
        <FeatureComingSoon
          eyebrow="RITEWHEEL DESIGN STUDIO"
          title="Make your next vehicle feel like yours."
          description="Explore supported exterior colours, finishes, wheels and interior options with curated vehicle previews."
          detail="The first configurator will use vehicle-specific options and mapped preview images. It will not claim live 3D rendering or arbitrary AI image editing."
        />
      </main>
      <SiteFooter />
    </>
  );
}
