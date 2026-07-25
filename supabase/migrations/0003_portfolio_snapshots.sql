-- Verdict: daily total-portfolio-value snapshots, for the asset value trend chart.
-- One row per user per day; the app upserts today's row each time it computes
-- the current total, so history builds up naturally as the product is used.

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  snapshot_date date not null default current_date,
  total_value numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

alter table public.portfolio_snapshots enable row level security;

create policy "Users manage their own snapshots"
  on public.portfolio_snapshots for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
