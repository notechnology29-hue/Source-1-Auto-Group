-- Source 1 Auto Group — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ───────────── Enums ─────────────
create type vehicle_status    as enum ('available', 'pending', 'sold');
create type vehicle_condition as enum ('excellent', 'good', 'fair');
create type media_type        as enum ('image', 'video');
create type hotspot_severity  as enum ('cosmetic', 'upgrade', 'repaired');
create type inquiry_type      as enum ('hold_ride', 'test_drive');
create type lead_status       as enum ('new', 'contacted');

-- ───────────── Helpers ─────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Admin = authenticated user whose JWT app_metadata.role is 'admin'.
-- Grant with: update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '...';
create or replace function is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- ───────────── Tables ─────────────
create table vehicles (
  id             uuid primary key default gen_random_uuid(),
  stock_number   text not null unique,
  vin            text not null unique check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  year           smallint not null check (year between 1980 and 2100),
  make           text not null,
  model          text not null,
  trim           text,
  condition      vehicle_condition not null default 'good',
  status         vehicle_status not null default 'available',
  price          numeric(10,2) not null check (price >= 0),
  mileage        integer not null check (mileage >= 0),
  exterior_color text,
  drivetrain     text,
  engine         text,
  features       jsonb not null default '[]'::jsonb,
  clean_carfax   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index vehicles_status_idx on vehicles (status);
create index vehicles_price_idx  on vehicles (price);
create index vehicles_search_idx on vehicles (make, model);
create trigger vehicles_updated_at before update on vehicles
  for each row execute function set_updated_at();

create table vehicle_media (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references vehicles(id) on delete cascade,
  url         text not null,
  is_primary  boolean not null default false,
  media_type  media_type not null default 'image',
  created_at  timestamptz not null default now()
);
create index vehicle_media_vehicle_idx on vehicle_media (vehicle_id);
-- At most one primary media per vehicle
create unique index vehicle_media_one_primary on vehicle_media (vehicle_id) where is_primary;

create table transparency_hotspots (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   uuid not null references vehicles(id) on delete cascade,
  media_id     uuid not null references vehicle_media(id) on delete cascade,
  x_coordinate numeric(5,2) not null check (x_coordinate between 0 and 100),
  y_coordinate numeric(5,2) not null check (y_coordinate between 0 and 100),
  title        text not null,
  description  text not null default '',
  severity     hotspot_severity not null default 'cosmetic',
  created_at   timestamptz not null default now()
);
create index hotspots_vehicle_idx on transparency_hotspots (vehicle_id);
create index hotspots_media_idx   on transparency_hotspots (media_id);

create table leads (
  id             uuid primary key default gen_random_uuid(),
  vehicle_id     uuid not null references vehicles(id) on delete cascade,
  customer_name  text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  customer_phone text not null check (char_length(customer_phone) between 7 and 20),
  inquiry_type   inquiry_type not null,
  status         lead_status not null default 'new',
  created_at     timestamptz not null default now()
);
create index leads_vehicle_idx on leads (vehicle_id);
create index leads_status_idx  on leads (status, created_at desc);

-- ───────────── Row Level Security ─────────────
alter table vehicles              enable row level security;
alter table vehicle_media         enable row level security;
alter table transparency_hotspots enable row level security;
alter table leads                 enable row level security;

-- Public read: non-sold vehicles, plus their media/hotspots.
create policy "public read active vehicles" on vehicles
  for select to anon, authenticated
  using (status in ('available', 'pending'));

create policy "public read media of active vehicles" on vehicle_media
  for select to anon, authenticated
  using (exists (select 1 from vehicles v
                 where v.id = vehicle_media.vehicle_id and v.status in ('available', 'pending')));

create policy "public read hotspots of active vehicles" on transparency_hotspots
  for select to anon, authenticated
  using (exists (select 1 from vehicles v
                 where v.id = transparency_hotspots.vehicle_id and v.status in ('available', 'pending')));

-- Public insert on leads only (never read); must start as 'new' and target an available vehicle.
create policy "public insert leads" on leads
  for insert to anon, authenticated
  with check (status = 'new'
              and exists (select 1 from vehicles v
                          where v.id = leads.vehicle_id and v.status = 'available'));

-- Admin: full CRUD on everything.
create policy "admin all vehicles" on vehicles
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all media" on vehicle_media
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all hotspots" on transparency_hotspots
  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all leads" on leads
  for all to authenticated using (is_admin()) with check (is_admin());
