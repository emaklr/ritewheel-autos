"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function EnquiryForm({ vehicleSlug }: { vehicleSlug?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("submitting");
    setMessage("");
    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      vehicleSlug: vehicleSlug ?? String(formData.get("vehicleSlug") ?? ""),
      website: String(formData.get("website") ?? "")
    };

    try {
      const response = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        setState("error");
        setMessage(result.error ?? "We could not submit your request. Please try again.");
        return;
      }
      setState("success");
      setMessage("Your enquiry reference is " + result.reference + ". The dealership can now follow up with you.");
    } catch {
      setState("error");
      setMessage("A connection problem prevented the request from being submitted. Please try again.");
    }
  }

  if (state === "success") {
    return <div className="empty-state"><h2>Thank you. Your request was received.</h2><p>{message}</p></div>;
  }

  return (
    <form
      className="contact-form"
      onSubmit={async (event) => {
        event.preventDefault();
        await submit(new FormData(event.currentTarget));
      }}
    >
      {vehicleSlug && <input type="hidden" name="vehicleSlug" value={vehicleSlug} />}
      <label>Your name<input name="customerName" required minLength={2} maxLength={100} autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label>Phone number<input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" /></label>
      <label>How can we help?<textarea name="message" maxLength={2000} placeholder="Tell us what you would like to know..." /></label>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {message && <p role="alert" className="notice">{message}</p>}
      <button type="submit" className="button button-gold" disabled={state === "submitting"}>{state === "submitting" ? "Sending..." : "Send enquiry"}</button>
      <p className="form-note">Your contact details will be used to respond to this request. Do not include payment details or passwords.</p>
    </form>
  );
}