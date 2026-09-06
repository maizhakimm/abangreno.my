import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import ReportActions from "@/components/admin/ReportActions";
import type { Report } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface TargetPreview {
  label: string;
  href: string | null;
}

/**
 * Best-effort preview/link for each report's target, batched by type so we
 * don't run one query per report row. Falls back to a plain label with no
 * link if the target itself is missing (e.g. deleted after the report was
 * filed) — never throws, since this is a display nicety, not a security
 * boundary.
 */
async function resolveTargetPreviews(
  supabase: SupabaseServerClient,
  reports: Report[]
): Promise<Map<string, TargetPreview>> {
  const previews = new Map<string, TargetPreview>();

  const vendorReports = reports.filter((r) => r.target_type === "vendor");
  const reviewReports = reports.filter((r) => r.target_type === "review");
  const forumPostReports = reports.filter((r) => r.target_type === "forum_post");
  const forumReplyReports = reports.filter((r) => r.target_type === "forum_reply");

  if (vendorReports.length > 0) {
    const { data } = await supabase
      .from("vendors")
      .select("id, business_name, slug")
      .in(
        "id",
        vendorReports.map((r) => r.target_id)
      );
    const byId = new Map((data ?? []).map((v) => [v.id, v]));
    for (const r of vendorReports) {
      const v = byId.get(r.target_id);
      previews.set(r.id, v ? { label: v.business_name, href: `/vendor/${v.slug}` } : { label: "(vendor deleted)", href: null });
    }
  }

  if (reviewReports.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("id, comment, vendors(slug, business_name)")
      .in(
        "id",
        reviewReports.map((r) => r.target_id)
      );
    type Row = { id: string; comment: string | null; vendors: { slug: string; business_name: string } | null };
    const byId = new Map(((data ?? []) as unknown as Row[]).map((v) => [v.id, v]));
    for (const r of reviewReports) {
      const v = byId.get(r.target_id);
      previews.set(
        r.id,
        v
          ? {
              label: `Review on ${v.vendors?.business_name ?? "vendor"}: "${(v.comment ?? "").slice(0, 60)}"`,
              href: v.vendors?.slug ? `/vendor/${v.vendors.slug}` : null,
            }
          : { label: "(review deleted)", href: null }
      );
    }
  }

  if (forumPostReports.length > 0) {
    const { data } = await supabase
      .from("forum_posts")
      .select("id, title, slug, categories(slug)")
      .in(
        "id",
        forumPostReports.map((r) => r.target_id)
      );
    type Row = { id: string; title: string; slug: string; categories: { slug: string } | null };
    const byId = new Map(((data ?? []) as unknown as Row[]).map((v) => [v.id, v]));
    for (const r of forumPostReports) {
      const v = byId.get(r.target_id);
      previews.set(
        r.id,
        v
          ? { label: v.title, href: v.categories?.slug ? `/forum/${v.categories.slug}/${v.slug}` : null }
          : { label: "(thread deleted)", href: null }
      );
    }
  }

  if (forumReplyReports.length > 0) {
    const { data } = await supabase
      .from("forum_replies")
      .select("id, content, forum_posts(slug, categories(slug))")
      .in(
        "id",
        forumReplyReports.map((r) => r.target_id)
      );
    type Row = { id: string; content: string; forum_posts: { slug: string; categories: { slug: string } | null } | null };
    const byId = new Map(((data ?? []) as unknown as Row[]).map((v) => [v.id, v]));
    for (const r of forumReplyReports) {
      const v = byId.get(r.target_id);
      const post = v?.forum_posts;
      previews.set(
        r.id,
        v
          ? {
              label: `Reply: "${v.content.slice(0, 60)}"`,
              href: post?.categories?.slug && post?.slug ? `/forum/${post.categories.slug}/${post.slug}` : null,
            }
          : { label: "(reply deleted)", href: null }
      );
    }
  }

  return previews;
}

interface PageProps {
  searchParams: Promise<{ status?: string; target_type?: string }>;
}

