-- Stage 12: updates can retire an earlier post without deleting its history.
alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));
alter table public.events add column if not exists replaced_by uuid;
alter table public.events add column if not exists updates_id uuid;

drop policy if exists events_moderator_update on public.events;
create policy events_moderator_update on public.events
  for update to authenticated using (true)
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));
-- Existing column grants stay unchanged: moderators may change status and
-- review metadata, not replacement links or event content. The agent writes links.
-- The existing unique live-event index is intentionally unchanged.
