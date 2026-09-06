"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Shown in place of the vendor registration form when
 * lib/auth/email.isEmailVerified(user) returns false server-side. Offers a
 * one-click resend for email/password or magic-link accounts; Google OAuth
 * accounts should essentially never land here since Google-confirmed
 * emails are already marked confirmed by Supabase on sign-in.
 */
export default function UnverifiedEmailNotice({ email }: { email: string | null }) {
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resendVerification() {
    if (!email) return;
    setStatus("sending");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="rounded-card border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-bold text-amber-900">Sahkan Emel Anda Dahulu</h2>
      <p className="mt-2 text-sm text-amber-800">
        Sebelum mendaftar sebagai vendor, sila sahkan alamat emel akaun anda
        {email && <> (<span className="font-medium">{email}</span>)</>}. Kami menghantar pautan
        pengesahan ke emel anda semasa pendaftaran akaun — semak peti masuk (dan folder spam) anda.
      </p>
      {email && (
        <button
          onClick={resendVerification}
          disabled={status === "sending" || status === "sent"}
          className="focus-ring mt-4 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
        >
          {status === "sending"
            ? "Menghantar..."
            : status === "sent"
              ? "Emel pengesahan dihantar ✓"
              : "Hantar Semula Emel Pengesahan"}
        </button>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-700">Gagal menghantar. Sila cuba lagi sebentar lagi.</p>
      )}
    </div>
  );
}
