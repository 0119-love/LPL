-- Verdict: core schema for user profiles, the 5-member committee, assets, and votes.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- The 5 fixed committee members.
create table if not exists public.committee_members (
  id text primary key,
  name text not null,
  initial text not null
);

alter table public.committee_members enable row level security;

create policy "Committee members are public"
  on public.committee_members for select
  using (true);

insert into public.committee_members (id, name, initial) values
  ('m1', 'Kang', 'K'),
  ('m2', 'Lee', 'L'),
  ('m3', 'Park', 'P'),
  ('m4', 'Sofia', 'S'),
  ('m5', 'Devon', 'D')
on conflict (id) do nothing;

-- Tracked assets.
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.assets enable row level security;

create policy "Assets are public"
  on public.assets for select
  using (true);

-- One verdict per (member, asset); rationale is the reasoning behind the call.
create table if not exists public.committee_votes (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.committee_members (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  verdict text not null check (verdict in ('buy', 'no_buy')),
  rationale text,
  created_at timestamptz not null default now(),
  unique (member_id, asset_id)
);

alter table public.committee_votes enable row level security;

create policy "Committee votes are public"
  on public.committee_votes for select
  using (true);
