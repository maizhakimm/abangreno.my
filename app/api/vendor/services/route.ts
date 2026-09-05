import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const createServiceSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  price_from: z.number().nonnegative().optional(),
  price_unit: z.string().max(50).optional(),
});

/**
 * §19 — the vendor_id is derived server-side from auth.uid(), never trusted
 * from the client, so a vendor can only ever add services to their own
 * listing (also enforced by RLS on vendor_services).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });

  const body = await req.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase.from("vendor_services").insert({
    vendor_id: vendor.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    price_from: parsed.data.price_from ?? null,
    price_unit: parsed.data.price_unit ?? null,
  });

  if (error) return NextResponse.json({ error: "Gagal menambah servis" }, { status: 500 });

  revalidatePath(`/vendor/${vendor.slug}`);
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });

  const { serviceId } = await req.json();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vendor) return NextResponse.json({ error: "Profil vendor tidak ditemui" }, { status: 404 });

  // Scope the delete to this vendor's own services only.
  const { data: deleted, error } = await supabase
    .from("vendor_services")
    .delete()
    .eq("id", serviceId)
    .eq("vendor_id", vendor.id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Gagal memadam servis" }, { status: 500 });
  if (!deleted) return NextResponse.json({ error: "Servis tidak ditemui" }, { status: 404 });

  revalidatePath(`/vendor/${vendor.slug}`);
  return NextResponse.json({ success: true });
}
