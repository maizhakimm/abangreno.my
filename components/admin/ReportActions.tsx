"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportTargetType } from "@/types/database";

const TARGET_STATUS_OPTIONS: Record<ReportTargetType, { value: string; label: string }[]> = {
  forum_post: [
    { value: "removed", label: "Remove post" },
    { value: "visible", label: "Keep visible" },
  ],
  forum_reply: [
    { value: "removed", label: "Remove reply" },
    { value: "visible", label: "Keep visible" },
  ],
  review: [
    { value: "removed", label: "Remove review" },
    { value: "flagged", label: "Flag review" },
    { value: "visible", label: "Keep visible" },
  ],
  vendor: [
    { value: "deactivate", label: "Deactivate vendor" },
    { value: "reactivate", label: "Reactivate vendor" },
  ],
};

export default function ReportActions({
  reportId,
  targetType,
}: {
  reportId: string;
  targetType: ReportTargetType;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [chosenStatus, setChosenStatus] = useState("");

  async function submit(decision: "mark_reviewed" | "take_action", target_status?: string) {
    setStatus("loading");
    setErrorMessage(null);

    const res = await fetch("/api/admin/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, decision, target_status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal memproses laporan.");
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return <p className="mt-2 text-xs font-semibold text-green-700">Done.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => submit("mark_reviewed")}
          disabled={status === "loading"}
          className="focus-ring rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold hover:border-brand disabled:opacity-50"
        >
          {status === "loading" ? "Working..." : "Mark Reviewed"}
        </button>
        <button
          onClick={() => setShowActionPicker((v) => !v)}
          disabled={status === "loading"}
          className="focus-ring rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Take Action
        </button>
      </div>

      {showActionPicker && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-offwhite p-2">
          <select
            value={chosenStatus}
            onChange={(e) => setChosenStatus(e.target.value)}
            className="focus-ring rounded border border-black/10 text-xs"
          >
            <option value="">Choose action…</option>
            {TARGET_STATUS_OPTIONS[targetType].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => chosenStatus && submit("take_action", chosenStatus)}
            disabled={!chosenStatus || status === "loading"}
            className="focus-ring rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      )}

      {status === "error" && errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
