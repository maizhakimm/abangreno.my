"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Reusable Cloudflare Turnstile widget (§5). Loads the Turnstile script once,
 * renders the challenge, and reports the resulting token to the parent form
 * via onVerify. The parent must not submit until a non-empty token exists —
 * the server independently re-verifies the token against Cloudflare
 * Siteverify regardless (see lib/security/turnstile.ts), so this component
 * is a UX gate, not the security boundary itself.
 */
export default function TurnstileWidget({ onVerify }: { onVerify: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile || !siteKey) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onVerify(token),
      "error-callback": () => onVerify(null),
      "expired-callback": () => onVerify(null),
      theme: "light",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, siteKey]);

  if (!siteKey) {
    return (
      <p className="text-xs text-red-600">
        NEXT_PUBLIC_TURNSTILE_SITE_KEY belum ditetapkan — sila konfigurasikan di .env.local
      </p>
    );
  }

  return <div ref={containerRef} className="my-2" />;
}
