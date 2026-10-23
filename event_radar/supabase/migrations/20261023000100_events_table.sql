-- Stage 4: event storage and public read-only access.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default ''
    check (status in ('published', 'waiting', 'rejected', 'archived')),
  status_reason text not null default '',
  announcement text not null default ''
    check (char_length(announcement) between 1 and 2000),
  title text not null default '',
  club text not null default '',
  event_date date,
  start_time time,
  end_time time,
  place_code text not null default '',
  place_name text not null default '',
  place_detail text not null default '',
  cost text not null default '',
  free_food boolean not null default false,
  summary text not null default '',
  rule_flags text[] not null default '{}',
  note_for_moderator text not null default '',
  dedupe_key text not null default '',
  ai_model text not null default '',
  reviewed_at timestamptz,
  reviewed_by text not null default ''
);

create unique index events_active_dedupe_key_idx
  on public.events (dedupe_key)
  where dedupe_key is not null and status in ('published', 'waiting');

alter table public.events enable row level security;

create policy events_read_published
  on public.events for select
  to anon, authenticated
  using (status = 'published');

-- Remove any broad privileges inherited from project defaults first.
revoke all privileges on table public.events from public, anon, authenticated;

grant select (
  id, created_at, status, title, club, event_date, start_time, end_time,
  place_name, place_detail, cost, free_food, summary
) on public.events to anon, authenticated;

grant select, insert, update, delete on public.events to service_role;
