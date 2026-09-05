import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { vendorProfileSchema } from "@/lib/validation/schemas";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a basic vendor listing (§14).
 *
 * §4 hardening: phone verification is mandatory and is read from the
 * server-trusted `profiles.phone_verified` column (which only
 * /api/profile/verify-phone-otp can ever set to true — see
 * 0004_security_hardening.sql). We never trust a boolean from the request body.
 *
 * §15 hardening: one vendor per user is also enforced at the DB level via
 * `vendors_user_id_unique`; we check first here purely to return a clean
 * error message instead of a raw constraint-violation error.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk untuk mendaftar vendor" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.phone_verified) {
    return NextResponse.json(
      { error: "Sila sahkan nombor telefon anda sebelum mendaftar sebagai vendor" },
      { status: 403 }
    );
  }

  const { data: existingVendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVendor) {
    return NextResponse.json({ error: "Anda sudah mempunyai profil vendor" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = vendorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Validate that referenced category/location ids actually exist and are
  // active, rather than trusting arbitrary UUIDs from the client.
  const admin = createAdminClient();
  const allCategoryIds = [parsed.data.primary_category_id, ...parsed.data.additional_category_ids];
  const { data: validCategories } = await admin
    .from("categories")
    .select("id")
    .in("id", allCategoryIds)
    .eq("is_active", true);

  if (!validCategories || validCategories.length !== new Set(allCategoryIds).size) {
    return NextResponse.json({ error: "Kategori tidak sah" }, { status: 400 });
  }

  const { data: validLocations } = await admin
    .from("locations")
    .select("id")
    .in("id", parsed.data.service_area_ids);

  if (!validLocations || validLocations.length !== new Set(parsed.data.service_area_ids).size) {
    return NextResponse.json({ error: "Lokasi tidak sah" }, { status: 400 });
  }

  const slug = await generateUniqueSlug(parsed.data.business_name, async (candidate) => {
    const { data } = await admin.from("vendors").select("id").eq("slug", candidate).maybeSingle();
    return !!data;
  });

  const { data: vendor, error } = await supabase
    .from("vendors")
    .insert({
      user_id: user.id,
      business_name: parsed.data.business_name,
      slug,
      primary_category_id: parsed.data.primary_category_id,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      description: parsed.data.description,
      verification_status: "unverified",
      is_active: true,
    })
    .select()
    .single();

  if (error || !vendor) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Anda sudah mempunyai profil vendor" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal mencipta profil vendor" }, { status: 500 });
  }

  const categoryRows = [
    { vendor_id: vendor.id, category_id: parsed.data.primary_category_id, is_primary: true },
    ...parsed.data.additional_category_ids.map((id) => ({
      vendor_id: vendor.id,
      category_id: id,
      is_primary: false,
    })),
  ];
  const { error: catError } = await supabase.from("vendor_categories").insert(categoryRows);

  const { error: areaError } = await supabase.from("vendor_service_areas").insert(
    parsed.data.service_area_ids.map((location_id) => ({ vendor_id: vendor.id, location_id }))
  );

  if (catError || areaError) {
    // Roll back the vendor row rather than leaving an incomplete listing —
    // uses admin client since vendor deletion isn't exposed to the owner policy.
    await admin.from("vendors").delete().eq("id", vendor.id);
    return NextResponse.json({ error: "Gagal menyimpan kategori/kawasan servis" }, { status: 500 });
  }

  // profiles.role is protected against direct client writes (see
  // 0004_security_hardening.sql), so this trusted transition — "user just
  // successfully created a vendor listing, promote their role" — must go
  // through the service-role admin client, not the regular RLS-scoped one.
  await admin.from("profiles").update({ role: "vendor" }).eq("id", user.id);

  const { data: primaryCategory } = await admin
    .from("categories")
    .select("slug")
    .eq("id", parsed.data.primary_category_id)
    .single();

  if (primaryCategory?.slug) {
    revalidatePath(`/kategori/${primaryCategory.slug}`);

    const { data: areaSlugs } = await admin
      .from("locations")
      .select("slug")
      .in("id", parsed.data.service_area_ids);

    for (const area of areaSlugs ?? []) {
      revalidatePath(`/kategori/${primaryCategory.slug}/${area.slug}`);
    }
  }
  revalidatePath("/");

  return NextResponse.json({ vendor }, { status: 201 });
}
