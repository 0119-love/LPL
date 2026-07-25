-- Verdict: user-defined price alert conditions, evaluated client-side
-- against live quotes (no background scheduler in this stage).

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  condition text not null check (condition in ('price_above', 'price_below')),
  threshold numeric not null,
  created_at timestamptz not null default now()
);

alter table public.alert_rules enable row level security;

create policy "Users manage their own alert rules"
  on public.alert_rules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
