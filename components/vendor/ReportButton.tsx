"use client";

import { useState } from "react";
import type { ReportTargetType } from "@/types/database";

/** §17/§24 — report button at bottom of vendor page; never auto-removes content. */
export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formData: FormData) {
    const reason = formData.get("reason") as string;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-xs text-charcoal/50">Terima kasih. Laporan anda telah dihantar untuk semakan.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring text-xs font-medium text-charcoal/40 hover:text-red-600"
      >
        Laporkan profil ini
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2">
      <select name="reason" required className="focus-ring rounded border border-black/10 text-xs">
        <option value="">Pilih sebab</option>
        <option value="spam">Spam / palsu</option>
        <option value="incorrect_info">Maklumat tidak tepat</option>
        <option value="inappropriate">Kandungan tidak sesuai</option>
        <option value="other">Lain-lain</option>
      </select>
      <button type="submit" className="focus-ring text-xs font-semibold text-brand">
        Hantar
      </button>
    </form>
  );
}
