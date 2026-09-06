"use client";

import { useState } from "react";

interface LocationOption {
  id: string;
  name: string;
  state: string | null;
}

export default function ServiceAreaManager({
  locations,
  initialSelectedIds,
}: {
  locations: LocationOption[];
  initialSelectedIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(initialSelectedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(locationId: string) {
    setError(null);
    setPendingId(locationId);
    const isSelected = selected.has(locationId);

    const res = await fetch("/api/vendor/service-areas", {
      method: isSelected ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: locationId }),
    });

    if (res.ok) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (isSelected) next.delete(locationId);
        else next.add(locationId);
        return next;
      });
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mengemas kini kawasan servis.");
    }
    setPendingId(null);
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {locations.map((loc) => {
          const isSelected = selected.has(loc.id);
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => toggle(loc.id)}
              disabled={pendingId === loc.id}
              className={`focus-ring rounded-lg border px-3 py-2 text-left text-sm transition disabled:opacity-50 ${
                isSelected
                  ? "border-brand bg-brand-light font-semibold text-brand-dark"
                  : "border-black/10 hover:border-brand"
              }`}
            >
              {loc.name}
              {loc.state && <span className="block text-xs text-charcoal/40">{loc.state}</span>}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
