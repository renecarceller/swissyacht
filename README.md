# SwissYacht

SwissYacht is a professional MVP for a Swiss-only boat marketplace inspired by classified portals such as AutoScout24, focused on boats, sailboats, yachts, brokers, dealers, and marine businesses.

## Stack

- Next.js App Router, TypeScript, React, Tailwind CSS
- next-intl with `fr`, `de`, `it`, `en`
- Supabase Postgres, Auth, Storage, RLS
- React Hook Form-ready form architecture with Zod validation
- Vercel-ready deployment
- Vitest tests

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/fr`.

The app runs in demo mode without Supabase credentials. Demo listings are clearly marked as demo and are not copied from real advertisements.

## Supabase Setup

1. Create a Supabase project.
2. Copy project URL and publishable key into `.env.local`.
3. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.
4. Apply the migration:

```bash
supabase db push
```

5. Seed lookup data:

```bash
supabase db reset
```

The migration enables RLS on every public table, grants Data API access explicitly, creates the private `listing-images` storage bucket, and prevents users from editing listings owned by others.

## Create an Admin

1. Register a user through Supabase Auth.
2. In Supabase SQL editor, run:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-id>';
```

Admin rights are stored in `profiles.role`, not user-editable metadata.

## Vercel Deployment

1. Import the repository in Vercel.
2. Add environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL` to the production domain.
4. Deploy.
5. Apply Supabase migrations against the production database.

## GitHub and Cloudflare Deployment

The project is also prepared for Cloudflare Workers through the OpenNext Cloudflare adapter.

```bash
npm run cf:preview
npm run cf:deploy
```

GitHub Actions deployment is configured in `.github/workflows/cloudflare-workers.yml`. Add the required Cloudflare and Supabase secrets in GitHub before running it. See `DEPLOYMENT.md` for the full connection steps.

## Finished

- Localized public shell with responsive navigation and footer.
- Home page with hero image, quick search, categories, featured listings, professionals section, selling flow, popular lakes.
- Search page with URL filters, sorting, result counts, card/list view, pagination, and future map placeholder.
- Listing detail page with gallery, price, technical specs, seller details, inquiry form, phone/favorite/share actions, fraud notice, similar listings, structured data.
- Multi-step listing publication form with validation and draft/pending review workflow.
- User dashboard, listings, messages, favorites, profile, settings/subscription placeholders.
- Professional profile page architecture.
- Admin moderation surface.
- Legal placeholder pages requiring Swiss legal review.
- Supabase schema, RLS, storage, grants, and seed lookup data.
- Sitemap, robots, Open Graph metadata, clean localized URLs.
- Tests for validation, filters, permissions, publishing workflow, and inquiries.

## Pending

- Replace demo read layer with live Supabase queries once a project is connected.
- Add real Supabase Auth form actions and session refresh middleware.
- Add image compression/upload/order UI backed by Supabase Storage.
- Add email notification provider for seller inquiries.
- Add Stripe billing, coupons, renewals, featured listing purchases, and professional subscriptions.
- Add full E2E browser tests and Lighthouse tuning after deployment.

## Technical Decisions

- French is the default locale, with architecture ready for German, Italian, and English.
- New listings submit as `pending_review`; only admins can publish them.
- RLS is the primary access-control boundary; server helpers mirror key permission logic for tests.
- Tables receive explicit grants because new Supabase projects may not expose tables to the Data API automatically.
- Legal text is intentionally placeholder-only until reviewed by Swiss legal counsel.
