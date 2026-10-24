-- Stage 7: flyer links are readable under the existing events RLS policy.
alter table public.events add column if not exists flyer_url text not null default '';
grant select (flyer_url) on public.events to anon, authenticated;

-- Public downloads; no browser upload, update, or delete policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
