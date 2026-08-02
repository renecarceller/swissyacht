# Alpinyacht Database Schema

The Supabase database is normalized around users, professional profiles, listings, location taxonomy, inquiries, moderation, and future subscriptions.

## Core Tables

- `profiles`: one row per Supabase Auth user, with role `private`, `professional`, or `admin`.
- `professional_profiles`: company data, logo, languages, phones, website, verification status.
- `categories`, `brands`, `models`: listing taxonomy.
- `cantons`, `lakes`, `cities`, `marinas`: Swiss location hierarchy.
- `listings`: primary advertisement table with status workflow, technical specs, SEO slug, monetization flags, and soft delete.
- `listing_images`: ordered images with primary-image flag and future thumbnail path.
- `listing_features`: flexible equipment/features per listing.
- `favorites`: saved listings per user.
- `inquiries`: stored buyer-to-seller contact requests.
- `reports`: buyer/user reports for moderation.
- `subscriptions`: future professional monetization plans and billing provider references.
- `listing_views`: analytics events for listing performance.
- `admin_actions`: immutable audit log for moderation and configuration actions.

## Security Model

- RLS is enabled on all public tables.
- Public visitors can read published listings and lookup tables.
- Authenticated owners can create, update, pause, delete, and view their own records.
- Admin access is determined through `profiles.role = 'admin'`, not user-editable metadata.
- New tables receive explicit `GRANT` statements for `anon` and `authenticated` roles because Supabase projects may no longer expose tables automatically through the Data API.
- Storage uses a private `listing-images` bucket. Owners can manage images in folders matching their user id; public reads are allowed only through listing/image metadata and signed URLs can be introduced later.

## Status Workflow

`draft -> pending_review -> published -> paused | sold | rejected | expired | archived`

New submitted listings must pass moderation before becoming `published`.

## Migration Files

- `supabase/migrations/202607120001_initial_schema.sql`
- `supabase/seed/seed.sql`
