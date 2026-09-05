import { z } from "zod";

/** Minimum description length enforced per §44 (word count, not char count). */
const MIN_DESCRIPTION_WORDS = 120;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const vendorProfileSchema = z.object({
  business_name: z.string().min(3, "Nama perniagaan diperlukan").max(150),
  primary_category_id: z.string().uuid("Sila pilih kategori utama"),
  additional_category_ids: z.array(z.string().uuid()).max(5).optional().default([]),
  phone: z.string().regex(/^\+?6?01\d{7,9}$/, "Nombor telefon tidak sah"),
  whatsapp: z.string().regex(/^\+?6?01\d{7,9}$/, "Nombor WhatsApp tidak sah"),
  description: z
    .string()
    .refine((val) => countWords(val) >= MIN_DESCRIPTION_WORDS, {
      message: `Penerangan mesti sekurang-kurangnya ${MIN_DESCRIPTION_WORDS} patah perkataan`,
    }),
  service_area_ids: z.array(z.string().uuid()).min(1, "Pilih sekurang-kurangnya satu kawasan servis"),
});

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;

export const vendorServiceSchema = z.object({
  vendor_id: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  price_from: z.number().nonnegative().optional(),
  price_unit: z.string().max(50).optional(),
});

export const reviewSchema = z.object({
  vendor_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const forumPostSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(10, "Tajuk terlalu pendek").max(200),
  content: z.string().min(20, "Soalan terlalu pendek").max(5000),
  location_tag: z.string().max(100).optional(),
  guest_name: z.string().max(100).optional(),
  guest_email: z.string().email().optional().or(z.literal("")),
  turnstile_token: z.string().min(1, "Sila lengkapkan pengesahan captcha"),
});

export const forumReplySchema = z.object({
  post_id: z.string().uuid(),
  content: z.string().min(5, "Jawapan terlalu pendek").max(5000),
  guest_name: z.string().max(100).optional(),
  guest_email: z.string().email().optional().or(z.literal("")),
  turnstile_token: z.string().min(1, "Sila lengkapkan pengesahan captcha"),
});

export const reportSchema = z.object({
  target_type: z.enum(["vendor", "review", "forum_post", "forum_reply"]),
  target_id: z.string().uuid(),
  reason: z.string().min(3).max(200),
  details: z.string().max(1000).optional(),
});

export const verificationUploadSchema = z.object({
  vendor_id: z.string().uuid(),
  ssm_document_path: z.string().min(1),
  ic_document_path: z.string().min(1),
});
