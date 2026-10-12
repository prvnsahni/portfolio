-- Link-in-bio schema: profiles, profile_items, username_history.
-- Run this in the Supabase SQL editor (see SETUP.md). Safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique,
  display_name  text,
  bio           text,
  avatar_url    text,
  theme         text not null default 'dark',
  phone         text,
  email         text,
  whatsapp      text,
  socials       jsonb not null default '{}'::jsonb,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Username rule: lowercase, 3-30 chars, only a-z 0-9 _ - (NULL until claimed).
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_-]{3,30}$');

create table if not exists public.profile_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('link', 'field')),
  label       text,
  value       text,
  type        text not null default 'text' check (type in ('text', 'link', 'phone', 'email')),
  position    integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists profile_items_user_position_idx
  on public.profile_items (user_id, position);

create table if not exists public.username_history (
  old_username text primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  changed_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at fresh; create a profile row for every new user.
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Username availability check (bypasses RLS so it can see unpublished rows and
-- retired usernames). Returns true only if the name is free everywhere.
-- ---------------------------------------------------------------------------

create or replace function public.username_available(name text)
returns boolean language sql security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where username = lower(name))
     and not exists (select 1 from public.username_history where old_username = lower(name));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profile_items enable row level security;
alter table public.username_history enable row level security;

-- profiles: anyone reads published; owner reads/writes own.
drop policy if exists profiles_read_published on public.profiles;
create policy profiles_read_published on public.profiles
  for select using (is_published = true);

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete using (auth.uid() = id);

-- items: anyone reads visible items of published profiles; owner reads/writes own.
drop policy if exists items_read_public on public.profile_items;
create policy items_read_public on public.profile_items
  for select using (
    is_visible = true
    and exists (
      select 1 from public.profiles p
      where p.id = profile_items.user_id and p.is_published = true
    )
  );

drop policy if exists items_read_own on public.profile_items;
create policy items_read_own on public.profile_items
  for select using (auth.uid() = user_id);

drop policy if exists items_insert_own on public.profile_items;
create policy items_insert_own on public.profile_items
  for insert with check (auth.uid() = user_id);

drop policy if exists items_update_own on public.profile_items;
create policy items_update_own on public.profile_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists items_delete_own on public.profile_items;
create policy items_delete_own on public.profile_items
  for delete using (auth.uid() = user_id);

-- username_history: public read (needed to resolve old-link redirects); owner writes own.
drop policy if exists history_read_all on public.username_history;
create policy history_read_all on public.username_history
  for select using (true);

drop policy if exists history_insert_own on public.username_history;
create policy history_insert_own on public.username_history
  for insert with check (auth.uid() = user_id);

drop policy if exists history_delete_own on public.username_history;
create policy history_delete_own on public.username_history
  for delete using (auth.uid() = user_id);
