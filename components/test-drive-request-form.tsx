"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function TestDriveRequestForm({ vehicleSlug }: { vehicleSlug: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      vehicleSlug,
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      preferredDate: String(formData.get("preferredDate") ?? ""),
      preferredTime: String(formData.get("preferredTime") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/test-drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const resultMessage =
        typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "We could not submit your request. Please try again.";

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
      setMessage(`Your test-drive request reference is ${reference}. The dealership will contact you after reviewing your preferred time.`);
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
        <h2>Your request is with the dealership.</h2>
        <p>{message}</p>
        <p>A test drive is not confirmed until you receive an appointment confirmation from Ritewheel.</p>
      </div>
    );
  }

  const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

  return (
    <form className="contact-form test-drive-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Your name</span>
        <input name="customerName" required minLength={2} maxLength={100} autoComplete="name" />
      </label>

      <label className="field">
        <span>Email address</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>

      <label className="field">
        <span>Phone number</span>
        <input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" />
      </label>

      <div className="test-drive-fields-grid">
        <label className="field">
          <span>Preferred date</span>
          <input name="preferredDate" type="date" required min={localToday} />
        </label>
        <label className="field">
          <span>Preferred time (WAT)</span>
          <input name="preferredTime" type="time" required step={900} />
        </label>
      </div>

      <label className="field">
        <span>Anything we should know? <small>(Optional)</small></span>
        <textarea name="notes" maxLength={1200} rows={4} placeholder="Share any details that will help us prepare…" />
      </label>

      <div className="enquiry-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message ? <p className="form-message" role="alert">{message}</p> : null}

      <button className="button button-gold" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending request…" : "Request a test drive"}
        <span aria-hidden="true">→</span>
      </button>

      <p className="form-note">
        Your preferred time is a request, not a confirmed appointment. The dealership will contact you if it can offer that slot or needs to suggest another time.
      </p>
    </form>
  );
}
