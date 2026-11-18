"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const transitions = {
  NEW: ["REVIEWING", "DECLINED", "CANCELLED", "CLOSED"],
  REVIEWING: ["SOURCING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
  SOURCING: ["REVIEWING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
  MATCH_FOUND: ["SOURCING", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
  UNAVAILABLE: [],
  DECLINED: [],
  CANCELLED: [],
  CLOSED: [],
} as const;

type SourcingStatus = keyof typeof transitions;

function statusLabel(status: SourcingStatus) {
  return status.split("_").map((part) => part.charAt(0) + part.slice(1).toLowerCase()).join(" ");
}

export function SourcingRequestStatusForm({
  requestId,
  initialStatus,
}: {
  requestId: string;
  initialStatus: SourcingStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SourcingStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const options = [initialStatus, ...transitions[initialStatus]];

  async function save() {
    if (saving || status === initialStatus) return;
    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/sourcing-requests/" + requestId, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const errorMessage =
        typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "The vehicle request could not be updated.";

      if (!response.ok) {
        setFeedback(errorMessage);
        return;
      }

      setFeedback("Request status updated.");
      router.refresh();
    } catch {
      setFeedback("A connection problem prevented the update. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-status-editor">
      <label className="admin-field">
        <span>Request status</span>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as SourcingStatus);
            setFeedback("");
          }}
        >
          {options.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
        </select>
      </label>
      <button
        className="button button-gold button-small"
        type="button"
        onClick={save}
        disabled={saving || status === initialStatus}
      >
        {saving ? "Saving…" : "Save status"}
      </button>
      {feedback ? (
        <p className={feedback === "Request status updated." ? "admin-status-feedback is-success" : "admin-status-feedback"} role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}
      <p className="admin-field-help">Status changes are saved to the administrator audit log. A match does not become a quote or availability promise.</p>
    </div>
  );
}
