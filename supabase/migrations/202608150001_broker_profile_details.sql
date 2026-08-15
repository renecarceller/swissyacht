create table if not exists public.broker_specialties (
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  specialty_code text not null,
  created_at timestamptz not null default now(),
  primary key (professional_profile_id, specialty_code)
);

create table if not exists public.broker_represented_brands (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  brand_name text not null,
  created_at timestamptz not null default now(),
  unique (professional_profile_id, brand_name)
);

create index if not exists broker_specialties_profile_idx on public.broker_specialties(professional_profile_id);
create index if not exists broker_represented_brands_profile_idx on public.broker_represented_brands(professional_profile_id);

alter table public.broker_specialties enable row level security;
alter table public.broker_represented_brands enable row level security;

grant select on public.broker_specialties, public.broker_represented_brands to anon, authenticated;
grant select, insert, update, delete on public.broker_specialties, public.broker_represented_brands to authenticated;

create policy "broker specialties public read" on public.broker_specialties for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
);

create policy "broker specialties member manage" on public.broker_specialties for all to authenticated
using (public.is_professional_member(professional_profile_id) or public.is_admin())
with check (public.is_professional_member(professional_profile_id) or public.is_admin());

create policy "broker represented brands public read" on public.broker_represented_brands for select to anon, authenticated
using (
  exists (
    select 1 from public.professional_profiles pp
    where pp.id = professional_profile_id and pp.deleted_at is null and pp.published_at is not null and pp.suspended_at is null
  )
);

create policy "broker represented brands member manage" on public.broker_represented_brands for all to authenticated
using (public.is_professional_member(professional_profile_id) or public.is_admin())
with check (public.is_professional_member(professional_profile_id) or public.is_admin());
