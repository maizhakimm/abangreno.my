"use client";

import { useState } from "react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

export default function ReplyForm({ postId }: { postId: string }) {
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

    const res = await fetch("/api/forum/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postId,
        content: formData.get("content"),
        guest_name: formData.get("guest_name"),
        turnstile_token: turnstileToken,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal menghantar jawapan. Sila cuba lagi.");
      setStatus("error");
      return;
    }

    setStatus("done");
    form.reset();
    setTurnstileToken(null);
  }

  if (status === "done") {
    return <p className="mt-3 text-sm text-green-700">Jawapan anda telah dihantar untuk semakan.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <textarea
        name="content"
        required
        minLength={5}
        rows={3}
        placeholder="Tulis jawapan anda..."
        className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />
      <input
        name="guest_name"
        placeholder="Nama (pilihan)"
        className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm sm:w-1/2"
      />

      <TurnstileWidget onVerify={setTurnstileToken} />

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !turnstileToken}
        className="focus-ring rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menghantar..." : "Hantar Jawapan"}
      </button>
    </form>
  );
}
