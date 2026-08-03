alter table public.listings
  add column if not exists listing_kind text not null default 'Bateau',
  add column if not exists displacement_cc integer,
  add column if not exists seats integer,
  add column if not exists postal_code text,
  add column if not exists video_url text;

alter table public.listings
  drop constraint if exists listings_listing_kind_check,
  add constraint listings_listing_kind_check check (listing_kind in ('Bateau', 'Jet-ski'));

alter table public.listings
  drop constraint if exists listings_displacement_cc_check,
  add constraint listings_displacement_cc_check check (displacement_cc is null or displacement_cc >= 0),
  drop constraint if exists listings_seats_check,
  add constraint listings_seats_check check (seats is null or seats between 0 and 8);

alter table public.listings
  alter column length_m drop not null,
  alter column beam_m drop not null;

alter table public.listings
  drop constraint if exists listings_length_m_check,
  add constraint listings_length_m_check check (length_m is null or length_m >= 0),
  drop constraint if exists listings_beam_m_check,
  add constraint listings_beam_m_check check (beam_m is null or beam_m >= 0);

update public.listings
set listing_kind = 'Bateau'
where listing_kind is null;

insert into public.categories (slug, name_fr, name_de, name_it, name_en, sort_order)
values ('jet-skis', 'Motos nautiques', 'Jetskis', 'Moto d''acqua', 'Jet skis', 95)
on conflict (slug) do update
set name_fr = excluded.name_fr,
    name_de = excluded.name_de,
    name_it = excluded.name_it,
    name_en = excluded.name_en,
    sort_order = excluded.sort_order;

create index if not exists listings_listing_kind_idx
  on public.listings (listing_kind);

create index if not exists listings_jet_ski_filters_idx
  on public.listings (listing_kind, year, price_chf, power_hp, engine_hours, seats);
