"use client";

import Image from "next/image";
import Link from "next/link";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { VehicleCardActions } from "@/components/vehicle-card-actions";

const SESSION_KEY = "ritewheel.concierge.session.v1";

type SearchCriteria = {
  query?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  minSeats?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  maxBudget?: number;
  currency?: string;
  requiredFeatures?: string[];
};

type ConciergeVehicle = {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  bodyType: string;
  description: string;
  price: number | null;
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
  status: string;
  isDemo: boolean;
  image: string | null;
  imageAlt: string;
  matchReasons: string[];
};

type SearchState = {
  source: string;
  totalMatched: number;
  items: ConciergeVehicle[];
  criteria: SearchCriteria;
  message?: string;
};

type ComparisonState = {
  source: string;
  items: ConciergeVehicle[];
  missingIds: string[];
  pricesComparable: boolean;
  currency: string | null;
};

type OptionsState = {
  found: boolean;
  vehicle?: { id: string; make: string; model: string; year: number };
  groups: Array<{
    groupKey: string;
    options: Array<{ id: string; optionKey: string; label: string; priceDelta: number | null; currency: string; previewImageUrl: string | null }>;
  }>;
};

type ToolPart = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeImage(value: unknown) {
  if (typeof value !== "string" || value.length > 2_000) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

function parseVehicle(value: unknown): ConciergeVehicle | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.slug !== "string" ||
    !/^[a-z0-9-]{3,100}$/.test(value.slug) ||
    typeof value.make !== "string" ||
    typeof value.model !== "string" ||
    typeof value.year !== "number" ||
    typeof value.bodyType !== "string" ||
    typeof value.currency !== "string" ||
    typeof value.status !== "string" ||
    typeof value.isDemo !== "boolean"
  ) return null;

  return {
    id: value.id,
    slug: value.slug,
    make: value.make,
    model: value.model,
    trim: typeof value.trim === "string" ? value.trim : null,
    year: value.year,
    bodyType: value.bodyType,
    description: typeof value.description === "string" ? value.description : "",
    price: typeof value.price === "number" && Number.isFinite(value.price) ? value.price : null,
    currency: value.currency,
    condition: typeof value.condition === "string" ? value.condition : "Not provided",
    mileage: typeof value.mileage === "number" ? value.mileage : null,
    transmission: typeof value.transmission === "string" ? value.transmission : null,
    fuelType: typeof value.fuelType === "string" ? value.fuelType : null,
    engine: typeof value.engine === "string" ? value.engine : null,
    drivetrain: typeof value.drivetrain === "string" ? value.drivetrain : null,
    seats: typeof value.seats === "number" ? value.seats : null,
    exteriorColour: typeof value.exteriorColour === "string" ? value.exteriorColour : null,
    interiorColour: typeof value.interiorColour === "string" ? value.interiorColour : null,
    features: Array.isArray(value.features) ? value.features.filter((item): item is string => typeof item === "string").slice(0, 30) : [],
    status: value.status,
    isDemo: value.isDemo,
    image: safeImage(value.image),
    imageAlt: typeof value.imageAlt === "string" ? value.imageAlt : value.make + " " + value.model,
    matchReasons: Array.isArray(value.matchReasons) ? value.matchReasons.filter((item): item is string => typeof item === "string").slice(0, 8) : [],
  };
}

function latestToolPart(messages: UIMessage[], toolName: string): ToolPart | null {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const parts = messages[messageIndex]?.parts ?? [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = parts[partIndex] as unknown as ToolPart;
      if (part.type === "tool-" + toolName) return part;
    }
  }
  return null;
}

function parseSearchState(part: ToolPart | null): SearchState | null {
  if (!part || !isRecord(part.output)) return null;
  const output = part.output;
  const items = Array.isArray(output.items)
    ? output.items.map(parseVehicle).filter((item): item is ConciergeVehicle => Boolean(item)).slice(0, 3)
    : [];
  return {
    source: typeof output.source === "string" ? output.source : "error",
    totalMatched: typeof output.totalMatched === "number" ? output.totalMatched : 0,
    items,
    criteria: isRecord(part.input) ? part.input as SearchCriteria : {},
    message: typeof output.message === "string" ? output.message : undefined,
  };
}

function parseComparison(part: ToolPart | null): ComparisonState | null {
  if (!part || !isRecord(part.output)) return null;
  const output = part.output;
  const items = Array.isArray(output.items)
    ? output.items.map(parseVehicle).filter((item): item is ConciergeVehicle => Boolean(item)).slice(0, 3)
    : [];
  return {
    source: typeof output.source === "string" ? output.source : "error",
    items,
    missingIds: Array.isArray(output.missingIds) ? output.missingIds.filter((item): item is string => typeof item === "string") : [],
    pricesComparable: output.pricesComparable === true,
    currency: typeof output.currency === "string" ? output.currency : null,
  };
}

