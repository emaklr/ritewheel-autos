import Image from "next/image";
import Link from "next/link";
import type { VehicleSummary } from "@/lib/vehicles";
import { formatPrice, vehicleTitle } from "@/lib/format";

export function VehicleCard({ vehicle }: { vehicle: VehicleSummary }) {
  return (
    <article className="vehicle-card">
      <Link href={"/vehicles/" + vehicle.slug} className="vehicle-card-image-link" aria-label={"View " + vehicleTitle(vehicle)}>
        <div className="vehicle-card-image">
          <Image src={vehicle.imageUrl} alt={vehicle.images[0]?.altText ?? vehicleTitle(vehicle)} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
          <span className={vehicle.isDemo ? "vehicle-badge demo-badge" : "vehicle-badge"}>
            {vehicle.isDemo ? "Demo listing" : vehicle.status === "RESERVED" ? "Reserved" : "Available"}
          </span>
        </div>
      </Link>
      <div className="vehicle-card-body">
        <div className="vehicle-card-topline"><span className="vehicle-make">{vehicle.make}</span><span className="vehicle-year">{vehicle.year}</span></div>
        <h3><Link href={"/vehicles/" + vehicle.slug}>{vehicleTitle(vehicle)}</Link></h3>
        <div className="vehicle-spec-line">{[vehicle.bodyType, vehicle.transmission, vehicle.fuelType].filter(Boolean).join(" · ") || "Vehicle details available"}</div>
        <div className="vehicle-card-bottom"><span className="vehicle-price">{formatPrice(vehicle)}</span><Link href={"/vehicles/" + vehicle.slug} className="text-link">View details <span aria-hidden="true">↗</span></Link></div>
      </div>
    </article>
  );
}