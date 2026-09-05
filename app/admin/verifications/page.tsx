import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, getSignedDocumentUrl } from "@/lib/supabase/admin";
import VerificationReviewActions from "@/components/admin/VerificationReviewActions";

interface PendingVerification {
  id: string;
  vendor_id: string;
  submitted_at: string;
  ssm_document_path: string | null;
  ic_document_path: string | null;
  vendor_name: string;
}

/**
 * §11 — SSM/IC documents stay in the PRIVATE `vendor-private-documents`
 * bucket at all times. We generate short-lived signed URLs (5 min expiry,
 * see lib/supabase/admin.ts) server-side, per admin page load, and never
 * store or expose a permanent public URL anywhere.
 *
 * §20 — this page independently re-checks admin authorization (not relying
 * solely on app/admin/layout.tsx), since it's the entry point for a
 * genuinely sensitive read (private identity documents).
 */
export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("vendor_verifications")
    .select("id, vendor_id, submitted_at, ssm_document_path, ic_document_path, vendors(business_name)")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  type Row = {
    id: string;
    vendor_id: string;
    submitted_at: string;
    ssm_document_path: string | null;
    ic_document_path: string | null;
    vendors: { business_name: string } | null;
  };

  const items: PendingVerification[] = await Promise.all(
    ((pending ?? []) as unknown as Row[]).map(async (item) => ({
      id: item.id,
      vendor_id: item.vendor_id,
      submitted_at: item.submitted_at,
      ssm_document_path: item.ssm_document_path,
      ic_document_path: item.ic_document_path,
      vendor_name: item.vendors?.business_name ?? "Unknown vendor",
    }))
  );

  const signedUrls = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      ssmUrl: item.ssm_document_path ? await getSignedDocumentUrl(item.ssm_document_path, 300) : null,
      icUrl: item.ic_document_path ? await getSignedDocumentUrl(item.ic_document_path, 300) : null,
    }))
  );
  const signedUrlById = new Map(signedUrls.map((s) => [s.id, s]));

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Verification Queue</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Documents are stored privately. Links below expire in 5 minutes — reload the page if a
        link has gone stale.
      </p>
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="text-sm text-charcoal/60">No pending verifications.</p>}
        {items.map((item) => {
          const urls = signedUrlById.get(item.id);
          return (
            <div key={item.id} className="rounded-lg border border-black/5 p-4">
              <p className="font-semibold">{item.vendor_name}</p>
              <p className="text-xs text-charcoal/50">
                Submitted {new Date(item.submitted_at).toLocaleDateString("ms-MY")}
              </p>
              <div className="mt-2 flex gap-3 text-xs font-semibold">
                {urls?.ssmUrl ? (
                  <a href={urls.ssmUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    View SSM
                  </a>
                ) : (
                  <span className="text-charcoal/30">No SSM document</span>
                )}
                {urls?.icUrl ? (
                  <a href={urls.icUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    View IC
                  </a>
                ) : (
                  <span className="text-charcoal/30">No IC document</span>
                )}
              </div>
              <VerificationReviewActions verificationId={item.id} vendorId={item.vendor_id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
