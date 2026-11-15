"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VehicleSummary } from "@/lib/vehicles";

type Mode = "saved" | "compare";

const KEYS = {
  saved: "ritewheel.garage.saved.v1",
  compare: "ritewheel.compare.v1",
} as const;

function readIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function LocalVehicleCollection({ mode }: { mode: Mode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => setIds(readIds(KEYS[mode]));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ritewheel-local-collection-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ritewheel-local-collection-updated", sync);
    };
  }, [mode]);

  useEffect(() => {
    const controller = new AbortController();
    if (ids.length === 0) {
      setVehicles([]);
      setLoading(false);
      setError("");
      return () => controller.abort();
    }
    setLoading(true);
    fetch(`/api/vehicles?ids=${encodeURIComponent(ids.join(","))}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Vehicles could not be loaded.");
        return response.json() as Promise<{ items: VehicleSummary[] }>;
      })
      .then((data) => {
        setVehicles(data.items);
        setError("");
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ids]);

  function remove(id: string) {
    const next = ids.filter((value) => value !== id);
    window.localStorage.setItem(KEYS[mode], JSON.stringify(next));
    window.dispatchEvent(new Event("ritewheel-local-collection-updated"));
    setIds(next);
  }

  const isSaved = mode === "saved";
  const title = isSaved ? "My Garage" : "Compare vehicles";
  const description = isSaved
    ? "Your saved vehicles, kept on this browser. Account sync will arrive in a later release."
    : "Review up to three vehicles side by side. Your comparison is stored on this browser.";

  return (
    <section className="local-collection">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{isSaved ? "YOUR SHORTLIST" : "MAKE A CONFIDENT CHOICE"}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Link href="/inventory" className="button button-outline button-small">Explore inventory</Link>
      </div>
      {loading ? <p className="collection-message">Loading your vehicles…</p> : null}
      {error ? <p className="collection-message">{error} <button type="button" onClick={() => setIds([...ids])}>Retry</button></p> : null}
      {!loading && !error && vehicles.length === 0 ? (
        <div className="empty-state">
          <h3>{isSaved ? "Your Garage is ready." : "Nothing to compare yet."}</h3>
          <p>{isSaved ? "Save a vehicle from the catalogue and it will appear here." : "Choose up to three vehicles from Inventory to compare their details."}</p>
          <Link href="/inventory" className="button button-gold">Browse vehicles →</Link>
        </div>
      ) : null}
      {vehicles.length > 0 ? (
        <div className={isSaved ? "vehicle-grid" : "comparison-grid"}>
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="collection-card">
              <Link href={`/vehicles/${vehicle.slug}`} className="collection-card-title">
                <span>{vehicle.year} · {vehicle.bodyType}</span>
                <strong>{vehicle.make} {vehicle.model}</strong>
              </Link>
              <div className="collection-card-details">
                <span>{vehicle.condition}</span>
                <span>{vehicle.transmission ?? "Transmission not provided"}</span>
                <span>{vehicle.fuelType ?? "Fuel not provided"}</span>
                <span>{vehicle.seats ? `${vehicle.seats} seats` : "Seating not provided"}</span>
                <span>{vehicle.price === null ? "Price on request" : new Intl.NumberFormat("en-NG", { style: "currency", currency: vehicle.currency, maximumFractionDigits: 0 }).format(vehicle.price)}</span>
                {vehicle.isDemo ? <small>Demo listing · Illustrative data</small> : null}
              </div>
              <button type="button" className="mini-action" onClick={() => remove(vehicle.id)}>Remove</button>
            </article>
          ))}
        </div>
      ) : null}
      <p className="demo-notice">Guest Garage and comparison are local to this browser in Release 1. Clearing browser storage or using another device will not preserve these items.</p>
    </section>
  );
}
