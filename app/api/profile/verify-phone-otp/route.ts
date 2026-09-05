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
 * Step 2: verify the SMS OTP code.
 * The verified phone stored in profiles is the authoritative vendor contact
 * phone. Clients must not be able to replace it with an unverified number.
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
  const { data: updatedProfile, error: updateError } = await admin
    .from("profiles")
    .update({ phone: normalizedSubmittedPhone, phone_verified: true })
    .eq("id", currentUser.id)
    .select("phone")
    .maybeSingle();

  if (updateError || !updatedProfile?.phone) {
    return NextResponse.json({ error: "Gagal mengemas kini status pengesahan" }, { status: 500 });
  }

  return NextResponse.json({ success: true, phone: updatedProfile.phone });
}
