"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type InitialValues = {
  requestedMake?: string;
  requestedModel?: string;
  requestedTrim?: string;
  minYear?: number;
  maxYear?: number;
  conditionPreference?: "No preference" | "Brand new" | "Used";
  budget?: number;
  currency?: "NGN" | "USD" | "GBP" | "EUR";
  mileagePreference?: "No preference" | "Under 30,000 km" | "Under 60,000 km" | "Under 100,000 km";
  requiredSpecifications?: string;
  notes?: string;
};

export function SourcingRequestForm({ initialValues }: { initialValues?: InitialValues } = {}) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const minYearRaw = String(formData.get("minYear") ?? "").trim();
    const maxYearRaw = String(formData.get("maxYear") ?? "").trim();
    const budgetRaw = String(formData.get("budget") ?? "").trim();

    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      requestedMake: String(formData.get("requestedMake") ?? ""),
      requestedModel: String(formData.get("requestedModel") ?? ""),
      requestedTrim: String(formData.get("requestedTrim") ?? ""),
      minYear: minYearRaw ? Number(minYearRaw) : null,
      maxYear: maxYearRaw ? Number(maxYearRaw) : null,
      conditionPreference: String(formData.get("conditionPreference") ?? "No preference"),
      budget: budgetRaw ? Number(budgetRaw) : null,
      currency: String(formData.get("currency") ?? "NGN"),
      mileagePreference: String(formData.get("mileagePreference") ?? "No preference"),
      requiredSpecifications: String(formData.get("requiredSpecifications") ?? ""),
      preferredLocation: String(formData.get("preferredLocation") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/sourcing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const resultMessage =
        typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "We could not submit your vehicle request. Please try again.";

      if (!response.ok) {
        setState("error");
        setMessage(resultMessage);
        return;
      }

      const reference =
        typeof result === "object" && result !== null && "reference" in result && typeof result.reference === "string"
          ? result.reference
          : "received";

      setState("success");
      setMessage("Your vehicle request reference is " + reference + ". The dealership will review your requirements and contact you.");
      form.reset();
    } catch {
      setState("error");
      setMessage("A connection problem prevented the request from being submitted. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="enquiry-success" role="status" aria-live="polite">
        <span className="eyebrow">REQUEST RECEIVED</span>
        <h2>We have your vehicle brief.</h2>
        <p>{message}</p>
        <p>A request does not guarantee that a vehicle can be found, reserved or purchased. The dealership must verify an actual supply option first.</p>
      </div>
    );
  }

  return (
    <form className="contact-form sourcing-request-form" onSubmit={handleSubmit}>
      <div className="sourcing-form-section">
        <div className="sourcing-form-section-heading">
          <span className="eyebrow">01 · THE VEHICLE</span>
          <p>Share as much or as little detail as you know.</p>
        </div>
        <div className="sourcing-form-grid">
          <label className="field">
            <span>Make</span>
            <input name="requestedMake" maxLength={80} defaultValue={initialValues?.requestedMake ?? ""} placeholder="e.g. Toyota" />
          </label>
          <label className="field">
            <span>Model</span>
            <input name="requestedModel" maxLength={80} defaultValue={initialValues?.requestedModel ?? ""} placeholder="e.g. Land Cruiser" />
          </label>
          <label className="field">
            <span>Trim or variant <small>(Optional)</small></span>
            <input name="requestedTrim" maxLength={100} defaultValue={initialValues?.requestedTrim ?? ""} placeholder="e.g. Prado VX-L" />
          </label>
          <label className="field">
            <span>Condition</span>
            <select name="conditionPreference" defaultValue={initialValues?.conditionPreference ?? "No preference"}>
              <option>No preference</option>
              <option>Brand new</option>
              <option>Used</option>
            </select>
          </label>
          <label className="field">
            <span>Earliest year <small>(Optional)</small></span>
            <input name="minYear" type="number" min="1900" max="2100" step="1" defaultValue={initialValues?.minYear ?? ""} placeholder="e.g. 2020" />
          </label>
          <label className="field">
            <span>Latest year <small>(Optional)</small></span>
            <input name="maxYear" type="number" min="1900" max="2100" step="1" defaultValue={initialValues?.maxYear ?? ""} placeholder="e.g. 2025" />
          </label>
          <label className="field">
            <span>Budget <small>(Optional)</small></span>
            <input name="budget" type="number" min="1" max="999999999999" step="any" defaultValue={initialValues?.budget ?? ""} placeholder="Enter amount" />
          </label>
          <label className="field">
            <span>Budget currency</span>
            <select name="currency" defaultValue={initialValues?.currency ?? "NGN"}>
              <option value="NGN">NGN · Nigerian naira</option>
              <option value="USD">USD · US dollar</option>
              <option value="GBP">GBP · British pound</option>
              <option value="EUR">EUR · Euro</option>
            </select>
          </label>
          <label className="field">
            <span>Mileage preference</span>
            <select name="mileagePreference" defaultValue={initialValues?.mileagePreference ?? "No preference"}>
              <option>No preference</option>
              <option>Under 30,000 km</option>
              <option>Under 60,000 km</option>
              <option>Under 100,000 km</option>
            </select>
          </label>
          <label className="field">
            <span>Preferred location <small>(Optional)</small></span>
            <input name="preferredLocation" maxLength={120} placeholder="City or delivery area" />
          </label>
          <label className="field sourcing-field-wide">
            <span>Must-have specifications <small>(Optional)</small></span>
            <textarea name="requiredSpecifications" maxLength={2000} rows={3} defaultValue={initialValues?.requiredSpecifications ?? ""} placeholder="Seats, transmission, fuel, colour, features or anything important…" />
          </label>
        </div>
      </div>

      <div className="sourcing-form-section">
        <div className="sourcing-form-section-heading">
          <span className="eyebrow">02 · YOUR DETAILS</span>
          <p>How can the dealership reach you?</p>
        </div>
        <label className="field">
          <span>Your name</span>
          <input name="customerName" required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label className="field">
          <span>Email address</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label className="field">
          <span>Phone number <small>(Recommended)</small></span>
          <input name="phone" type="tel" minLength={7} maxLength={30} autoComplete="tel" />
        </label>
        <label className="field">
          <span>Anything else? <small>(Optional)</small></span>
          <textarea name="notes" maxLength={1500} rows={4} defaultValue={initialValues?.notes ?? ""} placeholder="Timing, delivery expectations or other context…" />
        </label>
      </div>

      <div className="enquiry-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message ? <p className="form-message" role="alert">{message}</p> : null}

      <button className="button button-gold" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending vehicle brief…" : "Send vehicle request"}
        <span aria-hidden="true">→</span>
      </button>

      <p className="form-note">
        Ritewheel will use your details to respond to this request. A sourcing request is not a stock offer, reservation or purchase commitment. Do not include payment details or passwords.
      </p>
    </form>
  );
}
