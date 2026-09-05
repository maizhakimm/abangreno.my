"use client";

import { useState } from "react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

/**
 * Guest forum posting form (§20). No login required. Real Cloudflare
 * Turnstile challenge — the resulting token is verified server-side in
 * app/api/forum/post/route.ts against Cloudflare Siteverify before any
 * database write happens (§5).
 */
export default function NewQuestionForm({ categorySlug }: { categorySlug: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!turnstileToken) {
      setErrorMessage("Sila lengkapkan pengesahan captcha.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/forum/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_slug: categorySlug,
        title: formData.get("title"),
        content: formData.get("content"),
        guest_name: formData.get("guest_name"),
        location_tag: formData.get("location_tag"),
        turnstile_token: turnstileToken,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal menghantar soalan. Sila cuba lagi.");
      setStatus("error");
      return;
    }

    setStatus("done");
    form.reset();
    setTurnstileToken(null);
  }

  if (status === "done") {
    return (
      <p className="mt-4 text-sm text-green-700">
        Terima kasih! Soalan anda telah dihantar dan sedang menunggu semakan.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        name="title"
        required
        minLength={10}
        placeholder="Tajuk soalan"
        className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />
      <textarea
        name="content"
        required
        minLength={20}
        rows={4}
        placeholder="Terangkan soalan anda dengan lebih lanjut..."
        className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />
      <div className="flex gap-3">
        <input
          name="guest_name"
          placeholder="Nama (pilihan)"
          className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <input
          name="location_tag"
          placeholder="Lokasi (pilihan)"
          className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <TurnstileWidget onVerify={setTurnstileToken} />

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !turnstileToken}
        className="focus-ring rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menghantar..." : "Hantar Soalan"}
      </button>
    </form>
  );
}
