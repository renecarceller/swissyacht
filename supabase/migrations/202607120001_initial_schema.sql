create extension if not exists "pgcrypto";

do $$ begin
  create type public.account_role as enum ('private', 'professional', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_status as enum ('draft', 'pending_review', 'published', 'paused', 'sold', 'rejected', 'expired', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.seller_type as enum ('private', 'professional');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'private',
  full_name text not null,
  phone text,
  preferred_locale text not null default 'fr',
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null,
  slug text not null unique,
  logo_path text,
  address_line text,
  city text,
  postal_code text,
  canton text,
  website text,
  phones text[] not null default '{}',
  languages text[] not null default '{fr}',
  description text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_de text not null,
  name_it text not null,
  name_en text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (brand_id, slug)
);

create table if not exists public.cantons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name text not null
);

create table if not exists public.lakes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cantons text[] not null default '{}'
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  canton_id uuid references public.cantons(id) on delete set null,
  slug text not null,
  name text not null,
  unique (canton_id, slug)
);

create table if not exists public.marinas (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  lake_id uuid references public.lakes(id) on delete set null,
  slug text not null,
  name text not null,
  unique (city_id, slug)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  model_id uuid references public.models(id) on delete set null,
  canton_id uuid references public.cantons(id) on delete set null,
  lake_id uuid references public.lakes(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  marina_id uuid references public.marinas(id) on delete set null,
  slug text not null unique,
  title text not null,
  status public.listing_status not null default 'draft',
  seller_type public.seller_type not null default 'private',
  boat_type text not null,
  brand_name text not null,
  model_name text not null,
  year int not null check (year between 1900 and extract(year from now())::int + 1),
  condition text not null,
  price_chf int not null check (price_chf > 0),
  vat_included boolean not null default false,
  negotiable boolean not null default false,
  financing_available boolean not null default false,
  fuel_type text,
  engine_type text,
  engine_count int not null default 0,
  power_hp int not null default 0,
  engine_hours int not null default 0,
  length_m numeric(8,2) not null check (length_m > 0),
  beam_m numeric(8,2) not null check (beam_m > 0),
  weight_kg int,
  hull_material text,
  color text,
  trailer_included boolean not null default false,
  berth_included boolean not null default false,
  license_required boolean not null default false,
  electric boolean not null default false,
  description text not null,
  equipment text[] not null default '{}',
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  demo boolean not null default false,
  featured boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  public_url text,
  thumbnail_path text,
  alt_text text,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.listing_features (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  feature_key text not null,
  feature_value text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  privacy_consent boolean not null default false,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(id) on delete cascade,
  plan_code text not null,
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  target_table text not null,
  target_id uuid,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_owner_idx on public.listings(owner_id);
create index if not exists listings_price_idx on public.listings(price_chf);
create index if not exists listings_year_idx on public.listings(year);
create index if not exists listings_length_idx on public.listings(length_m);
create index if not exists listings_location_idx on public.listings(canton_id, lake_id, city_id);
create index if not exists inquiries_seller_idx on public.inquiries(seller_id, created_at desc);
create index if not exists listing_views_listing_idx on public.listing_views(listing_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and suspended_at is null and deleted_at is null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.cantons enable row level security;
alter table public.lakes enable row level security;
alter table public.cities enable row level security;
alter table public.marinas enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_features enable row level security;
alter table public.favorites enable row level security;
alter table public.inquiries enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.listing_views enable row level security;
alter table public.admin_actions enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.brands, public.models, public.cantons, public.lakes, public.cities, public.marinas to anon, authenticated;
grant select on public.listings, public.listing_images, public.listing_features to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.professional_profiles, public.listings, public.listing_images, public.listing_features, public.favorites, public.inquiries, public.reports, public.subscriptions, public.listing_views to authenticated;
grant select, insert, update, delete on public.categories, public.brands, public.models, public.cantons, public.lakes, public.cities, public.marinas, public.admin_actions to authenticated;

create policy "profiles owner or admin read" on public.profiles for select to authenticated using ((select auth.uid()) = id or public.is_admin());
create policy "profiles owner insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles owner update" on public.profiles for update to authenticated using ((select auth.uid()) = id or public.is_admin()) with check ((select auth.uid()) = id or public.is_admin());

create policy "lookup public read categories" on public.categories for select to anon, authenticated using (true);
create policy "lookup public read brands" on public.brands for select to anon, authenticated using (true);
create policy "lookup public read models" on public.models for select to anon, authenticated using (true);
create policy "lookup public read cantons" on public.cantons for select to anon, authenticated using (true);
create policy "lookup public read lakes" on public.lakes for select to anon, authenticated using (true);
create policy "lookup public read cities" on public.cities for select to anon, authenticated using (true);
create policy "lookup public read marinas" on public.marinas for select to anon, authenticated using (true);

create policy "admin manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage brands" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage models" on public.models for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage locations cantons" on public.cantons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage locations lakes" on public.lakes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage locations cities" on public.cities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manage locations marinas" on public.marinas for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "professional profiles public read" on public.professional_profiles for select to anon, authenticated using (deleted_at is null);
create policy "professional profiles owner insert" on public.professional_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "professional profiles owner update" on public.professional_profiles for update to authenticated using ((select auth.uid()) = user_id or public.is_admin()) with check ((select auth.uid()) = user_id or public.is_admin());

create policy "published listings public read" on public.listings for select to anon, authenticated using ((status = 'published' and deleted_at is null) or owner_id = (select auth.uid()) or public.is_admin());
create policy "owners create listings" on public.listings for insert to authenticated with check ((select auth.uid()) = owner_id and status in ('draft', 'pending_review'));
create policy "owners update own listings" on public.listings for update to authenticated using ((select auth.uid()) = owner_id or public.is_admin()) with check ((select auth.uid()) = owner_id or public.is_admin());
create policy "owners soft delete own listings" on public.listings for delete to authenticated using ((select auth.uid()) = owner_id or public.is_admin());

create policy "listing images public read" on public.listing_images for select to anon, authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id and (l.status = 'published' or l.owner_id = (select auth.uid()) or public.is_admin()))
);
create policy "listing images owner manage" on public.listing_images for all to authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id and (l.owner_id = (select auth.uid()) or public.is_admin()))
) with check (
  exists (select 1 from public.listings l where l.id = listing_id and (l.owner_id = (select auth.uid()) or public.is_admin()))
);

