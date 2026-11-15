import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice, vehicleTitle } from "@/lib/format";
import { VehicleCardActions } from "@/components/vehicle-card-actions";
import { getVehicleBySlug } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { vehicle } = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle not found" };
  return { title: vehicleTitle(vehicle), description: vehicle.description.slice(0, 155) };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { vehicle, isDemoMode } = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const facts: Array<[string, string | null]> = [
    ["Year", String(vehicle.year)],
    ["Body type", vehicle.bodyType],
    ["Condition", vehicle.condition],
    ["Mileage", vehicle.mileage ? vehicle.mileage.toLocaleString("en-NG") + " km" : null],
    ["Transmission", vehicle.transmission],
    ["Fuel", vehicle.fuelType],
    ["Engine", vehicle.engine],
    ["Seats", vehicle.seats ? String(vehicle.seats) : null]
  ];
  const availableFacts = facts.filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <>
      <SiteHeader active="/inventory" />
      <main className="container">
        <div className="detail-breadcrumb"><Link href="/">Home</Link> / <Link href="/inventory">Inventory</Link> / {title}</div>
        {isDemoMode && <p className="notice notice-spaced">Demo listing: this is sample catalogue content, not a verified vehicle offer. No price or availability is being represented.</p>}
        <section className="vehicle-detail-layout">
          <div>
            <div className="detail-main-image">
              <Image src={vehicle.imageUrl} alt={vehicle.images[0]?.altText ?? title} fill priority sizes="(max-width: 800px) 100vw, 65vw" />
              <span className="vehicle-badge demo-badge">{vehicle.isDemo ? "Demo listing" : vehicle.status}</span>
            </div>
            {vehicle.images.length > 1 && <div className="detail-thumbnails">{vehicle.images.slice(1, 4).map((image) => <div className="detail-main-image" key={image.url}><Image src={image.url} alt={image.altText} fill sizes="25vw" /></div>)}</div>}
          </div>
          <aside className="detail-summary">
            <span className="eyebrow">{vehicle.make}</span>
            <h1>{title}</h1>
            <p className="detail-meta">{vehicle.condition ?? "Condition not provided"} · {vehicle.bodyType}</p>
            <div className="detail-price"><strong>{formatPrice(vehicle)}</strong><span>Displayed in {vehicle.currency}. Final terms require dealership confirmation.</span></div>
            <div className="detail-specs">{availableFacts.slice(0, 4).map(([label, value]) => <div className="detail-spec" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            <div className="detail-actions"><Link href={"/contact?vehicle=" + encodeURIComponent(vehicle.slug)} className="button button-gold">Enquire about this vehicle</Link><Link href="/inventory" className="button button-outline">Continue browsing</Link></div>
            <VehicleCardActions vehicleSlug={vehicle.slug} />
            <p className="detail-meta detail-action-note">An enquiry does not reserve the vehicle or lock its price.</p>
          </aside>
        </section>
        <section className="detail-copy">
          <span className="eyebrow">VEHICLE OVERVIEW</span><h2>About this vehicle</h2><p>{vehicle.description}</p>
          <h2>Specifications</h2>
          {availableFacts.length > 0 ? <div className="detail-specs">{availableFacts.map(([label, value]) => <div className="detail-spec" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div> : <p>Specifications have not been provided for this listing.</p>}
          <h2>Interested in this vehicle?</h2><p>Send an enquiry and the dealership can confirm details, current availability and next steps.</p>
          <Link href={"/contact?vehicle=" + encodeURIComponent(vehicle.slug)} className="button button-gold">Contact the dealership</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}