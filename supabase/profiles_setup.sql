-- Run this in Supabase Dashboard → SQL Editor
-- Profile row is created by this trigger (not by the browser).
-- Browser insert fails when email confirm is on, because there is no session.

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists role text;

alter table public.profiles
  add column if not exists created_at timestamptz default now();

alter table public.profiles enable row level security;
alter table public.profiles no force row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end;
$$;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    new.email
  )
  on conflict (id) do update
    set role = coalesce(excluded.role, public.profiles.role),
        email = coalesce(excluded.email, public.profiles.email);

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

grant usage on schema public to anon, authenticated, supabase_auth_admin;
grant select, insert, update on table public.profiles to authenticated, supabase_auth_admin;
