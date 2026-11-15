import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LocalVehicleCollection } from "@/components/local-vehicle-collection";

export const metadata: Metadata = { title: "My Garage" };

export default function GaragePage() {
  return (
    <>
      <SiteHeader />
      <main className="container"><LocalVehicleCollection mode="saved" /></main>
      <SiteFooter />
    </>
  );
}
