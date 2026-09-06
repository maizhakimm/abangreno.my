import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/validation/schemas";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { createClient } from "@/lib/supabase/server";

/**
 * Review submission requires login. Runs through the standard server-side
 * Supabase client so RLS enforces auth.uid() = user_id, and the
 * UNIQUE(vendor_id, user_id) DB constraint blocks duplicate reviews.
 * avg_rating/total_reviews are refreshed by a DB trigger, not here.
 *
 * Hardening in this pass:
 *   - the target vendor must exist AND be active before a review is
 *     accepted (a review against an inactive/removed listing is rejected
 *     with 404 rather than silently succeeding or failing with a raw FK
 *     constraint error)
 *   - a vendor owner may not review their own listing (checked here for a
 *     clean 403; also enforced at the DB level as defense in depth by the
 *     trg_prevent_vendor_self_review trigger added in 0011)
 *   - malformed JSON bodies return a clean 400 instead of crashing
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk untuk memberi ulasan" }, { status: 401 });
  }

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;

  const parsed = reviewSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, slug, user_id, is_active")
    .eq("id", parsed.data.vendor_id)
    .maybeSingle();

  if (!vendor || !vendor.is_active) {
    return NextResponse.json({ error: "Vendor tidak ditemui" }, { status: 404 });
  }

  if (vendor.user_id === user.id) {
    return NextResponse.json(
      { error: "Anda tidak boleh memberi ulasan untuk perniagaan anda sendiri" },
      { status: 403 }
    );
  }

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
    // The DB-level self-review trigger (0011) is defense in depth behind the
    // app-level check above — if it's ever the one that fires instead
    // (e.g. a future code path that skips the app check), surface the same
    // clean 403 rather than a raw Postgres error.
    if (error.message?.includes("VENDOR_SELF_REVIEW_NOT_ALLOWED")) {
      return NextResponse.json(
        { error: "Anda tidak boleh memberi ulasan untuk perniagaan anda sendiri" },
        { status: 403 }
      );
    }
    console.error("Failed to create review:", error.message);
    return NextResponse.json({ error: "Gagal menghantar ulasan" }, { status: 500 });
  }

  revalidatePath(`/vendor/${vendor.slug}`);
  return NextResponse.json({ success: true }, { status: 201 });
}
