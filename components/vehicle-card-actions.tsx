"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "ritewheel.garage.saved.v1";
const COMPARE_KEY = "ritewheel.compare.v1";

function readIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event("ritewheel-local-collection-updated"));
}

export function VehicleCardActions({ vehicleSlug }: { vehicleSlug: string }) {
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      setSaved(readIds(SAVED_KEY).includes(vehicleSlug));
      setCompared(readIds(COMPARE_KEY).includes(vehicleSlug));
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
    const ids = readIds(SAVED_KEY);
    const next = ids.includes(vehicleSlug) ? ids.filter((id) => id !== vehicleSlug) : [...ids, vehicleSlug];
    writeIds(SAVED_KEY, next);
    setSaved(next.includes(vehicleSlug));
    setMessage(next.includes(vehicleSlug) ? "Saved to My Garage on this device." : "Removed from My Garage.");
  }

  function toggleCompare() {
    const ids = readIds(COMPARE_KEY);
    if (ids.includes(vehicleSlug)) {
      const next = ids.filter((id) => id !== vehicleSlug);
      writeIds(COMPARE_KEY, next);
      setCompared(false);
      setMessage("Removed from comparison.");
      return;
    }
    if (ids.length >= 3) {
      setMessage("You can compare up to three vehicles at a time.");
      return;
    }
    const next = [...ids, vehicleSlug];
    writeIds(COMPARE_KEY, next);
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
