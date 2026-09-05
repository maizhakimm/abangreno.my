"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign-in UI for Google, email magic link, and phone OTP.
 * OAuth and email PKCE flows return through /auth/callback so the auth code
 * can be exchanged server-side and persisted in cookies for SSR routes.
 */
export default function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("redirectTo");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";

  const [mode, setMode] = useState<"choice" | "email" | "phone">("choice");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function getCallbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getCallbackUrl() },
    });
    if (error) setMessage(error.message);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getCallbackUrl() },
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
    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.assign(nextPath);
  }

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
