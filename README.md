# AbangReno.my

A Malaysian directory platform for renovation, repair, maintenance, and
home-improvement vendors — connecting homeowners with service vendors via
an SEO-first, AEO-friendly, mobile-first marketplace.

Built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

---

## ⚠️ Before You Start

This project was assembled in a sandboxed environment **without network
access**, so `npm install`, `npm run build`, and `npm run lint` have **not**
been run or verified here. Run them yourself as the first step — see
[Final Quality Check](#8-final-quality-check) below. Expect to fix minor
TypeScript/import issues on the first build.

---

## 1. Prerequisites

- Node.js 18.18+ (20.x recommended)
- npm 9+
- A [Supabase](https://supabase.com) project (free tier is fine to start)
- A [Cloudflare](https://cloudflare.com) account for Turnstile (anti-spam captcha)
- A [Vercel](https://vercel.com) account for deployment (optional for local dev)

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Environment Variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your domain, e.g. `https://abangreno.my` (use `http://localhost:3000` locally) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (**server-only, never expose to client**) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SITE_KEY` | Cloudflare Dashboard → Turnstile |
| `TURNSTILE_SECRET_KEY` | Cloudflare Dashboard → Turnstile |
| `IP_HASH_SALT` | Any random string you generate (`openssl rand -hex 16`) |

Never commit `.env.local`.

---

## 4. Supabase Setup

### 4.1 Install the Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Link your project

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 4.3 Run migrations

Migrations live in `supabase/migrations/` and run in order:

1. `0001_init_schema.sql` — all tables, enums, triggers (rating cache, updated_at)
2. `0002_rls_policies.sql` — Row Level Security policies for every table
3. `0003_storage_buckets.sql` — public vendor-media bucket + private SSM/IC bucket
4. `0004_security_hardening.sql` — **critical security pass**: column-level protection triggers preventing self-escalation of `profiles.role`/`phone_verified`, vendor system-field tampering (`verification_status`, `avg_rating`, etc.), and review field tampering; hardened `search_path` on all `SECURITY DEFINER` functions; one-vendor-per-user, one-primary-category-per-vendor, one-pending-verification-per-vendor constraints
5. `0005_report_rate_limiting.sql` — adds `ip_hash` to `reports` for abuse rate limiting
6. `0006_reports_insert_lockdown.sql` — removes direct client INSERT access to `reports`, forcing all report creation through the rate-limited server route
7. `0007_verification_workflow_hardening.sql` — protects `vendors.is_active` as a system field; adds atomic `submit_vendor_verification()` and `review_vendor_verification()` Postgres functions so the submit/approve/reject flows can never leave `vendor_verifications` and `vendors` in an inconsistent state; configures `file_size_limit`/`allowed_mime_types` on both storage buckets at the bucket level
8. `0008_vendor_verifications_write_lockdown.sql` — removes direct client INSERT/UPDATE access to `vendor_verifications`, forcing all writes through the two atomic functions above

Apply them to your linked project:

```bash
supabase db push
```

Or, for local development with the Supabase CLI's local stack:

```bash
supabase start
supabase db reset   # applies migrations AND runs supabase/seed.sql automatically
```

### 4.4 Seed data

`supabase/seed.sql` contains demo categories, locations, two demo vendors,
a demo forum thread, and a demo review. `supabase db reset` runs it
automatically for local dev. To seed a remote project directly:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

(`DATABASE_URL` is in Supabase Dashboard → Project Settings → Database.)

---

## 5. Supabase Auth Setup

1. In Supabase Dashboard → Authentication → Providers, enable:
   - **Email** (magic link — already works out of the box)
   - **Google** — you'll need a Google Cloud OAuth Client ID/Secret (see below)
   - **Phone** — requires an SMS provider (see §6)
2. Set the Site URL and Redirect URLs under Authentication → URL Configuration
   to match `NEXT_PUBLIC_SITE_URL` (and `http://localhost:3000` for local dev).
3. The `handle_new_user()` trigger (in `0001_init_schema.sql`) automatically
   creates a `profiles` row whenever someone signs up — no manual step needed.

### Google Login Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (type: Web application).
3. Add `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
4. Copy the Client ID and Secret into Supabase Dashboard → Authentication → Providers → Google.

### Mandatory Phone Verification

Per platform policy, Google/email login does **not** count as identity
verification — every vendor must separately verify a phone number by OTP
before they can create a listing. This is enforced server-side:

- `/api/profile/send-phone-otp` and `/api/profile/verify-phone-otp` are the
  **only** code paths allowed to set `profiles.phone_verified = true`. A
  database trigger (`protect_profile_privileged_columns` in
  `0004_security_hardening.sql`) silently reverts that column for any write
  that isn't running as the service role — so it cannot be set by editing a
  request body or calling the Supabase client directly from the browser.
- `/api/vendor` reads `phone_verified` from the database before allowing
  vendor creation, never from a client-supplied boolean.
- The `/daftar-vendor` page shows `components/auth/PhoneVerificationForm.tsx`
  first if the user's phone isn't verified yet.

---

## 6. Phone OTP Setup

Supabase Auth supports phone OTP but requires you to connect a real SMS
provider (Twilio, MessageBird, Vonage, or a Malaysian-friendly alternative).

1. Supabase Dashboard → Authentication → Providers → Phone.
2. Choose a provider and enter its credentials (Account SID, Auth Token, sender number, etc.) — **these live in Supabase's dashboard, not in this repo's `.env`**.
3. The UI in `components/auth/LoginForm.tsx` already calls `supabase.auth.signInWithOtp({ phone })` / `verifyOtp(...)` — no code changes needed once a provider is configured.

Until a provider is connected, phone OTP login will fail gracefully with a
Supabase error message shown to the user.

---

## 7. Cloudflare Turnstile Setup (Anti-Spam)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Turnstile → Add Site.
2. Add your domain (and `localhost` for local dev — Cloudflare supports this).
3. Copy the **Site Key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SITE_KEY`, and the **Secret Key** into `TURNSTILE_SECRET_KEY`.
4. This is now fully wired: `components/ui/TurnstileWidget.tsx` renders the real Cloudflare challenge in both guest forum forms, and `lib/security/turnstile.ts` verifies the resulting token against Cloudflare's `siteverify` endpoint server-side in `/api/forum/post` and `/api/forum/reply` before any database write. Missing, invalid, or expired tokens are rejected. If `TURNSTILE_SECRET_KEY` is unset, verification fails closed (rejects everything) rather than silently trusting submissions.

---

## 8. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Final Quality Check (run this before deploying)

```bash
npm install
npm run build
npm run lint
```

Fix any TypeScript or build errors before deploying. Manually verify these routes render correctly:

- `/`
- `/kategori/tukang-paip`
- `/kategori/tukang-paip/shah-alam`
- `/vendor/ahmad-plumbing-services` (demo vendor from seed data)
- `/forum`
- `/forum/tukang-paip`
- `/forum/tukang-paip/kenapa-paip-dapur-saya-selalu-bocor` (demo thread from seed data)
- `/daftar-vendor`
- `/login`
- `/dashboard` (requires login)
- `/admin` (requires login as a user with `role = 'admin'` in `profiles`)
- `/privacy`, `/terms`, `/about`

Also check the mobile viewport (375px width) for each of the above.

---

## 9. Vercel Deployment

```bash
npm install -g vercel
vercel link
```

1. In the Vercel Dashboard, add every variable from `.env.example` under
   Project Settings → Environment Variables (for Production, Preview, and
   Development as appropriate).
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Update Supabase Auth → URL Configuration to include your Vercel domain
   in Redirect URLs.
4. Deploy:

```bash
vercel --prod
```

Or connect the GitHub repo directly in the Vercel Dashboard for automatic
deploys on push.

---

## 10. Project Structure

```
app/                      Next.js App Router pages & API routes
  kategori/[slug]/[loc]   Category & category+location SEO pages
  vendor/[slug]           Vendor profile pages
  forum/[cat]/[thread]    Forum Q&A pages
  dashboard/              Authenticated vendor dashboard
  admin/                  Authenticated admin panel
  api/                    Route Handlers (server actions equivalent)
  sitemap.ts, robots.ts   SEO infrastructure

components/
  layout/  vendor/  forum/  search/  ui/  seo/  auth/  admin/

lib/
  supabase/    server.ts, client.ts, admin.ts
  seo/         metadata.ts, jsonLd.ts
  validation/  Zod schemas
  ranking/     transparent weighted vendor ranking
  moderation/  spam filter + rate limiting
  utils/       slug generation

supabase/
  migrations/  0001_init_schema.sql, 0002_rls_policies.sql, 0003_storage_buckets.sql
  seed.sql     Demo categories, locations, vendors, forum thread, review

types/
  database.ts  Hand-authored types mirroring the schema
```

---

## 11. Future Work (Not in MVP)

- **Cloudflare Stream** for vendor video uploads. `vendor_images` schema is
  structured so a `vendor_videos` table (or a `type: 'video'` extension) can
  be added later without breaking existing queries. See `CLOUDFLARE_STREAM_*`
  env vars in `.env.example`, currently unused.
- **Google AdSense**. Ad slots are intentionally *not* wired into the layout
  yet — see the SEO content block and post-results areas in
  `app/kategori/[kategoriSlug]/page.tsx` as the natural insertion points
  once ready, keeping them clear of WhatsApp CTAs per policy.
- **Reverse geocoding** for the homepage's "detect my location" button
  (`components/search/HeroSearch.tsx`) — currently only requests browser
  geolocation permission; wire it to a geocoding service and match against
  the `locations` table.
- **Turnstile verification** — see §7 above.
- **Claim guest forum posts** flow — schema (`session_token`, `ip_hash`
  columns) is in place; the claim UI/endpoint itself is not yet built.

---

## 12. Platform Disclaimer

AbangReno.my is an intermediary directory platform and is not a party to
transactions between customers and service providers. "SSM Verified" means
submitted business registration documents have been reviewed — it is not an
endorsement or guarantee of workmanship.
