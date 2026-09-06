alter table public.listings
  add column if not exists canton_name text,
  add column if not exists lake_name text,
  add column if not exists city_name text,
  add column if not exists marina_name text;
