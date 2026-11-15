import type { VehicleSummary } from "@/lib/vehicles";

export function formatPrice(vehicle: Pick<VehicleSummary, "price" | "currency">): string {
  if (vehicle.price === null) return "Price on request";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: vehicle.currency,
      maximumFractionDigits: 0
    }).format(vehicle.price);
  } catch {
    return vehicle.currency + " " + vehicle.price.toLocaleString("en-NG");
  }
}

export function vehicleTitle(vehicle: Pick<VehicleSummary, "make" | "model" | "trim" | "year">): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
}