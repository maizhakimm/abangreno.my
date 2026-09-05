-- ============================================================================
-- AbangReno.my — Storage Buckets
-- ============================================================================

-- Public bucket: vendor profile pictures and gallery/before-after images.
insert into storage.buckets (id, name, public)
values ('vendor-public-media', 'vendor-public-media', true)
on conflict (id) do nothing;

-- Private bucket: SSM certificates and IC documents. NEVER public.
insert into storage.buckets (id, name, public)
values ('vendor-private-documents', 'vendor-private-documents', false)
on conflict (id) do nothing;

-- Public media: anyone can view; only the owning vendor can upload/manage,
-- inferred from the object path convention: {vendor_id}/{filename}
create policy "Public can view vendor public media"
  on storage.objects for select
  using (bucket_id = 'vendor-public-media');

create policy "Vendor owner can upload own public media"
  on storage.objects for insert
  with check (
    bucket_id = 'vendor-public-media'
    and exists (
      select 1 from vendors v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Vendor owner can delete own public media"
  on storage.objects for delete
  using (
    bucket_id = 'vendor-public-media'
    and exists (
      select 1 from vendors v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

-- Private documents: NO public select policy. Vendor owner can upload their
-- own; only admins (and the admin service-role client) can read them, and
-- reads in the app happen exclusively via short-lived signed URLs
-- (see lib/supabase/admin.ts -> getSignedDocumentUrl).
create policy "Vendor owner can upload own private documents"
  on storage.objects for insert
  with check (
    bucket_id = 'vendor-private-documents'
    and exists (
      select 1 from vendors v
      where v.id::text = (storage.foldername(name))[1]
      and v.user_id = auth.uid()
    )
  );

create policy "Admins can read private documents"
  on storage.objects for select
  using (bucket_id = 'vendor-private-documents' and public.is_admin());
