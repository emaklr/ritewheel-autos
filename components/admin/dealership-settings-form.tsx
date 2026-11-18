"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type InitialSettings = {
  displayName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  whatsappNumber: string;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  openingHours: string | null;
};

export function DealershipSettingsForm({ initialSettings }: { initialSettings: InitialSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [invalidField, setInvalidField] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries([
      "displayName",
      "contactPhone",
      "contactEmail",
      "whatsappNumber",
      "addressLine",
      "city",
      "state",
      "country",
      "openingHours",
    ].map((field) => [field, String(formData.get(field) ?? "")]));

    setSaving(true);
    setFeedback("");
    setFeedbackIsError(false);
    setInvalidField("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "The settings could not be saved.";
        const field =
          typeof result === "object" && result !== null && "field" in result && typeof result.field === "string"
            ? result.field
            : "";
        setInvalidField(field);
        setFeedback(errorMessage);
        setFeedbackIsError(true);
        return;
      }

      setFeedback("Dealership settings saved.");
      setFeedbackIsError(false);
      router.refresh();
    } catch {
      setFeedback("A connection problem prevented the settings from being saved. Please try again.");
      setFeedbackIsError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-settings-form" onSubmit={handleSubmit}>
      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>01</span>
          <div>
            <h2>Dealership identity</h2>
            <p>This display name is shown in the public site header and footer.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide">
            <span>Public dealership / display name</span>
            <input
              name="displayName"
              required
              minLength={2}
              maxLength={100}
              defaultValue={initialSettings.displayName}
              aria-invalid={invalidField === "displayName"}
            />
          </label>
        </div>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>02</span>
          <div>
            <h2>Contact channels</h2>
            <p>Only the contact methods you provide will appear publicly.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Contact phone</span>
            <input
              name="contactPhone"
              type="tel"
              maxLength={30}
              autoComplete="tel"
              placeholder="e.g. +234 800 000 0000"
              defaultValue={initialSettings.contactPhone ?? ""}
              aria-invalid={invalidField === "contactPhone"}
            />
          </label>
          <label className="admin-field">
            <span>Contact email</span>
            <input
              name="contactEmail"
              type="email"
              maxLength={254}
              autoComplete="email"
              placeholder="e.g. hello@example.com"
              defaultValue={initialSettings.contactEmail ?? ""}
              aria-invalid={invalidField === "contactEmail"}
            />
          </label>
          <label className="admin-field admin-field-wide">
            <span>WhatsApp number</span>
            <input
              name="whatsappNumber"
              type="tel"
              maxLength={32}
              placeholder="e.g. +234 800 000 0000"
              defaultValue={initialSettings.whatsappNumber}
              aria-invalid={invalidField === "whatsappNumber"}
            />
            <small className="admin-field-help">Include the country code and leading +. A WhatsApp click-to-chat link will be created from this number.</small>
          </label>
        </div>
      </section>

      <section className="admin-form-panel">
        <div className="admin-form-section-heading">
          <span>03</span>
          <div>
            <h2>Location and opening hours</h2>
            <p>Leave any detail blank until it is ready to be shown to customers.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide">
            <span>Address</span>
            <input
              name="addressLine"
              maxLength={160}
              autoComplete="street-address"
              placeholder="Street address or dealership location"
              defaultValue={initialSettings.addressLine ?? ""}
              aria-invalid={invalidField === "addressLine"}
            />
          </label>
          <label className="admin-field">
            <span>City</span>
            <input name="city" maxLength={80} autoComplete="address-level2" defaultValue={initialSettings.city ?? ""} aria-invalid={invalidField === "city"} />
          </label>
          <label className="admin-field">
            <span>State / region</span>
            <input name="state" maxLength={80} autoComplete="address-level1" defaultValue={initialSettings.state ?? ""} aria-invalid={invalidField === "state"} />
          </label>
          <label className="admin-field">
            <span>Country</span>
            <input name="country" maxLength={80} autoComplete="country-name" defaultValue={initialSettings.country ?? ""} aria-invalid={invalidField === "country"} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Opening hours</span>
            <textarea
              name="openingHours"
              rows={5}
              maxLength={700}
              placeholder="Use one line per day or range"
              defaultValue={initialSettings.openingHours ?? ""}
              aria-invalid={invalidField === "openingHours"}
            />
          </label>
        </div>
      </section>

      {feedback ? (
        <p className={feedbackIsError ? "admin-form-error" : "admin-settings-success"} role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      <div className="admin-form-actions">
        <button className="button button-gold" type="submit" disabled={saving}>
          {saving ? "Saving settings…" : "Save public settings"}
        </button>
      </div>
    </form>
  );
}
