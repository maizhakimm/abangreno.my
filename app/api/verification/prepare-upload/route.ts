import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];

const prepareSchema = z.object({
  ssm_extension: z.string().toLowerCase(),
  ic_extension: z.string().toLowerCase(),
});

/**
 * §7 — issues the exact storage paths the client must upload to. Filenames
 * are entirely server-generated (random token + fixed "ssm"/"ic" prefix);
 * only the file extension comes from the client, and it's checked against
 * an allow-list here. This means the original filename the user picked is
 * never used as-is for a storage path.
 *
 * The random per-submission token also gives each verification attempt its
 * own folder, so a rejected-then-resubmitted vendor's new documents never
 * collide with or overwrite a previous (possibly still-referenced-in-audit)
 * submission's files.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });

  if (!["unverified", "rejected"].includes(vendor.verification_status)) {
    return NextResponse.json(
      { error: "Vendor ini tidak boleh menghantar permohonan pengesahan baharu buat masa ini" },
      { status: 409 }
    );
  }

  const body = await req.json();
  const parsed = prepareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (
    !ALLOWED_EXTENSIONS.includes(parsed.data.ssm_extension) ||
    !ALLOWED_EXTENSIONS.includes(parsed.data.ic_extension)
  ) {
    return NextResponse.json(
      { error: "Jenis fail tidak dibenarkan. Hanya PDF, PNG, atau JPG." },
      { status: 400 }
    );
  }

  const token = crypto.randomUUID();
  const ssmSuffix = crypto.randomUUID();
  const icSuffix = crypto.randomUUID();

  const ssmPath = `${vendor.id}/${token}/ssm-${ssmSuffix}.${parsed.data.ssm_extension}`;
  const icPath = `${vendor.id}/${token}/ic-${icSuffix}.${parsed.data.ic_extension}`;

  return NextResponse.json({ ssmPath, icPath });
}
