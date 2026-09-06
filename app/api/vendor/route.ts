import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { vendorProfileSchema } from "@/lib/validation/schemas";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { normalizeMalaysianPhone } from "@/lib/utils/phone";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { isEmailVerified } from "@/lib/auth/email";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk untuk mendaftar vendor" }, { status: 401 });
  if (!isEmailVerified(user)) {
    return NextResponse.json({ error: "Sila sahkan emel akaun anda sebelum mendaftar sebagai vendor" }, { status: 403 });
  }

  const { data: existingVendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
  if (existingVendor) return NextResponse.json({ error: "Anda sudah mempunyai profil vendor" }, { status: 409 });

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;
  const parsed = vendorProfileSchema.safeParse(parsedBody.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const normalizedPhone = normalizeMalaysianPhone(parsed.data.phone);
  const normalizedWhatsapp = normalizeMalaysianPhone(parsed.data.whatsapp);
  if (!normalizedPhone) return NextResponse.json({ error: "Nombor telefon tidak sah" }, { status: 400 });
  if (!normalizedWhatsapp) return NextResponse.json({ error: "Nombor WhatsApp tidak sah" }, { status: 400 });

  const admin = createAdminClient();
  const allCategoryIds = [parsed.data.primary_category_id, ...parsed.data.additional_category_ids];
  const { data: validCategories } = await admin.from("categories").select("id").in("id", allCategoryIds).eq("is_active", true);
  if (!validCategories || validCategories.length !== new Set(allCategoryIds).size) {
    return NextResponse.json({ error: "Kategori tidak sah" }, { status: 400 });
  }

  const { data: validLocations } = await admin.from("locations").select("id").in("id", parsed.data.service_area_ids);
  if (!validLocations || validLocations.length !== new Set(parsed.data.service_area_ids).size) {
    return NextResponse.json({ error: "Lokasi tidak sah" }, { status: 400 });
  }

  const slug = await generateUniqueSlug(parsed.data.business_name, async (candidate) => {
    const { data } = await admin.from("vendors").select("id").eq("slug", candidate).maybeSingle();
    return !!data;
  });

  const { data: vendor, error } = await supabase.from("vendors").insert({
    user_id: user.id,
    business_name: parsed.data.business_name,
    slug,
    primary_category_id: parsed.data.primary_category_id,
    phone: normalizedPhone,
    whatsapp: normalizedWhatsapp,
    description: parsed.data.description,
    verification_status: "unverified",
    is_active: true,
  }).select().single();

  if (error || !vendor) {
    if (error?.code === "23505") return NextResponse.json({ error: "Anda sudah mempunyai profil vendor" }, { status: 409 });
    console.error("Failed to create vendor:", error?.message);
    return NextResponse.json({ error: "Gagal mencipta profil vendor" }, { status: 500 });
  }

  const categoryRows = [
    { vendor_id: vendor.id, category_id: parsed.data.primary_category_id, is_primary: true },
    ...parsed.data.additional_category_ids.map((id) => ({ vendor_id: vendor.id, category_id: id, is_primary: false })),
  ];
  const { error: catError } = await supabase.from("vendor_categories").insert(categoryRows);
  const { error: areaError } = await supabase.from("vendor_service_areas").insert(
    parsed.data.service_area_ids.map((location_id) => ({ vendor_id: vendor.id, location_id }))
  );
  if (catError || areaError) {
    await admin.from("vendors").delete().eq("id", vendor.id);
    return NextResponse.json({ error: "Gagal menyimpan kategori/kawasan servis" }, { status: 500 });
  }

  await admin.from("profiles").update({ role: "vendor" }).eq("id", user.id);
  const { data: primaryCategory } = await admin.from("categories").select("slug").eq("id", parsed.data.primary_category_id).single();
  if (primaryCategory?.slug) {
    revalidatePath(`/kategori/${primaryCategory.slug}`);
    const { data: areaSlugs } = await admin.from("locations").select("slug").in("id", parsed.data.service_area_ids);
    for (const area of areaSlugs ?? []) revalidatePath(`/kategori/${primaryCategory.slug}/${area.slug}`);
  }
  revalidatePath("/");
  return NextResponse.json({ vendor }, { status: 201 });
}
