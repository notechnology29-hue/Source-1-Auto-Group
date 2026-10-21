-- Run once in the Supabase SQL editor (after schema.sql).
-- Adds dealership-style listing fields and lets the homepage contact form write to `leads`.

alter table vehicles
  add column if not exists body_style     text,
  add column if not exists transmission   text,
  add column if not exists fuel_type      text,
  add column if not exists mpg_city       int,
  add column if not exists mpg_highway    int,
  add column if not exists interior_color text,
  add column if not exists description    text,
  add column if not exists starting_price int,
  add column if not exists location       text,
  add column if not exists carfax_url     text;

-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction as its first use,
-- so run this statement on its own if your editor wraps the script in a transaction.
alter type inquiry_type add value if not exists 'contact';

alter table leads
  alter column vehicle_id drop not null,
  alter column customer_phone drop not null,
  add column if not exists message text check (message is null or char_length(message) <= 2000);

alter table leads drop constraint if exists leads_customer_phone_check;
alter table leads add constraint leads_customer_phone_check
  check (customer_phone is null or char_length(customer_phone) between 7 and 20);

-- General (vehicle-less) contact-form leads.
drop policy if exists "public insert contact leads" on leads;
create policy "public insert contact leads" on leads
  for insert to anon, authenticated
  with check (status = 'new' and vehicle_id is null and inquiry_type = 'contact');
