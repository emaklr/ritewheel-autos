"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VehicleImageInput = { url: string; altText: string | null; sortOrder: number; isPrimary: boolean };
type VehicleRecord = {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  bodyType: string;
  description: string;
  price: string | null;
  currency: string;
  condition: string;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  engine: string | null;
  drivetrain: string | null;
  seats: number | null;
  exteriorColour: string | null;
  interiorColour: string | null;
  features: string[];
  status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD" | "ARCHIVED";
  featured: boolean;
  isDemo: boolean;
  images: VehicleImageInput[];
};

type FormState = {
  slug: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  bodyType: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  engine: string;
  drivetrain: string;
  seats: string;
  exteriorColour: string;
  interiorColour: string;
  features: string;
  imageUrls: string;
  status: VehicleRecord["status"];
  featured: boolean;
  isDemo: boolean;
};

function toFormState(record?: VehicleRecord): FormState {
  return {
    slug: record?.slug ?? "",
    make: record?.make ?? "",
    model: record?.model ?? "",
    trim: record?.trim ?? "",
    year: String(record?.year ?? new Date().getFullYear()),
    bodyType: record?.bodyType ?? "",
    description: record?.description ?? "",
    price: record?.price ?? "",
    currency: record?.currency ?? "NGN",
    condition: record?.condition ?? "Foreign Used",
    mileage: record?.mileage === null || record?.mileage === undefined ? "" : String(record.mileage),
    transmission: record?.transmission ?? "",
    fuelType: record?.fuelType ?? "",
    engine: record?.engine ?? "",
    drivetrain: record?.drivetrain ?? "",
    seats: record?.seats === null || record?.seats === undefined ? "" : String(record.seats),
    exteriorColour: record?.exteriorColour ?? "",
    interiorColour: record?.interiorColour ?? "",
    features: record?.features.join(", ") ?? "",
    imageUrls: record?.images.map((image) => image.url).join("\n") ?? "",
    status: record?.status ?? "DRAFT",
    featured: record?.featured ?? false,
    isDemo: record?.isDemo ?? false,
  };
}

