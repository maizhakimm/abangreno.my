import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function getAllActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return data ?? [];
}

export async function getPopularCategories(limit = 8): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(limit);

  return data ?? [];
}
