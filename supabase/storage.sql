-- ManuGrafias - Supabase Storage for the MVP 2 content panel.
-- Applied as migrations `media_storage_bucket`, `media_admin_check_audience` and
-- `media_bucket_allow_target_images` (Supabase MCP).
-- Safe to run again in the SQL Editor.
--
-- Bucket `media`: public read (the AR experience downloads targets.mind and videos without a session),
-- writes only by the panel administrator, identified by a Firebase ID token (Supabase third-party auth)
-- that carries the custom claims { role: 'authenticated', admin: true }.
-- Paths written by the content panel (manugrafias_admin):
--        photographers/<slug>/artworks/<artworkId>/target-<time>.jpg|png   (source image, for recompiling)
--        photographers/<slug>/artworks/<artworkId>/video-<time>.mp4
--        photographers/<slug>/published/v<version>/targets.mind

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800, -- 50 MB, the free plan maximum (the panel enforces the lower SRS section 5 limits)
  array['video/mp4', 'application/octet-stream', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Only the administrator can upload, replace and delete. Nobody else can write.
-- The administrator check: a Firebase ID token from project manugrafias-2026 (issuer + audience) with admin: true.
-- The issuer check also blocks Supabase Auth users, whose tokens have another issuer.
create or replace function public.is_media_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'iss', '') = 'https://securetoken.google.com/manugrafias-2026'
     and coalesce(auth.jwt() ->> 'aud', '') = 'manugrafias-2026'
     and coalesce((auth.jwt() ->> 'admin')::boolean, false);
$$;

drop policy if exists "media: admin insert" on storage.objects;
drop policy if exists "media: admin update" on storage.objects;
drop policy if exists "media: admin delete" on storage.objects;
drop policy if exists "media: admin select" on storage.objects;

create policy "media: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_media_admin()));

create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_media_admin()))
  with check (bucket_id = 'media' and (select public.is_media_admin()));

create policy "media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_media_admin()));

-- Lets the panel list and overwrite (upsert) objects. Public downloads do not need it (public bucket).
create policy "media: admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_media_admin()));
