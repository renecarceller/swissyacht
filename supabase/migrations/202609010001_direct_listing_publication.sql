-- Allow authenticated users to publish their own listings directly from the web.
-- This keeps ownership checks intact: users can only create listings for themselves,
-- or for a professional profile they belong to.

grant select, insert, update on public.listings to authenticated;
grant select, insert on public.brands to authenticated;
grant select, insert on public.models to authenticated;
grant select, insert on public.cities to authenticated;
grant select, insert on public.marinas to authenticated;

drop policy if exists "owners create listings" on public.listings;
drop policy if exists "owners and professional members create listings" on public.listings;
drop policy if exists "signed in users create own listings directly" on public.listings;

create policy "signed in users create own listings directly"
on public.listings
for insert
to authenticated
with check (
  (
    (select auth.uid()) = owner_id
    or coalesce(public.is_professional_member(professional_profile_id), false)
  )
  and status in ('draft', 'pending_review', 'published')
);

drop policy if exists "authenticated create brands" on public.brands;
create policy "authenticated create brands"
on public.brands
for insert
to authenticated
with check (true);

drop policy if exists "authenticated create models" on public.models;
create policy "authenticated create models"
on public.models
for insert
to authenticated
with check (true);

drop policy if exists "authenticated create cities" on public.cities;
create policy "authenticated create cities"
on public.cities
for insert
to authenticated
with check (true);

drop policy if exists "authenticated create marinas" on public.marinas;
create policy "authenticated create marinas"
on public.marinas
for insert
to authenticated
with check (true);
