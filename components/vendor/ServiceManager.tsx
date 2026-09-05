"use client";

import { useState } from "react";
import type { VendorService } from "@/types/database";

export default function ServiceManager({ initialServices }: { initialServices: VendorService[] }) {
  const [services, setServices] = useState(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const priceFrom = formData.get("price_from");

    const res = await fetch("/api/vendor/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        price_from: priceFrom ? Number(priceFrom) : undefined,
        price_unit: formData.get("price_unit") || undefined,
      }),
    });

    if (res.ok) {
      // Optimistic-ish refresh: re-fetch isn't wired here since this is a
      // simple MVP list; a full page reload via router.refresh() in a real
      // deployment would sync the list from the server truth.
      window.location.reload();
    }
    setStatus("idle");
  }

  async function handleDelete(serviceId: string) {
    const res = await fetch("/api/vendor/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    }
  }

  return (
    <div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-charcoal/60">{services.length} servis disenaraikan</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {showForm ? "Batal" : "+ Tambah Servis"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-lg border border-black/10 p-4">
          <input
            name="title"
            required
            minLength={3}
            placeholder="Nama servis (cth: Baiki Paip Bocor)"
            className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Penerangan (pilihan)"
            className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="price_from"
              type="number"
              min={0}
              placeholder="Harga bermula (RM)"
              className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            <input
              name="price_unit"
              placeholder="Unit (cth: per lawatan)"
              className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {status === "submitting" ? "Menyimpan..." : "Simpan Servis"}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {services.length === 0 && (
          <p className="text-sm text-charcoal/60">Belum ada servis ditambah.</p>
        )}
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-black/5 p-3">
            <div>
              <p className="text-sm font-semibold">{s.title}</p>
              {s.price_from != null && (
                <p className="text-xs text-charcoal/50">
                  Bermula RM{s.price_from} {s.price_unit}
                </p>
              )}
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-xs font-semibold text-red-600">
              Padam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
