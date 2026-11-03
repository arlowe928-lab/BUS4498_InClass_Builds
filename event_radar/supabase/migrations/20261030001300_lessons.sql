-- Stage 13: only provisioned, signed-in moderators teach the agent.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson text not null check (char_length(lesson) between 5 and 300),
  active boolean not null default true,
  created_by text not null default '',
  from_post uuid
);
alter table public.lessons enable row level security;
revoke all on public.lessons from anon, authenticated;
grant select on public.lessons to authenticated;
grant insert (lesson, created_by, from_post) on public.lessons to authenticated;
grant update (active) on public.lessons to authenticated;
grant all on public.lessons to service_role;
create policy lessons_moderator_read on public.lessons
  for select to authenticated using (true);
create policy lessons_moderator_insert on public.lessons
  for insert to authenticated with check (true);
create policy lessons_moderator_update on public.lessons
  for update to authenticated using (true) with check (true);
alter table public.events
  add column lessons_used text[] not null default '{}';
-- No anonymous grants and no new public event columns. Sign-ups stay disabled:
-- all provisioned authenticated accounts are moderators in this project.
