import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = buildMetadata({
  title: "Log Masuk",
  description: "Log masuk ke akaun AbangReno.my anda menggunakan Google atau emel.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-extrabold">Log Masuk</h1>
      <p className="mt-2 text-center text-sm text-charcoal/70">
        Log masuk untuk menguruskan profil vendor, memberi ulasan atau mengakses dashboard anda.
      </p>
      <div className="mt-6 w-full rounded-card bg-white p-5 shadow-sm">
        <Suspense fallback={<p className="text-sm text-charcoal/60">Memuatkan...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
