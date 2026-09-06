"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/utils/slug";

/**
 * Homepage search UI. Category + location selections resolve directly to
 * crawlable directory routes. Browser geolocation is optional and is mapped
 * only to curated rows from the locations table via /api/location/nearest.
 */
const CATEGORY_OPTIONS = [
  "Tukang Paip",
  "Waterproofing",
  "Baiki Bumbung",
  "Painting",
  "Aircond",
  "Electrical",
  "Renovation",
  "Kitchen Cabinet",
];

const LOCATION_OPTIONS = [
  "Shah Alam",
  "Klang",
  "Subang Jaya",
  "Petaling Jaya",
  "Puchong",
  "Kuala Lumpur",
];

export default function HeroSearch() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [detectedLocationSlug, setDetectedLocationSlug] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;

    const categorySlug = slugify(category);
    if (location) {
      const locationSlug = detectedLocationSlug || slugify(location);
      router.push(`/kategori/${categorySlug}/${locationSlug}`);
      return;
    }

    router.push(`/kategori/${categorySlug}`);
  }

  function handleManualLocation(value: string) {
    setLocation(value);
    setDetectedLocationSlug("");
    setLocationMessage("");
  }

  function detectLocation() {
    if (!("geolocation" in navigator)) {
      setLocationMessage("Pelayar anda tidak menyokong pengesanan lokasi.");
      return;
    }

    setLocating(true);
    setLocationMessage("Mengesan lokasi anda…");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `/api/location/nearest?lat=${encodeURIComponent(coords.latitude)}&lng=${encodeURIComponent(coords.longitude)}`,
            { cache: "no-store" }
          );
          const payload = (await response.json()) as {
            name?: string;
            slug?: string;
            error?: string;
          };

          if (!response.ok || !payload.name || !payload.slug) {
            throw new Error(payload.error || "Lokasi tidak dapat dikenal pasti");
          }

          setLocation(payload.name);
          setDetectedLocationSlug(payload.slug);
          setLocationMessage(`Lokasi dikesan: ${payload.name}`);
        } catch (error) {
          setDetectedLocationSlug("");
          setLocationMessage(
            error instanceof Error
              ? error.message
              : "Lokasi tidak dapat dikesan. Sila pilih secara manual."
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage("Akses lokasi tidak dibenarkan. Sila pilih lokasi secara manual.");
          return;
        }
        setLocationMessage("Lokasi tidak dapat dikesan. Sila pilih secara manual.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto flex max-w-2xl flex-col gap-3 rounded-card bg-white p-3 shadow-lg sm:flex-row"
    >
      <div className="flex-1">
        <label htmlFor="service" className="sr-only">
          Apa servis yang anda perlukan?
        </label>
        <input
          id="service"
          list="category-options"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Apa servis yang anda perlukan?"
          className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 text-sm"
          required
        />
        <datalist id="category-options">
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex-1">
        <label htmlFor="location" className="sr-only">
          Lokasi
        </label>
        <div className="relative">
          <input
            id="location"
            list="location-options"
            value={location}
            onChange={(e) => handleManualLocation(e.target.value)}
            placeholder="Lokasi"
            className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 pr-12 text-sm"
            aria-describedby="location-status"
          />
          <datalist id="location-options">
            {LOCATION_OPTIONS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            aria-label="Kesan lokasi saya"
            title="Kesan lokasi saya"
            className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand disabled:opacity-50"
          >
            {locating ? "…" : "📍"}
          </button>
        </div>
        <p
          id="location-status"
          aria-live="polite"
          className="mt-1 min-h-4 text-left text-[11px] text-charcoal/60"
        >
          {locationMessage}
        </p>
      </div>

      <button
        type="submit"
        className="focus-ring self-start rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark sm:self-auto"
      >
        Cari Vendor
      </button>
    </form>
  );
}
