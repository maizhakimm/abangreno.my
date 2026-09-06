import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

type LocationRow = {
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

/**
 * Resolve browser coordinates to the nearest location already curated in the
 * AbangReno locations table. We intentionally do not create new locations from
 * arbitrary coordinates, which prevents thin / unmoderated SEO location pages.
 */
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lng: req.nextUrl.searchParams.get("lng"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Koordinat tidak sah" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("name, slug, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) {
    return NextResponse.json({ error: "Gagal mendapatkan lokasi" }, { status: 500 });
  }

  const rows = (data ?? []) as LocationRow[];
  if (!rows.length) {
    return NextResponse.json({ error: "Lokasi belum tersedia" }, { status: 404 });
  }

  const nearest = rows
    .map((location) => ({
      ...location,
      distanceKm: distanceKm(
        parsed.data.lat,
        parsed.data.lng,
        location.latitude as number,
        location.longitude as number
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];

  // Avoid mapping visitors far outside our currently covered areas to a
  // misleading Malaysian city. Manual location search remains available.
  if (!nearest || nearest.distanceKm > 120) {
    return NextResponse.json(
      { error: "Tiada lokasi liputan berdekatan. Sila pilih lokasi secara manual." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: nearest.name,
    slug: nearest.slug,
    distanceKm: Math.round(nearest.distanceKm * 10) / 10,
  });
}
