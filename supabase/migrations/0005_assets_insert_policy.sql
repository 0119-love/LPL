-- Verdict: `assets` had RLS enabled with only a SELECT policy, so any
-- client-side upsert (adding a new ticker via search) was silently denied.
-- Grant INSERT to signed-in users. No UPDATE policy — assets.name is
-- first-writer-wins, so one user can't overwrite what another user set.
create policy "Authenticated users can add new assets"
  on public.assets for insert
  with check (auth.role() = 'authenticated');
