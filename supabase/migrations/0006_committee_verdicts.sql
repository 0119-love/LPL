-- Verdict: AI-generated committee verdicts, replacing the hand-authored
-- mock data. Append-only (no update/delete) so every generation batch is
-- preserved as history for the accuracy/timeline features — the "current"
-- verdict for a member+asset is just the row with the latest generated_at.

create table if not exists public.committee_verdicts (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.committee_members (id) on delete cascade,
  asset_id uuid not null references public.assets (id) on delete cascade,
  verdict text not null check (verdict in ('buy', 'no_buy')),
  rationale text not null,
  detail text not null,
  related_metric text not null,
  generated_at timestamptz not null default now()
);

create index if not exists committee_verdicts_asset_idx
  on public.committee_verdicts (asset_id, generated_at desc);

alter table public.committee_verdicts enable row level security;

create policy "Committee verdicts are public"
  on public.committee_verdicts for select
  using (true);

-- Generation is triggered by a signed-in user's browser session hitting
-- /api/committee/generate, which inserts under that user's own auth context.
create policy "Authenticated users can add committee verdicts"
  on public.committee_verdicts for insert
  with check (auth.role() = 'authenticated');
