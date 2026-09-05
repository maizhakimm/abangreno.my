"use client";

import { useState } from "react";

export default function PhoneVerificationForm({
  onVerified,
}: {
  onVerified: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/profile/send-phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal menghantar OTP");
      setStatus("error");
      return;
    }
    setStep("otp");
    setStatus("idle");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/profile/verify-phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, token: otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Kod OTP tidak sah");
      setStatus("error");
      return;
    }
    if (!data.phone) {
      setError("Nombor telefon yang disahkan tidak dapat dikenal pasti");
      setStatus("error");
      return;
    }
    onVerified(data.phone);
  }

  return (
    <div className="rounded-card border border-black/10 bg-white p-5">
      <h2 className="font-bold">Sahkan Nombor Telefon</h2>
      <p className="mt-1 text-xs text-charcoal/60">
        Pengesahan nombor telefon diperlukan sebelum anda boleh mendaftar sebagai vendor.
        Nombor yang disahkan akan digunakan sebagai nombor telefon rasmi profil anda.
      </p>

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="mt-3 space-y-3">
          <input
            type="tel"
            required
            placeholder="+60123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Hantar Kod OTP
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-3 space-y-3">
          <input
            required
            placeholder="Kod OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Sahkan
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
