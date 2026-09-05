"use client";

import { useState } from "react";

export default function ModerationActions({
  table,
  id,
}: {
  table: "forum_posts" | "forum_replies";
  id: string;
}) {
  const [done, setDone] = useState(false);

  async function setStatus(status: "visible" | "removed") {
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, status }),
    });
    setDone(true);
  }

  if (done) return <p className="mt-2 text-xs text-green-700">Updated.</p>;

  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => setStatus("visible")}
        className="focus-ring rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      >
        Approve
      </button>
      <button
        onClick={() => setStatus("removed")}
        className="focus-ring rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Remove
      </button>
    </div>
  );
}
