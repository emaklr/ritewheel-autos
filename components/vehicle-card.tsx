import Image from "next/image";
import Link from "next/link";
import type { VehicleSummary } from "@/lib/vehicles";
import { VehicleCardActions } from "@/components/vehicle-card-actions";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Price on request";
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function VehicleCard({ vehicle, priority = false }: { vehicle: VehicleSummary; priority?: boolean }) {
  return (
    <article className="vehicle-card">
      <Link href={`/vehicles/${vehicle.slug}`} className="vehicle-card-image-link" aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
        <div className="vehicle-card-image">
          <Image
            src={vehicle.image}
            alt={vehicle.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 680px) 100vw, (max-width: 1050px) 50vw, 31vw"
          />
          <div className="vehicle-badges">
            {vehicle.isDemo ? <span className="badge badge-demo">Demo listing</span> : null}
            {vehicle.status === "RESERVED" ? <span className="badge badge-reserved">Reserved</span> : null}
          </div>
        </div>
      </Link>
      <div className="vehicle-card-body">
        <div className="vehicle-card-overline">{vehicle.year} <span>·</span> {vehicle.bodyType}</div>
        <h3><Link href={`/vehicles/${vehicle.slug}`}>{vehicle.make} {vehicle.model}</Link></h3>
        <p className="vehicle-trim">{vehicle.trim ?? vehicle.condition}</p>
        <div className="vehicle-spec-line">
          {vehicle.transmission ? <span>{vehicle.transmission}</span> : null}
          {vehicle.fuelType ? <span>{vehicle.fuelType}</span> : null}
          {vehicle.seats ? <span>{vehicle.seats} seats</span> : null}
        </div>
        <VehicleCardActions vehicleSlug={vehicle.slug} />
        <div className="vehicle-card-bottom">
          <div>
            <span className="price-label">Asking price</span>
            <strong>{formatPrice(vehicle.price, vehicle.currency)}</strong>
            {vehicle.isDemo ? <small>Illustrative demo price</small> : null}
          </div>
          <Link className="vehicle-arrow" href={`/vehicles/${vehicle.slug}`} aria-label={`View ${vehicle.make} ${vehicle.model}`}>↗</Link>
        </div>
      </div>
    </article>
  );
}
