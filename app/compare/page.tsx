import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LocalVehicleCollection } from "@/components/local-vehicle-collection";

export const metadata: Metadata = { title: "Compare vehicles" };

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <main className="container"><LocalVehicleCollection mode="compare" /></main>
      <SiteFooter />
    </>
  );
}
