import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeMalaysianPhone } from "@/lib/utils/phone";
import { safeJsonBody } from "@/lib/utils/safeJson";

const MIN_DESCRIPTION_WORDS = 120;
function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

const updateSchema = z.object({
  business_name: z.string().min(3).max(150).optional(),
  phone: z.string().min(9).max(20).optional(),
  whatsapp: z.string().min(9).max(20).optional(),
  description: z.string().refine((value) => countWords(value) >= MIN_DESCRIPTION_WORDS, {
    message: `Penerangan mesti sekurang-kurangnya ${MIN_DESCRIPTION_WORDS} patah perkataan`,
  }).optional(),
  profile_picture_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;
  const parsed = updateSchema.safeParse(parsedBody.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updates: Record<string, string> = { ...parsed.data };
  if (parsed.data.phone !== undefined) {
    const normalized = normalizeMalaysianPhone(parsed.data.phone);
    if (!normalized) return NextResponse.json({ error: "Nombor telefon tidak sah" }, { status: 400 });
    updates.phone = normalized;
  }
  if (parsed.data.whatsapp !== undefined) {
    const normalized = normalizeMalaysianPhone(parsed.data.whatsapp);
    if (!normalized) return NextResponse.json({ error: "Nombor WhatsApp tidak sah" }, { status: 400 });
    updates.whatsapp = normalized;
  }

  const { data: existingVendor } = await supabase.from("vendors").select("id, slug, primary_category_id").eq("user_id", user.id).maybeSingle();
  if (!existingVendor) return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });

  const { data: updated, error } = await supabase.from("vendors").update(updates)
    .eq("id", existingVendor.id).eq("user_id", user.id).select("id").maybeSingle();
  if (error) {
    console.error("Failed to update vendor profile:", error.message);
    return NextResponse.json({ error: "Gagal mengemas kini profil" }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ error: "Tiada perubahan disimpan — profil tidak ditemui" }, { status: 404 });

  revalidatePath(`/vendor/${existingVendor.slug}`);
  revalidatePath("/");
  if (existingVendor.primary_category_id) {
    const { data: category } = await supabase.from("categories").select("slug").eq("id", existingVendor.primary_category_id).single();
    if (category?.slug) revalidatePath(`/kategori/${category.slug}`);
  }
  return NextResponse.json({ success: true });
}