export function VehicleForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: VehicleRecord;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "edit" && initial && form.status !== initial.status) {
      const action = form.status === "AVAILABLE"
        ? "publish this listing as available"
        : form.status === "DRAFT"
          ? "unpublish this listing as a draft"
          : form.status === "ARCHIVED"
            ? "archive this listing"
            : `mark this listing as ${form.status.toLowerCase()}`;
      if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    }
    setError("");
    setBusy(true);

    const { imageUrls, ...formFields } = form;
    const images = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((url, index) => ({
        url,
        altText: `${form.make.trim()} ${form.model.trim()} vehicle image`,
        sortOrder: index,
        isPrimary: index === 0,
      }));

    const payload = {
      ...formFields,
      year: Number(form.year),
      mileage: form.mileage.trim() ? Number(form.mileage) : null,
      seats: form.seats.trim() ? Number(form.seats) : null,
      price: form.price.trim() ? form.price.trim() : null,
      trim: form.trim.trim() || null,
      transmission: form.transmission.trim() || null,
      fuelType: form.fuelType.trim() || null,
      engine: form.engine.trim() || null,
      drivetrain: form.drivetrain.trim() || null,
      exteriorColour: form.exteriorColour.trim() || null,
      interiorColour: form.interiorColour.trim() || null,
      features: form.features.split(",").map((item) => item.trim()).filter(Boolean),
      images,
    };

    try {
      const response = await fetch(
        mode === "create" ? "/api/admin/vehicles" : `/api/admin/vehicles/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json() as { error?: string; vehicle?: { id: string } };

      if (!response.ok || !result.vehicle?.id) {
        setError(result.error ?? "The vehicle could not be saved. Check the details and try again.");
        return;
      }

      router.push(`/admin/vehicles/${result.vehicle.id}`);
      router.refresh();
    } catch {
      setError("We could not reach the inventory service. Your changes have not been saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-vehicle-form" onSubmit={handleSubmit}>
      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>01</span>
          <div><h2>Vehicle identity</h2><p>Core details customers use to recognise the vehicle.</p></div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>Make *</span><input required maxLength={60} value={form.make} onChange={(e) => update("make", e.target.value)} placeholder="e.g. Mercedes-Benz" /></label>
          <label className="admin-field"><span>Model *</span><input required maxLength={80} value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. GLE 450" /></label>
          <label className="admin-field"><span>Trim / variant</span><input maxLength={80} value={form.trim} onChange={(e) => update("trim", e.target.value)} placeholder="e.g. 4MATIC" /></label>
          <label className="admin-field"><span>Year *</span><input type="number" required min={1886} max={2100} value={form.year} onChange={(e) => update("year", e.target.value)} /></label>
          <label className="admin-field"><span>Body type *</span>
            <select required value={form.bodyType} onChange={(e) => update("bodyType", e.target.value)}>
              <option value="">Select body type</option>
              {["SUV", "Sedan", "Coupe", "Hatchback", "Pickup", "Van", "Wagon", "Convertible", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="admin-field"><span>Condition *</span>
            <select required value={form.condition} onChange={(e) => update("condition", e.target.value)}>
              {["Brand New", "Foreign Used", "Nigerian Used", "Used", "Certified Pre-Owned"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="admin-field admin-field-wide"><span>URL slug <small>Leave blank to generate from make, model and year.</small></span><input maxLength={120} value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="mercedes-gle-450-2025" /></label>
        </div>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>02</span>
          <div><h2>Commercial details</h2><p>Use a real stored price and its currency, or leave the price blank for “Price on request”.</p></div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>Price</span><input inputMode="decimal" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="e.g. 95000000" /></label>
          <label className="admin-field"><span>Currency *</span>
            <select required value={form.currency} onChange={(e) => update("currency", e.target.value)}>
              {["NGN", "USD", "GBP", "EUR", "AED", "ZAR", "CAD", "AUD"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>03</span>
          <div><h2>Specifications</h2><p>Only enter facts verified for this vehicle.</p></div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>Mileage (km)</span><input type="number" min={0} max={2000000} value={form.mileage} onChange={(e) => update("mileage", e.target.value)} /></label>
          <label className="admin-field"><span>Transmission</span><input maxLength={60} value={form.transmission} onChange={(e) => update("transmission", e.target.value)} placeholder="Automatic" /></label>
          <label className="admin-field"><span>Fuel type</span><input maxLength={60} value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)} placeholder="Petrol / Diesel / Hybrid" /></label>
          <label className="admin-field"><span>Engine</span><input maxLength={100} value={form.engine} onChange={(e) => update("engine", e.target.value)} placeholder="3.0L Turbo" /></label>
          <label className="admin-field"><span>Drivetrain</span><input maxLength={60} value={form.drivetrain} onChange={(e) => update("drivetrain", e.target.value)} placeholder="AWD / FWD / RWD" /></label>
          <label className="admin-field"><span>Seats</span><input type="number" min={1} max={20} value={form.seats} onChange={(e) => update("seats", e.target.value)} /></label>
          <label className="admin-field"><span>Exterior colour</span><input maxLength={60} value={form.exteriorColour} onChange={(e) => update("exteriorColour", e.target.value)} /></label>
          <label className="admin-field"><span>Interior colour</span><input maxLength={60} value={form.interiorColour} onChange={(e) => update("interiorColour", e.target.value)} /></label>
        </div>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>04</span>
          <div><h2>Description and features</h2><p>Keep copy specific to the actual vehicle record.</p></div>
        </div>
        <label className="admin-field"><span>Description *</span><textarea required minLength={10} maxLength={4000} rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the vehicle accurately…" /></label>
        <label className="admin-field"><span>Features <small>Separate each feature with a comma.</small></span><textarea rows={3} maxLength={2000} value={form.features} onChange={(e) => update("features", e.target.value)} placeholder="Panoramic roof, 360 camera, leather interior" /></label>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>05</span>
          <div><h2>Vehicle images</h2><p>One image URL per line. The first URL becomes the primary image.</p></div>
        </div>
        <label className="admin-field"><span>Image URLs</span><textarea rows={5} value={form.imageUrls} onChange={(e) => update("imageUrls", e.target.value)} placeholder={"https://images.example.com/vehicle-front.webp\nhttps://images.example.com/vehicle-side.webp"} /></label>
        <p className="admin-field-help">Image uploads are not configured yet. Store image files in your approved CDN or object storage, then paste the public or signed asset URL here. You can also use an existing local path such as /images/vehicles/example.webp.</p>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>06</span>
          <div><h2>Publication</h2><p>Drafts stay out of public inventory. Publishing requires at least one image and complete listing details.</p></div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>Public status *</span>
            <select value={form.status} onChange={(e) => update("status", e.target.value as FormState["status"])}>
              <option value="DRAFT">Draft</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <div className="admin-check-stack">
            <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /><span><strong>Featured listing</strong><small>Eligible for the public featured section.</small></span></label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.isDemo} onChange={(e) => update("isDemo", e.target.checked)} /><span><strong>Demo listing</strong><small>Clearly labelled as illustrative, not live stock.</small></span></label>
          </div>
        </div>
      </section>

      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-form-actions">
        <Link className="button button-outline" href="/admin/vehicles">Cancel</Link>
        <button className="button button-gold" type="submit" disabled={busy}>{busy ? "Saving…" : mode === "create" ? "Create vehicle" : "Save changes"}</button>
      </div>
    </form>
  );
}
