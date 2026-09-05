import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/types/database";

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getPopularLocations(limit = 6): Promise<Location[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .in("type", ["city", "district"])
    .order("name")
    .limit(limit);

  return data ?? [];
}

/** Locations related to a given one — same state, excluding itself. Used for internal linking. */
export async function getRelatedLocations(location: Location, limit = 6): Promise<Location[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("state_slug", location.state_slug ?? "")
    .neq("id", location.id)
    .order("name")
    .limit(limit);

  return data ?? [];
}
