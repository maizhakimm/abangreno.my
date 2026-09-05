"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * §15 — Phone OTP UI abstraction. Actual SMS provider is configured later
 * via Supabase Auth settings + env vars; this component just calls the
 * standard Supabase Auth phone methods, which work once a provider is set.
 */
export default function LoginForm() {
  const supabase = createClient();
  const [mode, setMode] = useState<"choice" | "email" | "phone">("choice");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setMessage(error ? error.message : "Pautan log masuk telah dihantar ke emel anda.");
  }

  async function handleSendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setMessage(error.message);
    } else {
      setOtpSent(true);
      setMessage("Kod OTP telah dihantar melalui SMS.");
    }
  }

  async function handleVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setMessage(error ? error.message : "Log masuk berjaya!");
  }

  // Note: this component handles SIGN-IN via phone (an existing account
  // logging in with an already-verified phone). Mandatory phone verification
  // for accounts that signed up via Google/email — required before vendor
  // registration — is a separate step, handled by PhoneVerificationForm
  // (components/auth/PhoneVerificationForm.tsx) using /api/profile/send-phone-otp
  // and /api/profile/verify-phone-otp, which are the only endpoints trusted
  // to flip profiles.phone_verified.

  if (mode === "choice") {
    return (
      <div className="space-y-3">
        <button
          onClick={handleGoogleLogin}
          className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold hover:border-brand"
        >
          Log Masuk dengan Google
        </button>
        <button
          onClick={() => setMode("email")}
          className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold hover:border-brand"
        >
          Log Masuk dengan Emel
        </button>
        <button
          onClick={() => setMode("phone")}
          className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold hover:border-brand"
        >
          Log Masuk dengan Nombor Telefon
        </button>
      </div>
    );
  }

  if (mode === "email") {
    return (
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Emel anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="focus-ring w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Hantar Pautan Log Masuk
        </button>
        {message && <p className="text-xs text-charcoal/60">{message}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={otpSent ? handleVerifyPhoneOtp : handleSendPhoneOtp} className="space-y-3">
      <input
        type="tel"
        required
        placeholder="+60123456789"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={otpSent}
        className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm disabled:bg-offwhite"
      />
      {otpSent && (
        <input
          required
          placeholder="Kod OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      )}
      <button
        type="submit"
        className="focus-ring w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {otpSent ? "Sahkan OTP" : "Hantar OTP"}
      </button>
      {message && <p className="text-xs text-charcoal/60">{message}</p>}
    </form>
  );
}
