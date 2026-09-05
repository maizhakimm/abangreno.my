import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * §19/§21 — updates only the authenticated user's OWN vendor row. The
 * vendor id is never taken from the request body; it's looked up server-side
 * from `auth.uid()`, so a client can never pass an arbitrary vendor_id to
 * edit someone else's listing (RLS would also block this, but we avoid even
 * constructing that possibility). System fields (verification_status,
 * avg_rating, total_reviews, slug, user_id) are additionally protected at
 * the DB level by the trigger in 0004_security_hardening.sql — this schema
 * only accepts the legitimate editable business fields.
 */
const updateSchema = z.object({
  business_name: z.string().min(3).max(150).optional(),
  phone: z.string().regex(/^\+?6?01\d{7,9}$/).optional(),
  whatsapp: z.string().regex(/^\+?6?01\d{7,9}$/).optional(),
  description: z.string().min(1).optional(),
  profile_picture_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existingVendor } = await supabase
    .from("vendors")
    .select("id, slug, primary_category_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingVendor) {
    return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });
  }

  const { data: updated, error } = await supabase
    .from("vendors")
    .update(parsed.data)
    .eq("id", existingVendor.id)
    .eq("user_id", user.id) // belt-and-braces row scoping in addition to RLS
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Gagal mengemas kini profil" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Tiada perubahan disimpan — profil tidak ditemui" }, { status: 404 });
  }

  revalidatePath(`/vendor/${existingVendor.slug}`);
  if (existingVendor.primary_category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", existingVendor.primary_category_id)
      .single();
    if (category?.slug) revalidatePath(`/kategori/${category.slug}`);
  }

  return NextResponse.json({ success: true });
}
