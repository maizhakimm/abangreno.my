import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizeMalaysianPhone } from "@/lib/utils/phone";

const sendOtpSchema = z.object({
  phone: z.string().min(1),
});

/**
 * Step 1: send phone OTP for an already-logged-in user (Google/email auth
 * does NOT count as phone verification — this is a separate, mandatory step
 * before vendor registration is allowed).
 *
 * The phone number is normalized to a consistent +60XXXXXXXXX form before
 * being sent to Supabase Auth, so the same canonical value is what gets
 * OTP'd, what verify-phone-otp re-normalizes and compares against, and what
 * ultimately gets written to profiles.phone.
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
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedPhone = normalizeMalaysianPhone(parsed.data.phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: "Nombor telefon tidak sah" }, { status: 400 });
  }

  // Supabase sends a verification SMS for phone changes on existing users.
  const { error } = await supabase.auth.updateUser({ phone: normalizedPhone });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, normalizedPhone });
}
