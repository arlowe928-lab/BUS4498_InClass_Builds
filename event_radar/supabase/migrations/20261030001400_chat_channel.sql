-- Stage 14: apply once in Supabase SQL Editor before deploying both functions.
begin;
alter table public.events
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';
create unique index if not exists events_one_per_message
  on public.events (source, source_id) where source_id <> '';

create table if not exists public.channel_cursor (
  source text primary key,
  last_id text,
  read_count bigint not null default 0,
  updated_at timestamptz not null default now(),
  -- A short lease prevents Cron and callback runs from overlapping.
  lease_id uuid,
  lease_until timestamptz not null default '-infinity'
);
alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from public, anon, authenticated;
grant select, insert, update, delete on public.channel_cursor to service_role;

create extension if not exists pg_cron;
create extension if not exists pg_net;
-- A named schedule is updated, rather than duplicated, if this SQL is rerun.
select cron.schedule('read-chat-channel', '* * * * *', $job$
  select net.http_post(
    url := 'https://sybducqavyxvbqnimrbk.supabase.co/functions/v1/read-channel',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable_qrNQZhwYT7-pekei7-GBAQ_XBouitbI"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 150000
  );
$job$);
commit;
