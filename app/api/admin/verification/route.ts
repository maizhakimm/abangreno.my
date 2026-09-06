import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/auth/admin";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { createAdminClient } from "@/lib/supabase/admin";

const decisionSchema = z.object({
  verification_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  decision: z.enum(["verified_ssm", "rejected"]),
  admin_notes: z.string().max(1000).optional(),
});

/**
 * §3/§9 — the two-write approve/reject flow (update vendor_verifications,
 * then update vendors) has been replaced with a single call to the atomic
 * review_vendor_verification() Postgres function (0007 migration), which
 * verifies the verification record exists, belongs to the supplied vendor,
 * and is currently 'pending' — then performs both updates in one
 * transaction. A verification request for Vendor A can never be used to
 * alter Vendor B's status: the function raises VERIFICATION_VENDOR_MISMATCH
 * if the ids don't correspond, and the whole transaction rolls back.
 *
 * This route independently re-verifies admin authorization (via the shared
 * checkAdminAuth() helper) before calling the RPC; the RPC itself also
 * re-checks is_admin()/service_role as a second, independent layer.
 */
export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Tidak dibenarkan" },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;

  const parsed = decisionSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("review_vendor_verification", {
    p_verification_id: parsed.data.verification_id,
    p_vendor_id: parsed.data.vendor_id,
    p_decision: parsed.data.decision,
    p_admin_id: auth.user.id,
    p_admin_notes: parsed.data.admin_notes ?? null,
  });

  if (error) {
    if (error.message.includes("VERIFICATION_NOT_FOUND")) {
      return NextResponse.json({ error: "Rekod pengesahan tidak ditemui" }, { status: 404 });
    }
    if (error.message.includes("VERIFICATION_VENDOR_MISMATCH")) {
      return NextResponse.json({ error: "Rekod pengesahan tidak sepadan dengan vendor" }, { status: 409 });
    }
    if (error.message.includes("VERIFICATION_NOT_PENDING")) {
      return NextResponse.json({ error: "Permohonan ini sudah diproses" }, { status: 409 });
    }
    if (error.message.includes("NOT_AUTHORIZED")) {
      return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal memproses keputusan" }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.vendor_slug) {
    return NextResponse.json({ error: "Gagal mengesahkan keputusan" }, { status: 500 });
  }

  // §21 — revalidate every SEO surface this decision affects.
  revalidatePath(`/vendor/${result.vendor_slug}`);
  if (result.primary_category_id) {
    const { data: category } = await admin
      .from("categories")
      .select("slug")
      .eq("id", result.primary_category_id)
      .single();
    if (category?.slug) {
      revalidatePath(`/kategori/${category.slug}`);

      const { data: areaLinks } = await admin
        .from("vendor_service_areas")
        .select("locations(slug)")
        .eq("vendor_id", result.vendor_id);
      for (const link of (areaLinks ?? []) as unknown as { locations: { slug: string } | null }[]) {
        if (link.locations?.slug) {
          revalidatePath(`/kategori/${category.slug}/${link.locations.slug}`);
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
