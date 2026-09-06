import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeJsonBody } from "@/lib/utils/safeJson";

const replySchema = z.object({
  review_id: z.string().uuid(),
  vendor_reply: z.string().min(1).max(2000),
});

/**
 * A vendor may reply to a review on their own vendor, and may ONLY ever
 * change the vendor_reply column. Even if this endpoint's UPDATE call
 * included other fields, the DB trigger protect_review_columns() reverts
 * anything except vendor_reply back to its original value for a
 * vendor-owner actor — so this is enforced at two independent layers, not
 * just by this route only sending one field.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });
  }

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;

  const parsed = replySchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: vendor } = await supabase.from("vendors").select("id, slug").eq("user_id", user.id).maybeSingle();
  if (!vendor) {
    return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("id, vendor_id")
    .eq("id", parsed.data.review_id)
    .single();

  if (!review || review.vendor_id !== vendor.id) {
    return NextResponse.json({ error: "Ulasan tidak ditemui untuk vendor ini" }, { status: 404 });
  }

  const { data: updated, error } = await supabase
    .from("reviews")
    .update({ vendor_reply: parsed.data.vendor_reply })
    .eq("id", parsed.data.review_id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Gagal menghantar balasan" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Ulasan tidak ditemui" }, { status: 404 });
  }

  revalidatePath(`/vendor/${vendor.slug}`);
  return NextResponse.json({ success: true });
}
