"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/utils/slug";

/**
 * Homepage search UI (§26, §49). Resolves category + location selections
 * directly to /kategori/[slug]/[lokasi-slug] rather than a generic query page.
 * Geolocation (§27) is optional and never blocks manual selection.
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
  const [locating, setLocating] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    const categorySlug = slugify(category);
    if (location) {
      router.push(`/kategori/${categorySlug}/${slugify(location)}`);
    } else {
      router.push(`/kategori/${categorySlug}`);
    }
  }

  function detectLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        // In production: reverse-geocode lat/lng to nearest `locations` row.
        // Falls back gracefully to manual selection if this fails or is denied.
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 5000 }
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
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi"
            className="focus-ring w-full rounded-lg border border-black/10 px-4 py-3 text-sm"
          />
          <datalist id="location-options">
            {LOCATION_OPTIONS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={detectLocation}
            aria-label="Kesan lokasi saya"
            className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand"
          >
            {locating ? "..." : "📍"}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="focus-ring rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Cari Vendor
      </button>
    </form>
  );
}
