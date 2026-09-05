import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/validation/schemas";
import { createClient } from "@/lib/supabase/server";

/**
 * Review submission requires login (§18). Runs through the standard
 * server-side Supabase client so RLS enforces auth.uid() = user_id and the
 * UNIQUE(vendor_id, user_id) constraint blocks duplicate reviews at the DB
 * level. avg_rating/total_reviews are refreshed by a DB trigger, not here.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk untuk memberi ulasan" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("slug")
    .eq("id", parsed.data.vendor_id)
    .single();

  const { error } = await supabase.from("reviews").insert({
    vendor_id: parsed.data.vendor_id,
    user_id: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Anda sudah memberi ulasan untuk vendor ini" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menghantar ulasan" }, { status: 500 });
  }

  if (vendor?.slug) {
    revalidatePath(`/vendor/${vendor.slug}`);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
