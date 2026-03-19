-- OJT Hours Tracker (MVP)
-- Run this in Supabase SQL Editor.

create table if not exists public.ojt_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_required_hours integer not null check (total_required_hours > 0),
  hours_per_day numeric not null default 8 check (hours_per_day > 0 and hours_per_day <= 24),
  selected_weekdays smallint[] not null default '{1,2,3,4,5}'::smallint[],
  start_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ojt_profiles_user_id_idx on public.ojt_profiles(user_id);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_path text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);

create table if not exists public.ojt_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  hours_worked numeric not null check (hours_worked > 0 and hours_worked <= 24),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists ojt_entries_user_id_date_idx on public.ojt_entries(user_id, entry_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ojt_profiles_updated_at on public.ojt_profiles;
create trigger trg_ojt_profiles_updated_at
before update on public.ojt_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_ojt_entries_updated_at on public.ojt_entries;
create trigger trg_ojt_entries_updated_at
before update on public.ojt_entries
for each row execute function public.set_updated_at();

alter table public.ojt_profiles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.ojt_entries enable row level security;

-- Grants (required so API roles can reach the table; RLS still enforces row access)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.ojt_profiles to anon, authenticated;
grant select, insert, update, delete on table public.user_profiles to anon, authenticated;
grant select, insert, update, delete on table public.ojt_entries to anon, authenticated;

drop policy if exists "ojt_profiles_select_own" on public.ojt_profiles;
create policy "ojt_profiles_select_own"
on public.ojt_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ojt_profiles_insert_own" on public.ojt_profiles;
create policy "ojt_profiles_insert_own"
on public.ojt_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "ojt_profiles_update_own" on public.ojt_profiles;
create policy "ojt_profiles_update_own"
on public.ojt_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ojt_entries_select_own" on public.ojt_entries;
create policy "ojt_entries_select_own"
on public.ojt_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ojt_entries_insert_own" on public.ojt_entries;
create policy "ojt_entries_insert_own"
on public.ojt_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "ojt_entries_update_own" on public.ojt_entries;
create policy "ojt_entries_update_own"
on public.ojt_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ojt_entries_delete_own" on public.ojt_entries;
create policy "ojt_entries_delete_own"
on public.ojt_entries
for delete
to authenticated
using (auth.uid() = user_id);

-- Storage bucket for avatars (public URL for simple MVP)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies: allow authenticated users to manage files in their own folder: <user_id>/...
drop policy if exists "avatars_select" on storage.objects;
create policy "avatars_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

