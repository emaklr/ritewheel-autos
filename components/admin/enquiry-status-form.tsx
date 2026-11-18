"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"] as const;
type EnquiryStatus = (typeof statuses)[number];

function statusLabel(status: EnquiryStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function EnquiryStatusForm({
  enquiryId,
  initialStatus,
}: {
  enquiryId: string;
  initialStatus: EnquiryStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<EnquiryStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function saveStatus() {
    if (saving || status === initialStatus) return;

    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/enquiries/" + enquiryId, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const errorMessage =
        typeof result === "object" &&
        result !== null &&
        "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "The status could not be updated.";

      if (!response.ok) {
        setFeedback(errorMessage);
        return;
      }

      setFeedback("Status updated successfully.");
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
        <span>Update status</span>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as EnquiryStatus);
            setFeedback("");
          }}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>{statusLabel(item)}</option>
          ))}
        </select>
      </label>
      <button
        className="button button-gold button-small"
        type="button"
        onClick={saveStatus}
        disabled={saving || status === initialStatus}
      >
        {saving ? "Saving…" : "Save status"}
      </button>
      {feedback ? (
        <p
          className={feedback === "Status updated successfully." ? "admin-status-feedback is-success" : "admin-status-feedback"}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
