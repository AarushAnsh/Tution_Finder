-- Run in Supabase SQL Editor so listings, requests, and assignments stay in sync.

create table if not exists public.parent_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  parent_name text,
  email text,
  phone text,
  child_class text,
  subject text,
  location text,
  teaching_mode text,
  budget text,
  preferred_time text,
  concern text,
  status text default 'Open',
  assigned_teacher_id text,
  assigned_teacher_name text,
  assigned_teacher_email text,
  assigned_teacher_phone text,
  assigned_teacher_subject text,
  created_at timestamptz default now()
);

create table if not exists public.teacher_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text,
  phone text,
  email text,
  subject text,
  classes text,
  experience text,
  location text,
  teaching_mode text,
  available_time text,
  expected_fee text,
  qualification text,
  about text,
  status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.parent_requests (id) on delete cascade,
  teacher_id text,
  teacher_name text,
  teacher_email text,
  parent_email text,
  subject text,
  created_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  topic text,
  message text,
  created_at timestamptz default now()
);

alter table public.parent_requests enable row level security;
alter table public.teacher_listings enable row level security;
alter table public.assignments enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "parent_requests_auth" on public.parent_requests;
create policy "parent_requests_auth"
  on public.parent_requests for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "teacher_listings_read" on public.teacher_listings;
create policy "teacher_listings_read"
  on public.teacher_listings for select
  to anon, authenticated
  using (true);

drop policy if exists "teacher_listings_write" on public.teacher_listings;
create policy "teacher_listings_write"
  on public.teacher_listings for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "assignments_auth" on public.assignments;
create policy "assignments_auth"
  on public.assignments for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_read_auth" on public.contact_messages;
create policy "contact_read_auth"
  on public.contact_messages for select
  to authenticated
  using (true);

grant select, insert, update, delete on public.parent_requests to authenticated;
grant select on public.teacher_listings to anon, authenticated;
grant insert, update, delete on public.teacher_listings to authenticated;
grant select, insert, update, delete on public.assignments to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
