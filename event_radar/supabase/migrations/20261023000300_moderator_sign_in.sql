-- Stage 8: all provisioned accounts are moderators; keep new sign-ups disabled.
create policy events_moderator_read
  on public.events for select to authenticated
  using (true);

create policy events_moderator_update
  on public.events for update to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected'));

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by)
  on public.events to authenticated;
