"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "ritewheel.garage.saved.v1";
const COMPARE_KEY = "ritewheel.compare.v1";

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

function writeSlugs(key: string, slugs: string[]) {
  window.localStorage.setItem(key, JSON.stringify(slugs));
  window.dispatchEvent(new Event("ritewheel-local-collection-updated"));
}

export function VehicleCardActions({ vehicleSlug }: { vehicleSlug: string }) {
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      setSaved(readSlugs(SAVED_KEY).includes(vehicleSlug));
      setCompared(readSlugs(COMPARE_KEY).includes(vehicleSlug));
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ritewheel-local-collection-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ritewheel-local-collection-updated", sync);
    };
  }, [vehicleSlug]);

  function toggleSaved() {
    const slugs = readSlugs(SAVED_KEY);
    const next = slugs.includes(vehicleSlug) ? slugs.filter((slug) => slug !== vehicleSlug) : [...slugs, vehicleSlug];
    writeSlugs(SAVED_KEY, next);
    setSaved(next.includes(vehicleSlug));
    setMessage(next.includes(vehicleSlug) ? "Saved to My Garage on this device." : "Removed from My Garage.");
  }

  function toggleCompare() {
    const slugs = readSlugs(COMPARE_KEY);
    if (slugs.includes(vehicleSlug)) {
      const next = slugs.filter((slug) => slug !== vehicleSlug);
      writeSlugs(COMPARE_KEY, next);
      setCompared(false);
      setMessage("Removed from comparison.");
      return;
    }
    if (slugs.length >= 3) {
      setMessage("You can compare up to three vehicles at a time.");
      return;
    }
    const next = [...slugs, vehicleSlug];
    writeSlugs(COMPARE_KEY, next);
    setCompared(true);
    setMessage("Added to comparison.");
  }

  return (
    <div className="vehicle-card-actions">
      <button type="button" className={saved ? "mini-action is-active" : "mini-action"} onClick={toggleSaved} aria-pressed={saved}>
        <span aria-hidden="true">{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}
      </button>
      <button type="button" className={compared ? "mini-action is-active" : "mini-action"} onClick={toggleCompare} aria-pressed={compared}>
        <span aria-hidden="true">⇄</span> {compared ? "Comparing" : "Compare"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{message}</span>
    </div>
  );
}