function parseOptions(part: ToolPart | null): OptionsState | null {
  if (!part || !isRecord(part.output)) return null;
  const output = part.output;
  const groups = Array.isArray(output.groups)
    ? output.groups.filter(isRecord).map((group) => ({
        groupKey: typeof group.groupKey === "string" ? group.groupKey : "Options",
        options: Array.isArray(group.options)
          ? group.options.filter(isRecord).map((option) => ({
              id: typeof option.id === "string" ? option.id : "",
              optionKey: typeof option.optionKey === "string" ? option.optionKey : "",
              label: typeof option.label === "string" ? option.label : "Option",
              priceDelta: typeof option.priceDelta === "number" ? option.priceDelta : null,
              currency: typeof option.currency === "string" ? option.currency : "",
              previewImageUrl: safeImage(option.previewImageUrl),
            }))
          : [],
      }))
    : [];
  return {
    found: output.found === true,
    vehicle: isRecord(output.vehicle) &&
      typeof output.vehicle.id === "string" &&
      typeof output.vehicle.make === "string" &&
      typeof output.vehicle.model === "string" &&
      typeof output.vehicle.year === "number"
      ? { id: output.vehicle.id, make: output.vehicle.make, model: output.vehicle.model, year: output.vehicle.year }
      : undefined,
    groups,
  };
}

function isToolPending(messages: UIMessage[], toolName: string) {
  return messages.some((message) => message.parts.some((rawPart) => {
    const part = rawPart as unknown as ToolPart;
    return part.type === "tool-" + toolName && (
      part.state === "input-streaming" ||
      part.state === "input-available" ||
      part.state === "approval-requested"
    );
  }));
}

function redactForSession(value: string) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[contact detail removed]")
    .replace(/\+\d{1,3}(?:[\s().-]?\d){7,14}/g, "[phone number removed]")
    .replace(/\b0\d{10}\b/g, "[phone number removed]");
}

function persistableMessages(messages: UIMessage[]) {
  return messages.slice(-24).map((message) => ({
    ...message,
    parts: message.parts.map((part) => {
      if (part.type === "text") return { ...part, text: redactForSession(part.text) };
      return part;
    }),
  }));
}

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Price on request";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return currency + " " + price.toLocaleString("en-NG");
  }
}

function describeCriteria(criteria: SearchCriteria) {
  const lines: string[] = [];
  if (criteria.make) lines.push("Make: " + criteria.make);
  if (criteria.model) lines.push("Model: " + criteria.model);
  if (criteria.bodyType) lines.push("Body type: " + criteria.bodyType);
  if (criteria.minYear || criteria.maxYear) lines.push("Year: " + (criteria.minYear ?? "Any") + " to " + (criteria.maxYear ?? "Any"));
  if (criteria.minSeats) lines.push("At least " + criteria.minSeats + " seats");
  if (criteria.maxMileage) lines.push("Maximum mileage: " + criteria.maxMileage.toLocaleString("en-NG") + " km");
  if (criteria.fuelType) lines.push("Fuel: " + criteria.fuelType);
  if (criteria.transmission) lines.push("Transmission: " + criteria.transmission);
  if (criteria.condition) lines.push("Condition: " + criteria.condition);
  if (criteria.maxBudget !== undefined && criteria.currency) lines.push("Maximum budget: " + formatPrice(criteria.maxBudget, criteria.currency));
  if (criteria.requiredFeatures?.length) lines.push("Must-have features: " + criteria.requiredFeatures.join(", "));
  return lines;
}

