import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeMalaysianPhone } from "@/lib/utils/phone";

const verifyOtpSchema = z.object({
  phone: z.string().min(1),
  token: z.string().min(4).max(10),
});

/**
 * Step 2: verify the SMS OTP code (§2 hardening).
 *
 * After supabase.auth.verifyOtp() returns success, we do NOT immediately
 * trust that as "this user's phone is now verified" — we explicitly check:
 *   1. data.user exists at all
 *   2. data.user.id === the currently authenticated user's id (prevents a
 *      race/confusion where a verifyOtp call somehow resolves to a
 *      different session than the one making this request)
 *   3. the phone Supabase Auth reports as now-verified on that user
 *      normalizes to the SAME value as what was submitted in this request
 * Only once all three hold do we use the SERVICE ROLE client to write
 * profiles.phone / profiles.phone_verified — this remains the only code
 * path allowed to set phone_verified = true (enforced independently by the
 * DB trigger in 0004_security_hardening.sql).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedSubmittedPhone = normalizeMalaysianPhone(parsed.data.phone);
  if (!normalizedSubmittedPhone) {
    return NextResponse.json({ error: "Nombor telefon tidak sah" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalizedSubmittedPhone,
    token: parsed.data.token,
    type: "phone_change",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Explicit identity + phone-match checks — do not shortcut these.
  if (!data.user) {
    return NextResponse.json({ error: "Pengesahan OTP gagal" }, { status: 400 });
  }
  if (data.user.id !== currentUser.id) {
    return NextResponse.json({ error: "Sesi pengguna tidak sepadan" }, { status: 409 });
  }

  const verifiedPhoneOnAuthUser = data.user.phone ? normalizeMalaysianPhone(data.user.phone) : null;
  if (!verifiedPhoneOnAuthUser || verifiedPhoneOnAuthUser !== normalizedSubmittedPhone) {
    return NextResponse.json(
      { error: "Nombor telefon yang disahkan tidak sepadan dengan permohonan" },
      { status: 409 }
    );
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update({ phone: normalizedSubmittedPhone, phone_verified: true })
    .eq("id", currentUser.id);

  if (updateError) {
    return NextResponse.json({ error: "Gagal mengemas kini status pengesahan" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