const STATUS_OPTIONS = ["pending", "reviewed", "actioned"] as const;
const TARGET_TYPE_OPTIONS = ["vendor", "review", "forum_post", "forum_reply"] as const;

function buildFilterUrl(current: { status?: string; target_type?: string }, updates: Partial<typeof current>) {
  const merged = { ...current, ...updates };
  const params = new URLSearchParams();
  if (merged.status) params.set("status", merged.status);
  if (merged.target_type) params.set("target_type", merged.target_type);
  const qs = params.toString();
  return `/admin/reports${qs ? `?${qs}` : ""}`;
}

/**
 * Every admin page independently verifies admin role server-side — never
 * relying solely on app/admin/layout.tsx. Uses the shared checkAdminAuth()
 * helper so this check is identical everywhere it's applied.
 */
export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const auth = await checkAdminAuth();

  if (!auth.ok) {
    redirect(auth.reason === "unauthenticated" ? "/login" : "/");
  }

  let query = auth.supabase.from("reports").select("*").order("created_at", { ascending: false });

  if (params.status && (STATUS_OPTIONS as readonly string[]).includes(params.status)) {
    query = query.eq("status", params.status);
  }
  if (params.target_type && (TARGET_TYPE_OPTIONS as readonly string[]).includes(params.target_type)) {
    query = query.eq("target_type", params.target_type);
  }

  const { data: reports } = await query;
  const reportList = (reports ?? []) as Report[];

  const previews = await resolveTargetPreviews(auth.supabase, reportList);

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Reports never automatically remove content — every action below requires an explicit
        admin decision.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div>
          <span className="mr-2 font-semibold text-charcoal/50">Status:</span>
          <a
            href={buildFilterUrl(params, { status: undefined })}
            className={`mr-2 rounded-full px-2 py-1 ${!params.status ? "bg-charcoal text-white" : "bg-offwhite"}`}
          >
            All
          </a>
          {STATUS_OPTIONS.map((s) => (
            <a
              key={s}
              href={buildFilterUrl(params, { status: s })}
              className={`mr-2 rounded-full px-2 py-1 capitalize ${
                params.status === s ? "bg-charcoal text-white" : "bg-offwhite"
              }`}
            >
              {s}
            </a>
          ))}
        </div>
        <div>
          <span className="mr-2 font-semibold text-charcoal/50">Target:</span>
          <a
            href={buildFilterUrl(params, { target_type: undefined })}
            className={`mr-2 rounded-full px-2 py-1 ${
              !params.target_type ? "bg-charcoal text-white" : "bg-offwhite"
            }`}
          >
            All
          </a>
          {TARGET_TYPE_OPTIONS.map((t) => (
            <a
              key={t}
              href={buildFilterUrl(params, { target_type: t })}
              className={`mr-2 rounded-full px-2 py-1 capitalize ${
                params.target_type === t ? "bg-charcoal text-white" : "bg-offwhite"
              }`}
            >
              {t.replace("_", " ")}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {reportList.length === 0 && <p className="text-sm text-charcoal/60">No reports match this filter.</p>}
        {reportList.map((r) => (
          <div key={r.id} className="rounded-lg border border-black/5 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold capitalize">
                {r.target_type.replace("_", " ")} — {r.reason}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                  r.status === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : r.status === "reviewed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {r.status}
              </span>
            </div>
            {r.details && <p className="mt-1 text-charcoal/60">{r.details}</p>}
            <p className="mt-1 text-xs text-charcoal/40">
              Target ID: {r.target_id} · {new Date(r.created_at).toLocaleString("ms-MY")}
            </p>
            {previews.get(r.id) && (
              <p className="mt-1 text-xs">
                {previews.get(r.id)!.href ? (
                  <a href={previews.get(r.id)!.href ?? undefined} className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                    {previews.get(r.id)!.label}
                  </a>
                ) : (
                  <span className="text-charcoal/50">{previews.get(r.id)!.label}</span>
                )}
              </p>
            )}

            {r.status === "pending" && <ReportActions reportId={r.id} targetType={r.target_type} />}
          </div>
        ))}
      </div>
    </div>
  );
}