function PreferencesEditor({
  criteria,
  onSubmit,
}: {
  criteria: SearchCriteria;
  onSubmit: (prompt: string) => void;
}) {
  const [validation, setValidation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const budget = get("maxBudget");
    const currency = get("currency");
    if (budget && !currency) {
      setValidation("Choose a currency before applying a budget filter.");
      return;
    }

    const lines = [
      get("query") ? "Search text: " + get("query") : "",
      get("make") ? "Make: " + get("make") : "",
      get("model") ? "Model: " + get("model") : "",
      get("bodyType") ? "Body type: " + get("bodyType") : "",
      get("minYear") ? "Earliest year: " + get("minYear") : "",
      get("maxYear") ? "Latest year: " + get("maxYear") : "",
      get("minSeats") ? "Minimum seats: " + get("minSeats") : "",
      get("maxMileage") ? "Maximum mileage: " + get("maxMileage") + " km" : "",
      get("fuelType") ? "Fuel type: " + get("fuelType") : "",
      get("transmission") ? "Transmission: " + get("transmission") : "",
      get("condition") ? "Condition: " + get("condition") : "",
      budget ? "Maximum budget: " + budget + " " + currency : "",
      get("requiredFeatures") ? "Required features: " + get("requiredFeatures") : "",
    ].filter(Boolean);

    if (lines.length === 0) {
      onSubmit("Please search the current Ritewheel inventory without any filters and show up to three available listings.");
      return;
    }
    setValidation("");
    onSubmit("Please update my Ritewheel inventory search using these filters:\n" + lines.join("\n") + "\nTreat these as the filters for this search. Do not assume any other preferences.");
  }

  return (
    <details className="concierge-preference-editor">
      <summary>Edit search preferences</summary>
      <form onSubmit={handleSubmit}>
        <label><span>Search text</span><input name="query" defaultValue={criteria.query ?? ""} maxLength={100} placeholder="e.g. comfortable long-distance car" /></label>
        <div className="concierge-editor-grid">
          <label><span>Make</span><input name="make" defaultValue={criteria.make ?? ""} maxLength={60} /></label>
          <label><span>Model</span><input name="model" defaultValue={criteria.model ?? ""} maxLength={80} /></label>
          <label><span>Body type</span><input name="bodyType" defaultValue={criteria.bodyType ?? ""} maxLength={40} placeholder="SUV, saloon…" /></label>
          <label><span>Minimum seats</span><input name="minSeats" type="number" min="1" max="15" defaultValue={criteria.minSeats ?? ""} /></label>
          <label><span>Earliest year</span><input name="minYear" type="number" min="1900" max="2100" defaultValue={criteria.minYear ?? ""} /></label>
          <label><span>Latest year</span><input name="maxYear" type="number" min="1900" max="2100" defaultValue={criteria.maxYear ?? ""} /></label>
          <label><span>Maximum mileage (km)</span><input name="maxMileage" type="number" min="0" max="2000000" defaultValue={criteria.maxMileage ?? ""} /></label>
          <label><span>Condition</span><input name="condition" defaultValue={criteria.condition ?? ""} maxLength={60} placeholder="New or used" /></label>
          <label><span>Fuel type</span><input name="fuelType" defaultValue={criteria.fuelType ?? ""} maxLength={30} /></label>
          <label><span>Transmission</span><input name="transmission" defaultValue={criteria.transmission ?? ""} maxLength={30} /></label>
          <label><span>Maximum budget</span><input name="maxBudget" type="number" min="1" max="999999999999" step="any" defaultValue={criteria.maxBudget ?? ""} /></label>
          <label><span>Currency</span>
            <select name="currency" defaultValue={criteria.currency ?? ""}>
              <option value="">Choose currency</option>
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>
        <label><span>Required features (comma separated)</span><input name="requiredFeatures" defaultValue={criteria.requiredFeatures?.join(", ") ?? ""} placeholder="e.g. parking sensors, adaptive cruise" /></label>
        {validation ? <p className="concierge-inline-error" role="alert">{validation}</p> : null}
        <button type="submit" className="button button-gold button-small">Apply search filters</button>
      </form>
    </details>
  );
}

