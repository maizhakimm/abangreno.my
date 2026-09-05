import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  ssm_document_path: z.string().min(1).max(500),
  ic_document_path: z.string().min(1).max(500),
});

const BUCKET = "vendor-private-documents";

/**
 * Checks that an object actually exists at `path` inside the bucket, by
 * listing the containing folder and looking for the exact filename. §6 —
 * path-prefix and extension checks alone are not sufficient; we must
 * confirm the object was actually uploaded before creating a DB record that
 * references it.
 */
async function objectExists(path: string): Promise<boolean> {
  const admin = createAdminClient();
  const lastSlash = path.lastIndexOf("/");
  const folder = path.slice(0, lastSlash);
  const filename = path.slice(lastSlash + 1);

  const { data, error } = await admin.storage.from(BUCKET).list(folder, {
    search: filename,
  });

  if (error) return false;
  return (data ?? []).some((entry) => entry.name === filename);
}

/**
 * Finalizes a verification submission.
 *
 * Ordering matters here and mirrors the required flow exactly:
 *   1. Authenticate the real browser user with the normal (RLS-scoped)
 *      Supabase server client — never the admin client — for this step.
 *   2. Resolve that user's OWN vendor row server-side. vendor_id is never
 *      taken from the request body.
 *   3. Validate both submitted paths are prefixed with that vendor's own id.
 *   4. Confirm both Storage objects actually exist.
 *   5. Only once all four checks pass, call submit_vendor_verification()
 *      via the ADMIN (service-role) client, passing the trusted user.id we
 *      already authenticated in step 1 — never a client-supplied id. As of
 *      migration 0009, this RPC has EXECUTE revoked from `authenticated`
 *      and granted only to `service_role`, so it is unreachable by a vendor
 *      calling the Supabase client directly, however they authenticate;
 *      this route is now the only possible caller.
 *
 * Unsafe orphan cleanup has been intentionally removed: this route no
 * longer deletes anything from Storage based on client-supplied paths. A
 * malicious vendor could otherwise submit paths to their own OLDER,
 * already-approved documents, deliberately trigger an RPC failure (e.g. by
 * hitting the one-pending-request-at-a-time guard), and have the
 * service-role client delete legitimate historical audit documents. Leaving
 * a rare orphan file on a genuine failure is the safer trade-off for this
 * MVP; a dedicated cleanup job — driven by a server-side record of which
 * paths were freshly issued for which submission, not client input — is a
 * reasonable follow-up but is out of scope here.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) {
    return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });
  }

  const expectedPrefix = `${vendor.id}/`;
  if (
    !parsed.data.ssm_document_path.startsWith(expectedPrefix) ||
    !parsed.data.ic_document_path.startsWith(expectedPrefix)
  ) {
    return NextResponse.json({ error: "Laluan dokumen tidak sah untuk vendor ini" }, { status: 400 });
  }

  const [ssmExists, icExists] = await Promise.all([
    objectExists(parsed.data.ssm_document_path),
    objectExists(parsed.data.ic_document_path),
  ]);

  if (!ssmExists || !icExists) {
    return NextResponse.json(
      { error: "Satu atau kedua-dua fail tidak ditemui dalam storan. Sila muat naik semula." },
      { status: 400 }
    );
  }

  // Only reachable path to submit_vendor_verification as of 0009 — the
  // admin client carries the service-role JWT, and we pass the trusted
  // user.id resolved in step 1 above, never anything from the request body.
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("submit_vendor_verification", {
    p_user_id: user.id,
    p_ssm_document_path: parsed.data.ssm_document_path,
    p_ic_document_path: parsed.data.ic_document_path,
  });

  if (error) {
    if (error.message.includes("VENDOR_NOT_FOUND")) {
      return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });
    }
    if (error.message.includes("VERIFICATION_NOT_ALLOWED_IN_CURRENT_STATE")) {
      return NextResponse.json(
        { error: "Vendor ini tidak boleh menghantar permohonan pengesahan baharu buat masa ini" },
        { status: 409 }
      );
    }
    if (error.message.includes("PENDING_VERIFICATION_ALREADY_EXISTS")) {
      return NextResponse.json(
        { error: "Anda sudah mempunyai permohonan pengesahan yang sedang diproses" },
        { status: 409 }
      );
    }
    if (error.message.includes("DOCUMENT_PATH_OWNERSHIP_MISMATCH")) {
      return NextResponse.json({ error: "Laluan dokumen tidak sah" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menghantar dokumen" }, { status: 500 });
  }

  return NextResponse.json({ success: true, result: data }, { status: 201 });
}
