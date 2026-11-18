"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["REQUESTED", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const;
type TestDriveStatus = (typeof statuses)[number];

function statusLabel(status: TestDriveStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function TestDriveStatusForm({
  requestId,
  initialStatus,
  requestedDate,
  requestedTime,
  initialConfirmedDate,
  initialConfirmedTime,
}: {
  requestId: string;
  initialStatus: TestDriveStatus;
  requestedDate: string;
  requestedTime: string;
  initialConfirmedDate: string | null;
  initialConfirmedTime: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TestDriveStatus>(initialStatus);
  const [confirmedDate, setConfirmedDate] = useState(initialConfirmedDate ?? requestedDate);
  const [confirmedTime, setConfirmedTime] = useState(initialConfirmedTime ?? requestedTime);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const appointmentChanged = status === "ACCEPTED" && (
    confirmedDate !== (initialConfirmedDate ?? requestedDate) ||
    confirmedTime !== (initialConfirmedTime ?? requestedTime)
  );
  const unchanged = status === initialStatus && !appointmentChanged;

  async function save() {
    if (saving || unchanged) return;
    setSaving(true);
    setFeedback("");

    const payload = {
      status,
      ...(status === "ACCEPTED" ? { confirmedDate, confirmedTime } : {}),
    };

    try {
      const response = await fetch("/api/admin/test-drives/" + requestId, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const errorMessage =
        typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "The test-drive request could not be updated.";

      if (!response.ok) {
        setFeedback(errorMessage);
        return;
      }

      setFeedback("Test-drive request updated.");
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
            setStatus(event.target.value as TestDriveStatus);
            setFeedback("");
          }}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>{statusLabel(item)}</option>
          ))}
        </select>
      </label>

      {status === "ACCEPTED" ? (
        <div className="admin-confirmed-appointment">
          <p>The appointment is only accepted when you save these exact details.</p>
          <label className="admin-field">
            <span>Confirmed date</span>
            <input type="date" value={confirmedDate} onChange={(event) => setConfirmedDate(event.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Confirmed time (WAT)</span>
            <input type="time" value={confirmedTime} onChange={(event) => setConfirmedTime(event.target.value)} required step={900} />
          </label>
        </div>
      ) : null}

      <button
        className="button button-gold button-small"
        type="button"
        onClick={save}
        disabled={saving || unchanged}
      >
        {saving ? "Saving…" : "Save update"}
      </button>
      {feedback ? (
        <p className={feedback === "Test-drive request updated." ? "admin-status-feedback is-success" : "admin-status-feedback"} role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
