"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VendorProfileFields {
  business_name: string;
  phone: string | null;
  whatsapp: string | null;
  description: string | null;
}

export default function VendorProfileEditForm({ vendor }: { vendor: VendorProfileFields }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/vendor/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: formData.get("business_name"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        description: formData.get("description"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal menyimpan. Sila cuba lagi.");
      setStatus("error");
      return;
    }

    setStatus("idle");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label className="block text-sm font-medium">Nama Perniagaan</label>
        <input
          name="business_name"
          defaultValue={vendor.business_name}
          required
          minLength={3}
          className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input
            name="phone"
            defaultValue={vendor.phone ?? ""}
            required
            className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">WhatsApp</label>
          <input
            name="whatsapp"
            defaultValue={vendor.whatsapp ?? ""}
            required
            className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Penerangan</label>
        <textarea
          name="description"
          defaultValue={vendor.description ?? ""}
          rows={6}
          className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="focus-ring rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
