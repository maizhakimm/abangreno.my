"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  name: string;
}

const MIN_WORDS = 120;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function VendorRegistrationForm({
  verifiedPhone,
  categories,
  locations,
}: {
  verifiedPhone: string;
  categories: Option[];
  locations: Option[];
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wordCount = countWords(description);
  const wordsRemaining = Math.max(0, MIN_WORDS - wordCount);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: formData.get("business_name"),
        primary_category_id: formData.get("primary_category_id"),
        additional_category_ids: [],
        phone: verifiedPhone,
        whatsapp: formData.get("whatsapp"),
        description,
        service_area_ids: formData.getAll("service_area_ids"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(typeof data.error === "string" ? data.error : "Gagal menghantar. Sila cuba lagi.");
      setStatus("error");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nama Perniagaan</label>
        <input
          name="business_name"
          required
          minLength={3}
          className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Kategori Utama</label>
        <select
          name="primary_category_id"
          required
          className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Telefon Disahkan</label>
          <div className="mt-1 rounded-lg border border-green-700/20 bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
            {verifiedPhone} ✓
          </div>
          <p className="mt-1 text-xs text-charcoal/50">Nombor ini telah disahkan melalui OTP dan tidak boleh diubah di sini.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">WhatsApp</label>
          <input
            name="whatsapp"
            required
            type="tel"
            defaultValue={verifiedPhone}
            placeholder="+60123456789"
            className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium">Kawasan Servis</legend>
        <div className="mt-1 flex flex-wrap gap-3">
          {locations.map((loc) => (
            <label key={loc.id} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="service_area_ids" value={loc.id} />
              {loc.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium">Penerangan Perniagaan</label>
        <p className="text-xs text-charcoal/50">
          Terangkan pengalaman anda, jenis servis, kawasan liputan dan kelebihan perkhidmatan anda.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
          className="focus-ring mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <p className={`mt-1 text-xs ${wordsRemaining > 0 ? "text-red-600" : "text-green-700"}`}>
          {wordCount} perkataan
          {wordsRemaining > 0 && ` — perlukan sekurang-kurangnya ${wordsRemaining} lagi`}
        </p>
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || wordsRemaining > 0}
        className="focus-ring w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menghantar..." : "Cipta Profil Vendor"}
      </button>
    </form>
  );
}
