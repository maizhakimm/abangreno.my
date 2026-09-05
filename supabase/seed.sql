-- ============================================================================
-- AbangReno.my — Local Development Seed Data
-- Run after migrations: supabase db reset (auto-runs seed.sql), or
-- psql "$DATABASE_URL" -f supabase/seed.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
insert into categories (name, slug, description, seo_title, seo_description) values
('Tukang Paip', 'tukang-paip', 'Servis pembaikan dan pemasangan paip air, termasuk paip bocor, sinki tersumbat dan tangki air.', 'Tukang Paip Berdekatan Anda | AbangReno', 'Cari tukang paip berpengalaman untuk membaiki paip bocor, sinki tersumbat dan pemasangan paip baru di kawasan anda.'),
('Waterproofing', 'waterproofing', 'Servis kalis air untuk bumbung, tandas, balkoni dan dinding bagi mencegah kebocoran.', 'Servis Waterproofing Rumah | AbangReno', 'Bandingkan vendor waterproofing berpengalaman untuk bumbung, tandas dan dinding rumah anda.'),
('Baiki Bumbung', 'baiki-bumbung', 'Pembaikan bumbung bocor, penggantian jubin bumbung dan penyelenggaraan struktur bumbung.', 'Baiki Bumbung Bocor | AbangReno', 'Cari kontraktor bumbung berpengalaman untuk membaiki kebocoran dan menggantikan jubin bumbung.'),
('Painting', 'painting', 'Servis mengecat dalaman dan luaran rumah, kedai dan bangunan komersial.', 'Servis Mengecat Rumah | AbangReno', 'Cari tukang cat profesional untuk kerja mengecat dalaman dan luaran rumah anda.'),
('Aircond', 'aircond', 'Pemasangan, servis dan pembaikan penghawa dingin (air conditioner).', 'Servis Aircond Berdekatan | AbangReno', 'Bandingkan vendor servis aircond untuk pemasangan, cuci dan pembaikan unit penghawa dingin.'),
('Electrical', 'electrical', 'Kerja pendawaian elektrik, pemasangan lampu dan pembaikan litar rumah.', 'Tukang Elektrik Berlesen | AbangReno', 'Cari tukang elektrik berpengalaman untuk pendawaian, pemasangan lampu dan pembaikan litar.'),
('Plaster Ceiling', 'plaster-ceiling', 'Reka bentuk dan pemasangan siling plaster untuk rumah dan pejabat.', 'Plaster Ceiling Design | AbangReno', 'Cari kontraktor plaster ceiling untuk reka bentuk siling rumah dan pejabat anda.'),
('Renovation', 'renovation', 'Kerja renovation menyeluruh untuk rumah, kedai dan pejabat.', 'Kontraktor Renovation Rumah | AbangReno', 'Bandingkan kontraktor renovation berpengalaman untuk projek ubah suai rumah anda.'),
('Kitchen Cabinet', 'kitchen-cabinet', 'Reka bentuk dan pemasangan kabinet dapur mengikut ukuran khas.', 'Kabinet Dapur Custom Made | AbangReno', 'Cari vendor kabinet dapur untuk reka bentuk dan pemasangan mengikut keperluan rumah anda.'),
('Flooring', 'flooring', 'Pemasangan lantai simen, tile, vinyl dan kayu untuk rumah dan pejabat.', 'Servis Pemasangan Lantai | AbangReno', 'Bandingkan vendor flooring untuk pemasangan tile, vinyl dan lantai kayu.')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- LOCATIONS
-- ---------------------------------------------------------------------------
insert into locations (name, slug, state, state_slug, type) values
('Selangor', 'selangor', 'Selangor', 'selangor', 'state'),
('Kuala Lumpur', 'kuala-lumpur', 'Kuala Lumpur', 'kuala-lumpur', 'state')
on conflict (slug) do nothing;

insert into locations (name, slug, state, state_slug, type, parent_id)
select 'Shah Alam', 'shah-alam', 'Selangor', 'selangor', 'city', id from locations where slug = 'selangor'
union all
select 'Klang', 'klang', 'Selangor', 'selangor', 'city', id from locations where slug = 'selangor'
union all
select 'Subang Jaya', 'subang-jaya', 'Selangor', 'selangor', 'city', id from locations where slug = 'selangor'
union all
select 'Petaling Jaya', 'petaling-jaya', 'Selangor', 'selangor', 'city', id from locations where slug = 'selangor'
union all
select 'Puchong', 'puchong', 'Selangor', 'selangor', 'city', id from locations where slug = 'selangor'
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- DEMO PROFILES + VENDORS
-- NOTE: In real usage, profiles are created automatically via the
-- on_auth_user_created trigger when someone signs up through Supabase Auth.
-- For local seeding we insert directly with fixed UUIDs (no matching auth
-- user), which is fine for local dev but must not be used in production.
-- ---------------------------------------------------------------------------
insert into profiles (id, name, email, phone, phone_verified, role) values
('11111111-1111-1111-1111-111111111111', 'Ahmad Zulkifli', 'ahmad@example.com', '+60123456789', true, 'vendor'),
('22222222-2222-2222-2222-222222222222', 'Siti Rahmah', 'siti@example.com', '+60129876543', true, 'vendor'),
('33333333-3333-3333-3333-333333333333', 'Admin Utama', 'admin@abangreno.my', '+60111111111', true, 'admin')
on conflict (id) do nothing;

