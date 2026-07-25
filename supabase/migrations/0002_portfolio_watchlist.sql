-- Verdict: per-user watchlist, holdings, and transaction history.
-- Unlike committee_votes (curated content), these rows are owned by the
-- signed-in user and scoped with RLS on auth.uid().

alter table public.assets
  add column if not exists exchange text;

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, asset_id)
);

alter table public.watchlist enable row level security;

create policy "Users manage their own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  quantity numeric not null check (quantity >= 0),
  avg_cost numeric not null check (avg_cost >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, asset_id)
);

alter table public.portfolio_holdings enable row level security;

create policy "Users manage their own holdings"
  on public.portfolio_holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null check (quantity > 0),
  price numeric not null check (price >= 0),
  executed_at timestamptz not null default now()
);

alter table public.portfolio_transactions enable row level security;

create policy "Users manage their own transactions"
  on public.portfolio_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
