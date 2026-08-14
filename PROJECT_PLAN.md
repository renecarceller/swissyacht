# Swissnaut Project Plan

Swissnaut is a Swiss-only boat marketplace built with Next.js App Router, TypeScript, Tailwind CSS, next-intl, Supabase Auth/Postgres/Storage, React Hook Form, and Zod.

## Repository Status

The repository was empty before initialization on 2026-07-12. The project is created from scratch.

## Architecture

- `src/app/[locale]`: localized public, auth, dashboard, and admin routes.
- `src/components`: reusable layout, listing, form, and UI primitives.
- `src/lib/data`: demo data and query helpers. Supabase can replace demo reads once environment variables and migrations are applied.
- `src/lib/actions`: server-side mutations for listings and inquiries.
- `src/lib/supabase`: browser, server, and admin client factories.
- `src/lib/validation`: Zod schemas for listings, filters, auth, and contact forms.
- `src/i18n`: next-intl locale routing and messages.
- `supabase/migrations`: normalized schema, RLS policies, grants, storage bucket, and seed data.
- `tests`: validation, permissions, filters, publishing, and inquiry tests.

## Phases

1. Initialize Next.js app, dependencies, lint/type/test tooling.
2. Build responsive marketplace UI and localized route shell.
3. Add Supabase schema, RLS, storage, seeds, and access clients.
4. Add auth screens and protected dashboard/admin layouts.
5. Add multi-step listing publication flow with draft and pending review states.
6. Add search page with URL-reflected filters, sorting, pagination, and view modes.
7. Add listing detail page with gallery, seller details, inquiry form, fraud notice, favorites/share affordances.
8. Add user dashboard, professional profiles, and admin moderation surfaces.
9. Add SEO metadata, clean slugs, robots, sitemap, breadcrumbs, and structured data.
10. Add tests and production documentation.

## Key Decisions

- Default locale is French; `fr`, `de`, `it`, and `en` are supported from day one.
- New listings enter `pending_review`, while drafts stay `draft`.
- The app runs in demo mode without Supabase credentials so the MVP can be reviewed locally.
- Authorization is enforced in Supabase RLS and mirrored in server validation helpers for tests.
- Monetization tables are included but Stripe is intentionally not activated in MVP.
