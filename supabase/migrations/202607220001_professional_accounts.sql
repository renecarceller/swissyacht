do $$ begin
  create type public.professional_member_role as enum ('owner', 'admin', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inquiry_request_type as enum ('information', 'visit', 'sea_trial', 'financing', 'trade_in');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.saved_search_frequency as enum ('immediate', 'daily', 'weekly', 'none');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists account_type public.account_role not null default 'private',
  add column if not exists region text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_accepted_at timestamptz;

update public.profiles
set account_type = role
where account_type is distinct from role;

alter table public.professional_profiles
  add column if not exists legal_name text,
  add column if not exists professional_type text not null default 'broker',
  add column if not exists uid_vat text,
  add column if not exists founded_year int,
  add column if not exists approximate_inventory text,
  add column if not exists cover_path text,
  add column if not exists public_email text,
  add column if not exists public_phone text,
  add column if not exists whatsapp_phone text,
  add column if not exists whatsapp_enabled boolean not null default false,
  add column if not exists country text not null default 'Switzerland',
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7),
  add column if not exists opening_hours jsonb not null default '{}',
  add column if not exists social_links jsonb not null default '{}',
  add column if not exists service_areas text[] not null default '{}',
  add column if not exists profile_completed_percent int not null default 0 check (profile_completed_percent between 0 and 100),
  add column if not exists published_at timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_start_at timestamptz,
  add column if not exists featured_end_at timestamptz,
  add column if not exists featured_locations text[] not null default '{}',
  add column if not exists subscription_plan text,
  add column if not exists subscription_status text not null default 'inactive';

alter table public.listings
  add column if not exists people_capacity int not null default 0,
  add column if not exists cabins int not null default 0,
  add column if not exists berths int not null default 0,
  add column if not exists bathrooms int not null default 0,
  add column if not exists kitchen boolean not null default false,
  add column if not exists overnight_accommodation boolean not null default false,
  add column if not exists allow_trade_in boolean not null default false;

alter table public.inquiries
  add column if not exists professional_profile_id uuid references public.professional_profiles(id) on delete set null,
  add column if not exists request_type public.inquiry_request_type not null default 'information',
  add column if not exists contact_preference text not null default 'email',
  add column if not exists source text not null default 'listing_detail',
  add column if not exists listing_snapshot jsonb not null default '{}',
  add column if not exists read_at timestamptz,
  add column if not exists archived_at timestamptz;

create table if not exists public.professional_members (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.professional_member_role not null default 'viewer',
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_profile_id, user_id)
);

insert into public.professional_members (professional_profile_id, user_id, role, accepted_at)
select id, user_id, 'owner', now()
from public.professional_profiles
on conflict (professional_profile_id, user_id) do nothing;

create table if not exists public.broker_services (
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  service_code text not null,
  created_at timestamptz not null default now(),
  primary key (professional_profile_id, service_code)
);

create table if not exists public.broker_gallery (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.broker_badges (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  badge_code text not null,
  label text,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (professional_profile_id, badge_code)
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  frequency public.saved_search_frequency not null default 'none',
  active boolean not null default true,
  last_checked_at timestamptz,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  anonymous_key text,
  listing_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or anonymous_key is not null),
  check (cardinality(listing_ids) between 0 and 4)
);

create table if not exists public.broker_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  alert_new_listings boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, professional_profile_id)
);

create index if not exists profiles_account_type_idx on public.profiles(account_type);
create index if not exists professional_profiles_slug_idx on public.professional_profiles(slug) where deleted_at is null;
create index if not exists professional_profiles_featured_idx on public.professional_profiles(is_featured, featured_end_at) where deleted_at is null;
create index if not exists professional_members_user_idx on public.professional_members(user_id, professional_profile_id);
create index if not exists listings_professional_profile_idx on public.listings(professional_profile_id, status);
create index if not exists inquiries_professional_profile_idx on public.inquiries(professional_profile_id, created_at desc);
create index if not exists saved_searches_user_idx on public.saved_searches(user_id, active);
create index if not exists broker_follows_broker_idx on public.broker_follows(professional_profile_id);

