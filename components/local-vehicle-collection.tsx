"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VehicleSummary } from "@/lib/vehicles";

type Mode = "saved" | "compare";

const KEYS = {
  saved: "ritewheel.garage.saved.v1",
  compare: "ritewheel.compare.v1",
} as const;

function readSlugs(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((item): item is string => typeof item === "string"))].slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

export function LocalVehicleCollection({ mode }: { mode: Mode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => setSlugs(readSlugs(KEYS[mode]));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ritewheel-local-collection-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ritewheel-local-collection-updated", sync);
    };
  }, [mode]);

  const currentKey = slugs.join(",");
  const isLoading = currentKey.length > 0 && loadedKey !== currentKey;
  const currentVehicles = currentKey.length > 0 && loadedKey === currentKey ? vehicles : [];
  const currentError = loadedKey === currentKey ? error : "";

  useEffect(() => {
    if (slugs.length === 0) return;

    const controller = new AbortController();
    const key = slugs.join(",");

    fetch(`/api/vehicles?slugs=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Vehicles could not be loaded.");
        return response.json() as Promise<{ items: VehicleSummary[] }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setVehicles(data.items);
        setError("");
        setLoadedKey(key);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted || (reason instanceof Error && reason.name === "AbortError")) return;
        setError(reason instanceof Error ? reason.message : "Something went wrong.");
        setLoadedKey(key);
      });

    return () => controller.abort();
  }, [slugs]);

  function remove(vehicleSlug: string) {
    const next = slugs.filter((slug) => slug !== vehicleSlug);
    window.localStorage.setItem(KEYS[mode], JSON.stringify(next));
    window.dispatchEvent(new Event("ritewheel-local-collection-updated"));
    setSlugs(next);
  }

  function retry() {
    setLoadedKey("");
    setError("");
    setSlugs([...slugs]);
  }

  const isSaved = mode === "saved";

  return (
    <section className="local-collection">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{isSaved ? "YOUR SHORTLIST" : "MAKE A CONFIDENT CHOICE"}</span>
          <h1>{isSaved ? "My Garage" : "Compare vehicles"}</h1>
          <p>{isSaved
            ? "Your saved vehicles, kept on this browser. Account sync will arrive in a later release."
            : "Review up to three vehicles side by side. Your comparison is stored on this browser."}</p>
        </div>
        <Link href="/inventory" className="button button-outline button-small">Explore inventory</Link>
      </div>

      {isLoading ? <p className="collection-message">Loading your vehicles…</p> : null}
      {currentError ? (
        <p className="collection-message">
          {currentError} <button type="button" onClick={retry}>Retry</button>
        </p>
      ) : null}

      {!isLoading && !currentError && currentVehicles.length === 0 ? (
        <div className="empty-state">
          <h3>{isSaved ? "Your Garage is ready." : "Nothing to compare yet."}</h3>
          <p>{isSaved
            ? "Save a vehicle from the catalogue and it will appear here."
            : "Choose up to three vehicles from Inventory to compare their details."}</p>
          <Link href="/inventory" className="button button-gold">Browse vehicles →</Link>
        </div>
      ) : null}

      {currentVehicles.length > 0 ? (
        <div className={isSaved ? "vehicle-grid" : "comparison-grid"}>
          {currentVehicles.map((vehicle) => (
            <article key={vehicle.slug} className="collection-card">
              <Link href={`/vehicles/${vehicle.slug}`} className="collection-card-title">
                <span>{vehicle.year} · {vehicle.bodyType}</span>
                <strong>{vehicle.make} {vehicle.model}</strong>
              </Link>
              <div className="collection-card-details">
                <span>{vehicle.condition}</span>
                <span>{vehicle.transmission ?? "Transmission not provided"}</span>
                <span>{vehicle.fuelType ?? "Fuel not provided"}</span>
                <span>{vehicle.seats ? `${vehicle.seats} seats` : "Seating not provided"}</span>
                <span>{vehicle.price === null
                  ? "Price on request"
                  : new Intl.NumberFormat("en-NG", { style: "currency", currency: vehicle.currency, maximumFractionDigits: 0 }).format(vehicle.price)}</span>
                {vehicle.isDemo ? <small>Demo listing · Illustrative data</small> : null}
              </div>
              {vehicle.status !== "AVAILABLE" ? <span className="badge badge-reserved">{vehicle.status}</span> : null}
              <button type="button" className="mini-action" onClick={() => remove(vehicle.slug)}>Remove</button>
            </article>
          ))}
        </div>
      ) : null}

      <p className="demo-notice">Guest Garage and comparison are local to this browser in Release 1. Clearing browser storage or using another device will not preserve these items.</p>
    </section>
  );
}
