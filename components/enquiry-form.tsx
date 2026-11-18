"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type Props = {
  vehicleSlug?: string;
  initialMessage?: string;
};

export function EnquiryForm({ vehicleSlug, initialMessage }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      vehicleSlug: vehicleSlug ?? "",
      website: String(formData.get("website") ?? ""),
    };

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/enquiries", {
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
      setMessage(`Your enquiry reference is ${reference}. The dealership can follow up after reviewing your request.`);
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
        <h2>Thank you for contacting Ritewheel.</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {vehicleSlug ? <input type="hidden" name="vehicleSlug" value={vehicleSlug} /> : null}

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
        <span>How can we help?</span>
        {initialMessage ? <p className="concierge-handover-prefill-note">You reviewed this Concierge handover summary. You can edit it before sending.</p> : null}
        <textarea name="message" maxLength={2000} rows={5} defaultValue={initialMessage ?? ""} placeholder="Tell us what you would like to know…" />
      </label>

      <div className="enquiry-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message ? <p className="form-message" role="alert">{message}</p> : null}

      <button className="button button-gold" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending enquiry…" : "Send enquiry"}
        <span aria-hidden="true">→</span>
      </button>

      <p className="form-note">
        Your contact details will be used to respond to this request. Submitting an enquiry does not reserve a vehicle or lock its price. Do not include payment details or passwords.
      </p>
    </form>
  );
}
