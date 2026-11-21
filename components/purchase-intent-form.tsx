"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type Props = {
  vehicleSlug: string;
};

export function PurchaseIntentForm({ vehicleSlug }: Props) {
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
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/purchase-intents", {
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
      setMessage(`Your purchase-interest reference is ${reference}. The Ritewheel team will review your request and contact you about the next steps.`);
      form.reset();
    } catch {
      setState("error");
      setMessage("A connection problem prevented the request from being submitted. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="enquiry-success" role="status" aria-live="polite">
        <span className="eyebrow">PURCHASE INTEREST RECEIVED</span>
        <h2>Thank you for your interest.</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
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

      <label className="field">
        <span>Anything else the team should know? (optional)</span>
        <textarea name="message" maxLength={1500} rows={4} placeholder="A good time to contact you, questions about the vehicle, or other details…" />
      </label>

      <div className="enquiry-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message ? <p className="form-message" role="alert">{message}</p> : null}

      <button className="button button-gold" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending request…" : "Send purchase interest"}
        <span aria-hidden="true">→</span>
      </button>

      <p className="form-note">
        No account is needed. This request does not reserve the vehicle, lock the price or collect payment. Ritewheel will verify the vehicle and provide any formal offer separately.
      </p>
    </form>
  );
}