function RecommendationCard({
  vehicle,
  selected,
  onToggleHandover,
  onAskOptions,
}: {
  vehicle: ConciergeVehicle;
  selected: boolean;
  onToggleHandover: (vehicleId: string) => void;
  onAskOptions: (vehicle: ConciergeVehicle) => void;
}) {
  const displayName = vehicle.year + " " + vehicle.make + " " + vehicle.model + (vehicle.trim ? " " + vehicle.trim : "");
  const isLive = !vehicle.isDemo;
  return (
    <article className="concierge-result-card">
      <Link href={"/vehicles/" + vehicle.slug} className="concierge-result-image" aria-label={"View " + displayName}>
        {vehicle.image ? (
          <Image src={vehicle.image} alt={vehicle.imageAlt} fill sizes="(max-width: 900px) 92vw, 28vw" unoptimized />
        ) : <span className="concierge-image-fallback">R</span>}
        {vehicle.isDemo ? <span className="concierge-demo-badge">Demo example · Not stock</span> : null}
      </Link>
      <div className="concierge-result-body">
        <div className="concierge-result-heading">
          <div>
            <span className="eyebrow">{vehicle.year} · {vehicle.bodyType}</span>
            <h3><Link href={"/vehicles/" + vehicle.slug}>{vehicle.make} {vehicle.model}</Link></h3>
            <p>{vehicle.trim ?? vehicle.condition}</p>
          </div>
          <span className={"concierge-listing-status " + (vehicle.isDemo ? "is-demo" : vehicle.status === "AVAILABLE" ? "is-live" : "is-other")}>
            {vehicle.isDemo ? "Illustrative" : vehicle.status}
          </span>
        </div>
        <div className="concierge-result-price">
          <strong>{formatPrice(vehicle.price, vehicle.currency)}</strong>
          <span>{vehicle.isDemo ? "Illustrative demo price" : "Database listing price"}</span>
        </div>
        <div className="concierge-result-specs">
          {vehicle.mileage !== null ? <span>{vehicle.mileage.toLocaleString("en-NG")} km</span> : null}
          {vehicle.transmission ? <span>{vehicle.transmission}</span> : null}
          {vehicle.fuelType ? <span>{vehicle.fuelType}</span> : null}
          {vehicle.seats ? <span>{vehicle.seats} seats</span> : null}
          {vehicle.condition ? <span>{vehicle.condition}</span> : null}
        </div>
        {vehicle.matchReasons.length > 0 ? (
          <div className="concierge-match-reasons">
            <strong>Why this matches</strong>
            <ul>{vehicle.matchReasons.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </div>
        ) : (
          <p className="concierge-missing-data">The listing has no recorded match notes. Review its details before deciding.</p>
        )}
        <div className="concierge-card-actions">
          <Link href={"/vehicles/" + vehicle.slug} className="button button-gold button-small">View vehicle</Link>
          <VehicleCardActions vehicleSlug={vehicle.slug} variant="concierge" />
          <button type="button" className="mini-action" onClick={() => onAskOptions(vehicle)}>
            Explore supported options
          </button>
        </div>
        {isLive ? (
          <label className="concierge-handover-select">
            <input type="checkbox" checked={selected} onChange={() => onToggleHandover(vehicle.id)} />
            Include this vehicle in my handover summary
          </label>
        ) : (
          <p className="concierge-demo-warning">This is a demo record, not a real vehicle offer. It cannot be included as a confirmed stock option.</p>
        )}
      </div>
    </article>
  );
}

function SearchSummary({ state }: { state: SearchState }) {
  const chips = describeCriteria(state.criteria);
  if (chips.length === 0) return null;
  return (
    <div className="concierge-preference-summary">
      <div className="concierge-panel-heading">
        <div><span className="eyebrow">YOUR SEARCH</span><h3>Preferences</h3></div>
      </div>
      <div className="concierge-preference-chips">
        {chips.map((chip) => <span key={chip}>{chip}</span>)}
      </div>
    </div>
  );
}

function ComparisonTable({ state }: { state: ComparisonState }) {
  if (state.source !== "database" || state.items.length === 0) return null;
  const rows: Array<[string, (vehicle: ConciergeVehicle) => string]> = [
    ["Model", (vehicle) => vehicle.make + " " + vehicle.model + (vehicle.trim ? " · " + vehicle.trim : "")],
    ["Year", (vehicle) => String(vehicle.year)],
    ["Body type", (vehicle) => vehicle.bodyType],
    ["Condition", (vehicle) => vehicle.condition],
    ["Price", (vehicle) => formatPrice(vehicle.price, vehicle.currency)],
    ["Mileage", (vehicle) => vehicle.mileage === null ? "Not provided" : vehicle.mileage.toLocaleString("en-NG") + " km"],
    ["Fuel", (vehicle) => vehicle.fuelType ?? "Not provided"],
    ["Transmission", (vehicle) => vehicle.transmission ?? "Not provided"],
    ["Seats", (vehicle) => vehicle.seats === null ? "Not provided" : String(vehicle.seats)],
    ["Engine", (vehicle) => vehicle.engine ?? "Not provided"],
    ["Drivetrain", (vehicle) => vehicle.drivetrain ?? "Not provided"],
  ];
  return (
    <section className="concierge-comparison">
      <div className="concierge-panel-heading"><div><span className="eyebrow">SIDE BY SIDE</span><h3>Vehicle comparison</h3></div></div>
      <div className="concierge-comparison-scroll">
        <table>
          <thead><tr><th>Details</th>{state.items.map((item) => <th key={item.id}>{item.year} {item.make} {item.model}</th>)}</tr></thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}><th>{label}</th>{state.items.map((item) => <td key={item.id}>{value(item)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {!state.pricesComparable ? <p className="concierge-comparison-note">Prices are not directly comparable because one or more prices are missing or the currencies differ. No conversion has been applied.</p> : null}
      {state.missingIds.length > 0 ? <p className="concierge-comparison-note">One or more selected listings are no longer available in the public catalogue. Refresh your shortlist before making a decision.</p> : null}
    </section>
  );
}

function OptionsPanel({ state }: { state: OptionsState }) {
  if (!state.found) return null;
  const count = state.groups.reduce((total, group) => total + group.options.length, 0);
  return (
    <section className="concierge-options-panel">
      <div className="concierge-panel-heading">
        <div><span className="eyebrow">RECORDED VEHICLE OPTIONS</span><h3>{state.vehicle ? state.vehicle.year + " " + state.vehicle.make + " " + state.vehicle.model : "Supported options"}</h3></div>
      </div>
      {count === 0 ? <p className="concierge-panel-note">No currently available Design Studio options are configured for this listing.</p> : (
        <div className="concierge-option-groups">
          {state.groups.map((group) => (
            <div key={group.groupKey}>
              <strong>{group.groupKey}</strong>
              <ul>{group.options.map((option) => (
                <li key={option.id}>
                  <span>{option.label}</span>
                  <span>{option.priceDelta === null ? "Price adjustment not provided" : option.priceDelta === 0 ? "No price adjustment recorded" : formatPrice(option.priceDelta, option.currency)}</span>
                </li>
              ))}</ul>
            </div>
          ))}
          <p className="concierge-panel-note">These are recorded options only. The interactive Design Studio experience is not available yet, so no preview or configuration has been applied.</p>
        </div>
      )}
    </section>
  );
}

function HandoverDialog({
  summary,
  onClose,
  onContinue,
}: {
  summary: string;
  onClose: () => void;
  onContinue: (summary: string) => void;
}) {
  const [reviewedSummary, setReviewedSummary] = useState(summary);
  const [preferredContact, setPreferredContact] = useState("Email or phone");
  const [preferredTime, setPreferredTime] = useState("");

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalSummary = [
      reviewedSummary.trim(),
      "Preferred contact method: " + preferredContact,
      preferredTime.trim() ? "Preferred contact time: " + preferredTime.trim() : "",
    ].filter(Boolean).join("\n\n").slice(0, 1_900);
    onContinue(finalSummary);
  }

  return (
    <div className="concierge-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="concierge-handover-dialog" role="dialog" aria-modal="true" aria-labelledby="concierge-handover-title">
        <button className="concierge-dialog-close" type="button" onClick={onClose} aria-label="Close summary review">×</button>
        <span className="eyebrow">YOUR INFORMATION, YOUR CHOICE</span>
        <h2 id="concierge-handover-title">Review before sharing</h2>
        <p>This is a short summary, not your chat transcript. Edit anything you do not want to share. It will be placed in the normal enquiry form; nothing is sent until you complete and submit that form.</p>
        <form onSubmit={handleContinue}>
          <label><span>Summary to share</span>
            <textarea value={reviewedSummary} onChange={(event) => setReviewedSummary(event.target.value)} rows={9} maxLength={1_900} />
          </label>
          <label><span>Preferred contact method</span>
            <select value={preferredContact} onChange={(event) => setPreferredContact(event.target.value)}>
              <option>Email or phone</option>
              <option>Phone call</option>
              <option>Email</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <label><span>Preferred contact time <small>(Optional)</small></span>
            <input value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} maxLength={100} placeholder="e.g. weekday afternoons" />
          </label>
          <div className="concierge-dialog-actions">
            <button type="button" className="button button-outline button-small" onClick={onClose}>Go back</button>
            <button type="submit" className="button button-gold button-small" disabled={!reviewedSummary.trim()}>Continue to contact form</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ConciergeWorkspace() {
  const router = useRouter();
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    regenerate,
    setMessages,
    clearError,
  } = useChat({
    id: "ritewheel-concierge",
    transport: new DefaultChatTransport({
      api: "/api/concierge",
      credentials: "same-origin",
    }),
    onError: (chatError) => {
      // Keep the customer-facing message generic, but preserve the actual
      // fetch/stream error in the browser console for debugging.
      console.error("[Ritewheel Concierge] Chat request failed.", chatError);
    },
  });

  const [input, setInput] = useState("");
  const [mobileTab, setMobileTab] = useState<"conversation" | "matches">("conversation");
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverSelected, setHandoverSelected] = useState<string[]>([]);
  const [handoverQuestion, setHandoverQuestion] = useState("");
  const skippedFirstPersist = useRef(false);

  const searchPart = latestToolPart(messages, "searchVehicles");
  const searchState = parseSearchState(searchPart);
  const compareState = parseComparison(latestToolPart(messages, "compareVehicles"));
  const optionsState = parseOptions(latestToolPart(messages, "getVehicleOptions"));
  const searchSignature = JSON.stringify(searchState?.criteria ?? {});
  const isBusy = status === "submitted" || status === "streaming";
  const isSearching = isToolPending(messages, "searchVehicles");

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const safe = parsed.filter((item) =>
            isRecord(item) &&
            typeof item.id === "string" &&
            (item.role === "user" || item.role === "assistant") &&
            Array.isArray(item.parts),
          ) as UIMessage[];
          Promise.resolve().then(() => setMessages(safe.slice(-24)));
        }
      }
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, [setMessages]);

  useEffect(() => {
    if (!skippedFirstPersist.current) {
      skippedFirstPersist.current = true;
      return;
    }
    try {
      const payload = JSON.stringify(persistableMessages(messages));
      if (payload.length <= 180_000) window.sessionStorage.setItem(SESSION_KEY, payload);
    } catch {
      // Storage is optional; the active in-memory conversation remains available.
    }
  }, [messages]);

  function submitPrompt(value: string) {
    const text = value.trim();
    if (!text || isBusy) return;
    clearError();
    setInput("");
    setMobileTab("conversation");
    void sendMessage({ text });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(input);
    }
  }

  function startNewConversation() {
    if (messages.length > 0 && !window.confirm("Start a new conversation? The current chat in this browser tab will be cleared.")) return;
    stop();
    setMessages([]);
    setInput("");
    setHandoverSelected([]);
    clearError();
    window.sessionStorage.removeItem(SESSION_KEY);
  }

  function toggleHandoverVehicle(vehicleId: string) {
    setHandoverSelected((current) =>
      current.includes(vehicleId)
        ? current.filter((id) => id !== vehicleId)
        : [...current, vehicleId].slice(0, 3),
    );
  }

  const allVehicles = searchState?.items ?? [];
  const selectedVehicles = allVehicles.filter((vehicle) => handoverSelected.includes(vehicle.id) && !vehicle.isDemo);

  function openHandover() {
    const lines = ["Ritewheel sales specialist handover"];
    if (searchState) {
      const preferences = describeCriteria(searchState.criteria);
      if (preferences.length) lines.push("Customer's vehicle preferences:\n" + preferences.join("\n"));
    }
    if (selectedVehicles.length) {
      lines.push("Vehicles the customer selected for this handover:\n" + selectedVehicles.map((vehicle) =>
        "- " + vehicle.year + " " + vehicle.make + " " + vehicle.model + (vehicle.trim ? " " + vehicle.trim : "") + " (Ritewheel reference: " + vehicle.id + ")",
      ).join("\n"));
    } else {
      lines.push("No specific vehicle has been selected for this handover.");
    }
    if (handoverQuestion.trim()) lines.push("Question for the sales specialist:\n" + handoverQuestion.trim());
    lines.push("Please review the customer's requirements and follow up. No price, vehicle hold or appointment has been confirmed.");
    return lines.join("\n\n").slice(0, 1_900);
  }

  function openSourceRequest() {
    const criteria = searchState?.criteria ?? {};
    const params = new URLSearchParams();
    if (criteria.make) params.set("make", criteria.make);
    if (criteria.model) params.set("model", criteria.model);
    if (criteria.minYear !== undefined) params.set("minYear", String(criteria.minYear));
    if (criteria.maxYear !== undefined) params.set("maxYear", String(criteria.maxYear));
    if (criteria.maxBudget !== undefined) params.set("budget", String(criteria.maxBudget));
    if (criteria.currency) params.set("currency", criteria.currency);
    if (criteria.condition) params.set("condition", criteria.condition);
    if (criteria.maxMileage !== undefined) {
      const value = criteria.maxMileage;
      params.set("mileagePreference", value <= 30_000 ? "Under 30,000 km" : value <= 60_000 ? "Under 60,000 km" : value <= 100_000 ? "Under 100,000 km" : "No preference");
    }
    if (criteria.requiredFeatures?.length) params.set("specifications", criteria.requiredFeatures.join(", "));
    router.push("/source-vehicle" + (params.size ? "?" + params.toString() : ""));
  }

  function openContactForm(summary: string) {
    router.push("/contact?summary=" + encodeURIComponent(summary.slice(0, 1_900)));
  }

  return (
    <main className="container concierge-page">
      <div className="concierge-page-heading">
        <div>
          <span className="eyebrow">RITEWHEEL AI CONCIERGE</span>
          <h1>Find the car that fits your life.</h1>
          <p>Describe what matters. I’ll search real Ritewheel listings, explain trade-offs and help you decide what to explore next.</p>
        </div>
        <button type="button" className="button button-outline button-small" onClick={startNewConversation}>＋ New conversation</button>
      </div>

      <div className="concierge-mobile-tabs" role="tablist" aria-label="Concierge workspace">
        <button type="button" role="tab" aria-selected={mobileTab === "conversation"} className={mobileTab === "conversation" ? "is-active" : ""} onClick={() => setMobileTab("conversation")}>
          Conversation
        </button>
        <button type="button" role="tab" aria-selected={mobileTab === "matches"} className={mobileTab === "matches" ? "is-active" : ""} onClick={() => setMobileTab("matches")}>
          Matches {searchState && searchState.totalMatched > 0 ? <span>{searchState.totalMatched}</span> : null}
        </button>
      </div>

      <div className="concierge-workspace">
        <section className={"concierge-conversation-panel " + (mobileTab === "conversation" ? "mobile-active" : "")} aria-label="Concierge conversation">
          <div className="concierge-conversation-top">
            <div className="concierge-identity">
              <span className="concierge-avatar" aria-hidden="true">R</span>
              <div><strong>Ritewheel Concierge</strong><small>Vehicle discovery assistant</small></div>
            </div>
            <span className="concierge-online-indicator"><i/> Inventory tools</span>
          </div>

          <div className="concierge-message-list" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className="concierge-welcome">
                <span className="eyebrow">YOUR PERSONAL CAR-SHOPPING ASSISTANT</span>
                <h2>Find the car that fits your life.</h2>
                <p>Tell me about your budget, your day-to-day needs or the vehicle you have in mind. I’ll search Ritewheel’s published catalogue and explain what matches.</p>
                <div className="concierge-prompt-chips">
                  {[
                    "Find a family SUV within my budget.",
                    "Help me choose an economical daily driver.",
                    "Compare two luxury SUVs.",
                    "Find a comfortable car for long journeys.",
                  ].map((prompt) => <button type="button" key={prompt} onClick={() => submitPrompt(prompt)} disabled={isBusy}>{prompt}</button>)}
                </div>
                <p className="concierge-privacy-hint">Please don’t share passwords, payment details or personal contact information here. You can provide contact details separately if you choose to contact the dealership.</p>
              </div>
            ) : (
              messages.map((message) => {
                const textParts = message.parts.filter((part) => part.type === "text");
                const content = textParts.map((part) => part.text).join("");
                const toolParts = message.parts.filter((part) => part.type.startsWith("tool-"));
                if (!content && toolParts.length === 0) return null;
                return (
                  <article key={message.id} className={"concierge-message " + (message.role === "user" ? "is-user" : "is-assistant")}>
                    {message.role === "assistant" ? <span className="concierge-message-label">RITEWHEEL CONCIERGE</span> : null}
                    {content ? <p>{content}</p> : null}
                    {toolParts.map((part, index) => {
                      const toolType = part.type.replace("tool-", "");
                      const isDone = (part as unknown as ToolPart).state === "output-available";
                      const label = toolType === "searchVehicles" ? "Checking Ritewheel inventory" :
                        toolType === "getVehicleDetails" ? "Checking recorded vehicle details" :
                        toolType === "compareVehicles" ? "Comparing vehicle records" :
                        toolType === "getVehicleOptions" ? "Checking supported vehicle options" : "Checking vehicle information";
                      return <span key={index} className="concierge-tool-status">{isDone ? "✓ " : "↻ "}{label}</span>;
                    })}
                  </article>
                );
              })
            )}
            {isBusy ? <div className="concierge-generating"><span/><span/><span/> {isSearching ? "Searching published listings…" : "Preparing a response…"}</div> : null}
          </div>

          {error ? (
            <div className="concierge-chat-error" role="alert">
              <span>The response could not be completed. Your conversation is still here.</span>
              <button type="button" onClick={() => void regenerate()} disabled={isBusy}>Retry response</button>
            </div>
          ) : null}

          <form className="concierge-composer" onSubmit={(event) => { event.preventDefault(); submitPrompt(input); }}>
            <label className="sr-only" htmlFor="concierge-message-input">Your vehicle question</label>
            <textarea
              id="concierge-message-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={2}
              maxLength={2_500}
              placeholder="Tell me what you need in a car…"
              disabled={isBusy}
            />
            <div className="concierge-composer-footer">
              <span>Enter to send · Shift + Enter for a new line</span>
              {isBusy ? (
                <button type="button" className="button button-outline button-small" onClick={stop}>Stop</button>
              ) : (
                <button type="submit" className="button button-gold button-small" disabled={!input.trim()}>Send message →</button>
              )}
            </div>
          </form>
        </section>

        <aside className={"concierge-match-panel " + (mobileTab === "matches" ? "mobile-active" : "")} aria-label="Vehicle matches and search context">
          <div className="concierge-match-panel-heading">
            <div><span className="eyebrow">DISCOVERY WORKSPACE</span><h2>Your vehicle matches</h2></div>
            {searchState && searchState.source === "database" ? <span className="concierge-match-count">{searchState.totalMatched} found</span> : null}
          </div>

          {searchState ? <SearchSummary state={searchState} /> : (
            <div className="concierge-results-placeholder">
              <span className="concierge-results-icon">⌕</span>
              <h3>Your shortlist starts here.</h3>
              <p>As we learn what matters to you, real matching vehicles and clear trade-offs will appear in this panel.</p>
            </div>
          )}

          {searchState?.source === "not_connected" ? (
            <div className="concierge-results-notice">
              <strong>Live inventory isn’t connected here yet.</strong>
              <p>I can’t confirm Ritewheel stock without the dealership database. Browse the catalogue normally instead.</p>
              <Link href="/inventory" className="button button-outline button-small">Browse inventory</Link>
            </div>
          ) : null}

          {searchState?.source === "error" ? (
            <div className="concierge-results-notice">
              <strong>Inventory could not be checked.</strong>
              <p>Nothing is being guessed. Try the search again or use normal inventory browsing.</p>
              <button type="button" className="button button-outline button-small" onClick={() => submitPrompt("Please retry the last Ritewheel inventory search using my current stated preferences.")}>Retry inventory search</button>
            </div>
          ) : null}

          {searchState?.source === "database" ? (
            <>
              {searchState.totalMatched === 0 ? (
                <div className="concierge-no-match">
                  <span className="eyebrow">NO EXACT MATCH</span>
                  <h3>Let’s widen the search.</h3>
                  <p>No published available listing matched all the filters used for this search. You can make a preference flexible or ask Ritewheel to review a sourcing request.</p>
                  <div className="concierge-no-match-actions">
                    <button type="button" className="button button-outline button-small" onClick={() => setMobileTab("conversation")}>Relax a preference</button>
                    <button type="button" className="button button-gold button-small" onClick={openSourceRequest}>Ask Ritewheel to source it</button>
                  </div>
                </div>
              ) : null}

              {searchState.items.some((vehicle) => !vehicle.isDemo) ? (
                <section className="concierge-results-group">
                  <div className="concierge-results-group-heading">
                    <span className="eyebrow">AVAILABLE ON RITEWHEEL</span>
                    <small>Published database listings · status checked during this search</small>
                  </div>
                  <div className="concierge-results-grid">
                    {searchState.items.filter((vehicle) => !vehicle.isDemo).map((vehicle) => (
                      <RecommendationCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        selected={handoverSelected.includes(vehicle.id)}
                        onToggleHandover={toggleHandoverVehicle}
                        onAskOptions={(item) => submitPrompt("Use the vehicle options tool to show me the recorded Design Studio choices for " + item.year + " " + item.make + " " + item.model + ".")}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {searchState.items.some((vehicle) => vehicle.isDemo) ? (
                <section className="concierge-results-group concierge-demo-group">
                  <div className="concierge-results-group-heading">
                    <span className="eyebrow">DEMONSTRATION EXAMPLES</span>
                    <small>Illustrative records only · not real dealer stock</small>
                  </div>
                  <div className="concierge-results-grid">
                    {searchState.items.filter((vehicle) => vehicle.isDemo).map((vehicle) => (
                      <RecommendationCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        selected={false}
                        onToggleHandover={() => undefined}
                        onAskOptions={(item) => submitPrompt("Use the vehicle options tool to show me recorded Design Studio choices for " + item.year + " " + item.make + " " + item.model + ". If it is only a demo record, label it as illustrative.")}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {searchState.totalMatched > searchState.items.length ? (
                <p className="concierge-panel-note">Showing the first {searchState.items.length} results. Ask for more or refine your preferences to narrow the shortlist.</p>
              ) : null}

              {searchState.totalMatched > 0 && !searchState.items.some((vehicle) => !vehicle.isDemo) ? (
                <div className="concierge-results-notice">
                  <strong>No real dealer listings matched this search.</strong>
                  <p>Only demo examples were returned. They are not offers and must not be treated as available stock.</p>
                  <button type="button" className="button button-gold button-small" onClick={openSourceRequest}>Ask Ritewheel to source it</button>
                </div>
              ) : null}
            </>
          ) : null}

          {searchState?.criteria ? (
            <PreferencesEditor key={searchSignature} criteria={searchState.criteria} onSubmit={submitPrompt} />
          ) : null}

          {compareState ? <ComparisonTable state={compareState} /> : null}
          {optionsState ? <OptionsPanel state={optionsState} /> : null}

          {messages.length > 0 ? (
            <div className="concierge-sales-handover">
              <div>
                <span className="eyebrow">READY FOR HUMAN HELP?</span>
                <h3>Talk to a Sales Specialist</h3>
                <p>Review a short brief and choose what to share. Your full chat is never forwarded automatically.</p>
                <label className="concierge-question-field">
                  <span>Question you want the specialist to answer <small>(Optional)</small></span>
                  <textarea value={handoverQuestion} onChange={(event) => setHandoverQuestion(event.target.value)} rows={2} maxLength={700} placeholder="What would you like the dealership to help with?" />
                </label>
                <button type="button" className="button button-gold button-small" onClick={() => setHandoverOpen(true)}>Review handover summary</button>
              </div>
            </div>
          ) : null}

          <p className="concierge-privacy-footnote">Guest conversation is kept in this browser tab only. My Garage saves remain local to this device in Release 1.</p>
        </aside>
      </div>

      {handoverOpen ? (
        <HandoverDialog
          summary={openHandover()}
          onClose={() => setHandoverOpen(false)}
          onContinue={(summary) => openContactForm(summary)}
        />
      ) : null}
    </main>
  );
}