create policy "listing features public read" on public.listing_features for select to anon, authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id and (l.status = 'published' or l.owner_id = (select auth.uid()) or public.is_admin()))
);
create policy "listing features owner manage" on public.listing_features for all to authenticated using (
  exists (select 1 from public.listings l where l.id = listing_id and (l.owner_id = (select auth.uid()) or public.is_admin()))
) with check (
  exists (select 1 from public.listings l where l.id = listing_id and (l.owner_id = (select auth.uid()) or public.is_admin()))
);

create policy "favorites owner manage" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "inquiries seller or buyer read" on public.inquiries for select to authenticated using (seller_id = (select auth.uid()) or buyer_id = (select auth.uid()) or public.is_admin());
create policy "inquiries insert authenticated" on public.inquiries for insert to authenticated with check (privacy_consent = true);
create policy "reports insert authenticated" on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reports admin read" on public.reports for select to authenticated using (public.is_admin() or reporter_id = (select auth.uid()));
create policy "subscriptions owner read" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "listing views insert anyone auth" on public.listing_views for insert to authenticated with check (true);
create policy "listing views owner stats" on public.listing_views for select to authenticated using (
  public.is_admin() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid()))
);
create policy "admin actions admin only" on public.admin_actions for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "listing image owner upload" on storage.objects for insert to authenticated
with check (bucket_id = 'listing-images' and owner = (select auth.uid()));
create policy "listing image owner update" on storage.objects for update to authenticated
using (bucket_id = 'listing-images' and owner = (select auth.uid()))
with check (bucket_id = 'listing-images' and owner = (select auth.uid()));
create policy "listing image owner delete" on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and owner = (select auth.uid()));
create policy "listing image authenticated read" on storage.objects for select to authenticated
using (bucket_id = 'listing-images');
