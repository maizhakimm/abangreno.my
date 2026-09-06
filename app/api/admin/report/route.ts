import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/auth/admin";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { adminReportActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportTargetType } from "@/types/database";

/**
 * Which target_status values are legitimate for each report target_type.
 * "deactivate"/"reactivate" map to vendors.is_active (the smallest safe
 * mechanism already available — see 0007's is_active protection — rather
 * than inventing a new vendor moderation-status column). Everything else
 * maps directly onto that target's existing status column.
 */
const ALLOWED_TARGET_STATUS: Record<ReportTargetType, string[]> = {
  forum_post: ["visible", "removed"],
  forum_reply: ["visible", "removed"],
  review: ["visible", "flagged", "removed"],
  vendor: ["deactivate", "reactivate"],
};

/**
 * Reports NEVER automatically remove content based purely on report count —
 * this endpoint is the only path that can change a reported target's
 * status, and it always requires an authenticated admin to explicitly
 * choose the outcome for THIS specific report. A competitor mass-reporting
 * a vendor has no automatic effect: every report still just sits as
 * 'pending' until an admin reviews it here.
 *
 * decision = "mark_reviewed": only updates the report row itself (status ->
 * 'reviewed'), no target content is touched. Useful for reports an admin
 * looked at and decided required no action (e.g. a false report).
 *
 * decision = "take_action": applies an admin-chosen status change to the
 * reported target (validated against ALLOWED_TARGET_STATUS for that
 * target_type) AND marks the report 'actioned', in that order — if the
 * target update fails, the report is not marked actioned.
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

  const parsed = adminReportActionSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { report_id, decision, target_status } = parsed.data;

  const admin = createAdminClient();

  const { data: report } = await admin
    .from("reports")
    .select("id, target_type, target_id, status")
    .eq("id", report_id)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({ error: "Laporan tidak ditemui" }, { status: 404 });
  }

  if (decision === "mark_reviewed") {
    const { data: updated, error } = await admin
      .from("reports")
      .update({ status: "reviewed", reviewed_at: new Date().toISOString(), reviewed_by: auth.user.id })
      .eq("id", report_id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Failed to mark report reviewed:", error.message);
      return NextResponse.json({ error: "Gagal mengemas kini laporan" }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: "Laporan tidak ditemui" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: "reviewed" });
  }

  // decision === "take_action" from here on.
  const targetType = report.target_type as ReportTargetType;
  const allowed = ALLOWED_TARGET_STATUS[targetType];
  if (!target_status || !allowed.includes(target_status)) {
    return NextResponse.json(
      { error: `Status tindakan tidak sah untuk jenis kandungan ini` },
      { status: 400 }
    );
  }

  let revalidationInfo: { revalidate: () => Promise<void> } | null = null;

  if (targetType === "forum_post" || targetType === "forum_reply") {
    const table = targetType === "forum_post" ? "forum_posts" : "forum_replies";
    const { data: updatedTarget, error: targetError } = await admin
      .from(table)
      .update({ status: target_status })
      .eq("id", report.target_id)
      .select("id")
      .maybeSingle();

    if (targetError) {
      console.error(`Failed to update ${table} status:`, targetError.message);
      return NextResponse.json({ error: "Gagal mengemas kini kandungan yang dilaporkan" }, { status: 500 });
    }
    if (!updatedTarget) {
      return NextResponse.json({ error: "Kandungan yang dilaporkan tidak ditemui" }, { status: 404 });
    }

    const postId =
      targetType === "forum_post"
        ? report.target_id
        : (await admin.from("forum_replies").select("post_id").eq("id", report.target_id).single()).data
            ?.post_id;

    revalidationInfo = {
      revalidate: async () => {
        if (!postId) return;
        const { data: post } = await admin
          .from("forum_posts")
          .select("slug, categories(slug)")
          .eq("id", postId)
          .single();
        const categorySlug = (post as unknown as { categories: { slug: string } | null } | null)?.categories
          ?.slug;
        if (categorySlug && post?.slug) {
          revalidatePath(`/forum/${categorySlug}`);
          revalidatePath(`/forum/${categorySlug}/${post.slug}`);
        }
      },
    };
  } else if (targetType === "review") {
    const { data: updatedTarget, error: targetError } = await admin
      .from("reviews")
      .update({ status: target_status })
      .eq("id", report.target_id)
      .select("id, vendor_id")
      .maybeSingle();

    if (targetError) {
      console.error("Failed to update review status:", targetError.message);
      return NextResponse.json({ error: "Gagal mengemas kini ulasan yang dilaporkan" }, { status: 500 });
    }
    if (!updatedTarget) {
      return NextResponse.json({ error: "Ulasan yang dilaporkan tidak ditemui" }, { status: 404 });
    }

    revalidationInfo = {
      revalidate: async () => {
        const { data: vendor } = await admin
          .from("vendors")
          .select("slug")
          .eq("id", updatedTarget.vendor_id)
          .single();
        if (vendor?.slug) revalidatePath(`/vendor/${vendor.slug}`);
      },
    };
  } else if (targetType === "vendor") {
    const isActive = target_status === "reactivate";
    const { data: updatedTarget, error: targetError } = await admin
      .from("vendors")
      .update({ is_active: isActive })
      .eq("id", report.target_id)
      .select("id, slug, primary_category_id")
      .maybeSingle();

    if (targetError) {
      console.error("Failed to update vendor active status:", targetError.message);
      return NextResponse.json({ error: "Gagal mengemas kini status vendor" }, { status: 500 });
    }
    if (!updatedTarget) {
      return NextResponse.json({ error: "Vendor yang dilaporkan tidak ditemui" }, { status: 404 });
    }

    revalidationInfo = {
      revalidate: async () => {
        revalidatePath(`/vendor/${updatedTarget.slug}`);
        if (updatedTarget.primary_category_id) {
          const { data: category } = await admin
            .from("categories")
            .select("slug")
            .eq("id", updatedTarget.primary_category_id)
            .single();
          if (category?.slug) {
            revalidatePath(`/kategori/${category.slug}`);
            const { data: areaLinks } = await admin
              .from("vendor_service_areas")
              .select("locations(slug)")
              .eq("vendor_id", updatedTarget.id);
            for (const link of (areaLinks ?? []) as unknown as { locations: { slug: string } | null }[]) {
              if (link.locations?.slug) {
                revalidatePath(`/kategori/${category.slug}/${link.locations.slug}`);
              }
            }
          }
        }
      },
    };
  }

  const { data: reportUpdated, error: reportError } = await admin
    .from("reports")
    .update({ status: "actioned", reviewed_at: new Date().toISOString(), reviewed_by: auth.user.id })
    .eq("id", report_id)
    .select("id")
    .maybeSingle();

  if (reportError) {
    console.error("Failed to mark report actioned:", reportError.message);
    return NextResponse.json({ error: "Gagal mengemas kini laporan" }, { status: 500 });
  }
  if (!reportUpdated) {
    return NextResponse.json({ error: "Laporan tidak ditemui" }, { status: 404 });
  }

  if (revalidationInfo) {
    await revalidationInfo.revalidate();
  }

  return NextResponse.json({ success: true, status: "actioned" });
}
