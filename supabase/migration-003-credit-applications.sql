-- Online pre-approval applications. SSN and driver's license are stored only as
-- AES-256-GCM ciphertext (`sensitive_enc`), encrypted by the app before insert.
create table if not exists credit_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  applicant jsonb not null,
  sensitive_enc text not null,
  status text not null default 'new'
);

alter table credit_applications enable row level security;

drop policy if exists "public insert credit applications" on credit_applications;
create policy "public insert credit applications" on credit_applications
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "admin all credit applications" on credit_applications;
create policy "admin all credit applications" on credit_applications
  for all to authenticated using (is_admin()) with check (is_admin());