create or replace function public.is_professional_member(target_professional_profile_id uuid, allowed_roles public.professional_member_role[] default array['owner','admin','editor']::public.professional_member_role[])
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.professional_members member
    join public.profiles profile on profile.id = member.user_id
    where member.professional_profile_id = target_professional_profile_id
      and member.user_id = (select auth.uid())
      and member.role = any(allowed_roles)
      and profile.suspended_at is null
      and profile.deleted_at is null
  );
$$;

revoke all on function public.is_professional_member(uuid, public.professional_member_role[]) from public;
grant execute on function public.is_professional_member(uuid, public.professional_member_role[]) to authenticated;

alter table public.professional_members enable row level security;
alter table public.broker_services enable row level security;
alter table public.broker_gallery enable row level security;
alter table public.broker_badges enable row level security;
alter table public.saved_searches enable row level security;
alter table public.listing_comparisons enable row level security;
alter table public.broker_follows enable row level security;

grant select on public.professional_members, public.broker_services, public.broker_gallery, public.broker_badges to anon, authenticated;
grant select, insert, update, delete on public.professional_members, public.broker_services, public.broker_gallery, public.broker_badges, public.saved_searches, public.listing_comparisons, public.broker_follows to authenticated;

drop policy if exists "professional profiles owner update" on public.professional_profiles;
create policy "professional profiles member update" on public.professional_profiles for update to authenticated
using (public.is_professional_member(id, array['owner','admin']::public.professional_member_role[]) or public.is_admin())
with check (public.is_professional_member(id, array['owner','admin']::public.professional_member_role[]) or public.is_admin());

create policy "professional members public read published" on public.professional_members for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
  or user_id = (select auth.uid())
  or public.is_admin()
);

create policy "professional members owner admin manage" on public.professional_members for all to authenticated
using (public.is_professional_member(professional_profile_id, array['owner','admin']::public.professional_member_role[]) or public.is_admin())
with check (public.is_professional_member(professional_profile_id, array['owner','admin']::public.professional_member_role[]) or public.is_admin());

create policy "broker services public read" on public.broker_services for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
);

create policy "broker services member manage" on public.broker_services for all to authenticated
using (public.is_professional_member(professional_profile_id) or public.is_admin())
with check (public.is_professional_member(professional_profile_id) or public.is_admin());

create policy "broker gallery public read" on public.broker_gallery for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
);

create policy "broker gallery member manage" on public.broker_gallery for all to authenticated
using (public.is_professional_member(professional_profile_id) or public.is_admin())
with check (public.is_professional_member(professional_profile_id) or public.is_admin());

create policy "broker badges public read" on public.broker_badges for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
);

create policy "broker badges admin manage" on public.broker_badges for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "saved searches owner manage" on public.saved_searches for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "listing comparisons owner manage" on public.listing_comparisons for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

create policy "broker follows owner manage" on public.broker_follows for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "owners create listings" on public.listings;
create policy "owners or broker members create listings" on public.listings for insert to authenticated
with check (
  ((select auth.uid()) = owner_id and professional_profile_id is null and status in ('draft', 'pending_review', 'published'))
  or (professional_profile_id is not null and public.is_professional_member(professional_profile_id) and status in ('draft', 'pending_review', 'published'))
  or public.is_admin()
);

drop policy if exists "owners update own listings" on public.listings;
create policy "owners or broker members update listings" on public.listings for update to authenticated
using (
  (select auth.uid()) = owner_id
  or (professional_profile_id is not null and public.is_professional_member(professional_profile_id))
  or public.is_admin()
)
with check (
  (select auth.uid()) = owner_id
  or (professional_profile_id is not null and public.is_professional_member(professional_profile_id))
  or public.is_admin()
);

drop policy if exists "listing views owner stats" on public.listing_views;
create policy "listing views owner broker stats" on public.listing_views for select to authenticated using (
  public.is_admin()
  or exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (
        l.owner_id = (select auth.uid())
        or (l.professional_profile_id is not null and public.is_professional_member(l.professional_profile_id))
      )
  )
);
