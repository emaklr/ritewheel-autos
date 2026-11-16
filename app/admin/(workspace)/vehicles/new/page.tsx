import Link from "next/link";
import { VehicleForm } from "@/components/admin/vehicle-form";

export const metadata = { title: "Add vehicle | Ritewheel Admin" };

export default function NewAdminVehiclePage() {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-back-link" href="/admin/vehicles">← Back to inventory</Link>
          <span className="eyebrow">NEW LISTING</span>
          <h1>Add a vehicle</h1>
          <p>Enter verified vehicle details. Save as a draft while you prepare the listing.</p>
        </div>
      </div>
      <VehicleForm mode="create" />
    </>
  );
}
