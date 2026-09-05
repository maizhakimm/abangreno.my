"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/review/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        review_id: reviewId,
        vendor_reply: formData.get("vendor_reply"),
      }),
    });

    if (res.ok) {
      router.refresh();
    }
    setStatus("idle");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-semibold text-brand">
        Balas ulasan ini
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        name="vendor_reply"
        required
        minLength={1}
        rows={2}
        placeholder="Tulis balasan anda..."
        className="focus-ring w-full rounded-lg border border-black/10 px-2 py-1.5 text-xs"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="focus-ring rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menghantar..." : "Hantar Balasan"}
      </button>
    </form>
  );
}
