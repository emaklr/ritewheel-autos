import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getVehicleBySlug } from "@/lib/vehicles";
import { VehicleCardActions } from "@/components/vehicle-card-actions";
import { VehicleGallery } from "@/components/vehicle-gallery";

type Props = { params: Promise<{ slug: string }> };

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Price on request";
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle unavailable" };
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const galleryImages = vehicle.images?.length
    ? vehicle.images
    : [{ url: vehicle.image, altText: vehicle.imageAlt }];

  const galleryBadge = vehicle.isDemo
    ? "Demo listing"
    : vehicle.status !== "AVAILABLE"
      ? vehicle.status.toLowerCase()
      : undefined;

  const specs = [
    ["Year", String(vehicle.year)],
    ["Body type", vehicle.bodyType],
    ["Condition", vehicle.condition],
    ["Mileage", vehicle.mileage === null ? null : `${new Intl.NumberFormat("en-NG").format(vehicle.mileage)} km`],
    ["Transmission", vehicle.transmission],
    ["Fuel", vehicle.fuelType],
    ["Engine", vehicle.engine],
    ["Seats", vehicle.seats === null ? null : String(vehicle.seats)],
  ].filter((item): item is [string, string] => Boolean(item[1]));


  return (
    <>
      <SiteHeader />
      <main className="container">
        <div className="page-top">
          <div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/inventory">Inventory</Link> / {vehicle.make} {vehicle.model}</div>
        </div>
        <div className="vehicle-detail-layout">
          <div>
            <VehicleGallery images={galleryImages} badge={galleryBadge} />
            <div className="vehicle-detail-description">
              <span className="eyebrow">ABOUT THIS VEHICLE</span>
              <h2>Overview</h2>
              <p>{vehicle.description}</p>
              <p>Vehicle information, condition and availability should be confirmed with the dealership before any purchase decision.</p>
            </div>
          </div>

          <aside className="vehicle-detail-summary">
            <span className="eyebrow">{vehicle.year} · {vehicle.bodyType}</span>
            <h1>{vehicle.make} {vehicle.model}</h1>
            <p className="vehicle-trim">{vehicle.trim ?? vehicle.condition}</p>
            <div className="vehicle-detail-price">
              {formatPrice(vehicle.price, vehicle.currency)}
              {vehicle.isDemo ? <small>Illustrative demo price — not an offer</small> : null}
            </div>
            <div className="status-line"><span className={vehicle.status === "AVAILABLE" ? "status-dot status-dot-green" : "status-dot"} />{vehicle.status === "AVAILABLE" ? "Listed as available" : vehicle.status.toLowerCase()}</div>
            <VehicleCardActions vehicleSlug={vehicle.slug} />
            <div className="vehicle-detail-specs">
              {specs.slice(0, 8).map(([label, value]) => (
                <div key={label} className="vehicle-detail-spec"><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
            {vehicle.isDemo ? (
              <div className="demo-notice">This is an illustrative listing. Customer enquiries and purchase actions are not enabled for demo records.</div>
            ) : (
              <>
                <Link href={`/contact?vehicle=${encodeURIComponent(vehicle.slug)}`} className="button button-gold">Enquire about this vehicle →</Link>
                {vehicle.status === "AVAILABLE" ? <Link href={`/contact?vehicle=${encodeURIComponent(vehicle.slug)}&type=test-drive`} className="button button-outline">Request a test drive</Link> : null}
              </>
            )}
            <Link href="/inventory" className="text-link detail-back">← Back to inventory</Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
