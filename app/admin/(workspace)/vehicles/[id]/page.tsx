import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { getPrismaClient } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditAdminVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getPrismaClient().vehicle.findUnique({
    where: { id },
    select: {
      id: true, slug: true, make: true, model: true, trim: true, year: true,
      bodyType: true, description: true, price: true, currency: true, condition: true,
      mileage: true, transmission: true, fuelType: true, engine: true, drivetrain: true,
      seats: true, exteriorColour: true, interiorColour: true, features: true,
      status: true, featured: true, isDemo: true, publishedAt: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { url: true, altText: true, sortOrder: true, isPrimary: true },
      },
    },
  });

  if (!vehicle) notFound();

  const initial = {
    ...vehicle,
    price: vehicle.price?.toString() ?? null,
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-back-link" href="/admin/vehicles">← Back to inventory</Link>
          <span className="eyebrow">EDIT LISTING</span>
          <h1>{vehicle.make} {vehicle.model}</h1>
          <p>Update listing facts, imagery, pricing and publication status.</p>
        </div>
        {vehicle.publishedAt && vehicle.status !== "ARCHIVED" && vehicle.status !== "DRAFT"
          ? <Link className="button button-outline" href={`/vehicles/${vehicle.slug}`} target="_blank" rel="noreferrer">Preview listing ↗</Link>
          : null}
      </div>
      <VehicleForm mode="edit" initial={initial} />
    </>
  );
}
