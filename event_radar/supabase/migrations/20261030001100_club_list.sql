-- Stage 11. Run this whole file in Supabase SQL Editor before deploying the agent.
begin;
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);
alter table public.clubs enable row level security;
revoke all on public.clubs from public, anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;
drop policy if exists clubs_active_read on public.clubs;
create policy clubs_active_read on public.clubs for select to anon, authenticated using (active);

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail) values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220'),
  ('Mustang Pitch Society', 'MPS, pitch club', 'UU-PLAZA', ''),
  ('Women in Finance Circle', 'WIF, women in finance', 'BUSINESS', ''),
  ('Sustainability Crew', 'sustainability club, green crew', 'DEXTER-LAWN', ''),
  ('Accounting Society', 'accounting club', 'BUSINESS', 'Room 212'),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club, ski and snowboard club', '', '')
on conflict (name) do nothing;

alter table public.events add column if not exists agent_notes text[] not null default '{}';
-- Stage 8 provisions every signed-in account as a moderator; keep sign-ups off.
drop policy if exists events_moderator_delete on public.events;
create policy events_moderator_delete on public.events for delete to authenticated using (true);
grant delete on public.events to authenticated;
grant select (agent_notes) on public.events to authenticated;
commit;