insert into vendors (
  id, user_id, business_name, slug, primary_category_id, phone, whatsapp,
  description, verification_status, is_active, profile_completeness
)
select
  'aaaaaaaa-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Ahmad Plumbing Services',
  'ahmad-plumbing-services',
  c.id,
  '+60123456789',
  '+60123456789',
  'Ahmad Plumbing Services menawarkan perkhidmatan tukang paip yang lengkap di kawasan Shah Alam dan sekitarnya. Dengan pengalaman lebih 10 tahun dalam industri, kami mengendalikan pelbagai masalah paip termasuk paip bocor, sinki tersumbat, pemasangan tangki air, pembaikan tandas dan pendawaian paip baru untuk rumah baru mahupun renovation. Kami komited kepada kerja yang kemas, harga yang telus dan respon yang pantas untuk setiap panggilan kecemasan. Semua kerja disertakan waranti minimum 3 bulan bagi pemasangan baru. Pelanggan boleh menghubungi kami terus melalui WhatsApp untuk sebut harga percuma sebelum kerja dimulakan.',
  'verified_ssm',
  true,
  85
from categories c where c.slug = 'tukang-paip'
on conflict (id) do nothing;

insert into vendors (
  id, user_id, business_name, slug, primary_category_id, phone, whatsapp,
  description, verification_status, is_active, profile_completeness
)
select
  'aaaaaaaa-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  'Siti Waterproofing Solutions',
  'siti-waterproofing-solutions',
  c.id,
  '+60129876543',
  '+60129876543',
  'Siti Waterproofing Solutions pakar dalam servis kalis air untuk bumbung rata, tandas, balkoni dan dinding bertingkat di kawasan Klang Valley. Kami menggunakan bahan waterproofing berkualiti tinggi yang sesuai dengan cuaca tropika Malaysia dan menawarkan pemeriksaan percuma sebelum sebut harga dikeluarkan. Setiap projek disertakan waranti bertulis dan susulan pemeriksaan selepas hujan lebat pertama. Pasukan kami berpengalaman menangani kebocoran yang kompleks termasuk kebocoran dari sambungan paip dalam dinding dan kebocoran struktur lama. Hubungi kami melalui WhatsApp untuk lawatan tapak percuma.',
  'pending',
  true,
  70
from categories c where c.slug = 'waterproofing'
on conflict (id) do nothing;

-- Vendor categories, service areas, services for demo vendors
insert into vendor_categories (vendor_id, category_id, is_primary)
select 'aaaaaaaa-0000-0000-0000-000000000001', id, true from categories where slug = 'tukang-paip'
union all
select 'aaaaaaaa-0000-0000-0000-000000000002', id, true from categories where slug = 'waterproofing'
on conflict do nothing;

insert into vendor_service_areas (vendor_id, location_id)
select 'aaaaaaaa-0000-0000-0000-000000000001', id from locations where slug in ('shah-alam', 'klang', 'subang-jaya')
union all
select 'aaaaaaaa-0000-0000-0000-000000000002', id from locations where slug in ('klang', 'petaling-jaya', 'puchong')
on conflict do nothing;

insert into vendor_services (vendor_id, title, description, price_from, price_unit) values
('aaaaaaaa-0000-0000-0000-000000000001', 'Baiki Paip Bocor', 'Pembaikan kebocoran paip air di dapur, bilik air dan luar rumah.', 80, 'per visit'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Sinki Tersumbat', 'Servis membuka sinki dan longkang tersumbat.', 60, 'per visit'),
('aaaaaaaa-0000-0000-0000-000000000002', 'Waterproofing Bumbung Rata', 'Rawatan kalis air untuk bumbung rata bagi mengelakkan kebocoran.', 8, 'per sq ft'),
('aaaaaaaa-0000-0000-0000-000000000002', 'Waterproofing Tandas', 'Rawatan kalis air lantai dan dinding tandas.', 500, 'per unit');

-- ---------------------------------------------------------------------------
-- DEMO FORUM CONTENT
-- ---------------------------------------------------------------------------
insert into forum_posts (id, category_id, slug, title, content, location_tag, guest_name, status)
select
  'bbbbbbbb-0000-0000-0000-000000000001',
  c.id,
  'kenapa-paip-dapur-saya-selalu-bocor',
  'Kenapa paip dapur saya selalu bocor walaupun dah baiki berkali-kali?',
  'Saya dah panggil tukang paip 2 kali untuk baiki paip bawah sink dapur tapi selepas beberapa minggu bocor lagi. Ada sesiapa tahu punca sebenar isu ini?',
  'Shah Alam',
  'Homeowner123',
  'visible'
from categories c where c.slug = 'tukang-paip'
on conflict (id) do nothing;

insert into forum_replies (post_id, content, is_vendor_reply, vendor_id, guest_name, status) values
('bbbbbbbb-0000-0000-0000-000000000001', 'Selalunya isu ini berlaku sebab gasket atau seal asal dah haus dan hanya ditampal buat sementara, bukan digantikan terus. Cadangan saya, minta tukang tukar terus fitting P-trap dan seal baru, bukan sekadar sealant.', true, 'aaaaaaaa-0000-0000-0000-000000000001', null, 'visible'),
('bbbbbbbb-0000-0000-0000-000000000001', 'Sama macam kes saya dulu, last-last kena tukar full fitting baru baru settle.', false, null, 'JiranSebelah', 'visible');

-- ---------------------------------------------------------------------------
-- DEMO REVIEW
-- ---------------------------------------------------------------------------
insert into reviews (vendor_id, user_id, rating, comment, status) values
('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 5, 'Responsif dan kerja kemas. Datang tepat masa dan selesaikan masalah paip bocor dengan cepat.', 'visible')
on conflict (vendor_id, user_id) do nothing;
