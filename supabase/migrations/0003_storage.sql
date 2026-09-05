-- =====================================================================
-- Storage: zdjecia ofert
-- =====================================================================

-- Bucket publiczny do odczytu - zdjecia i tak maja byc widoczne na stronie,
-- a publiczny odczyt pozwala serwowac je przez CDN bez podpisywania URL-i.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offer-photos',
  'offer-photos',
  true,
  10485760, -- 10 MB; panel i tak kompresuje zdjecia przed wyslaniem
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "zdjecia ofert do odczytu publicznie" on storage.objects;
create policy "zdjecia ofert do odczytu publicznie"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'offer-photos');

drop policy if exists "personel wgrywa zdjecia ofert" on storage.objects;
create policy "personel wgrywa zdjecia ofert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'offer-photos');

drop policy if exists "personel podmienia zdjecia ofert" on storage.objects;
create policy "personel podmienia zdjecia ofert"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'offer-photos')
  with check (bucket_id = 'offer-photos');

drop policy if exists "personel usuwa zdjecia ofert" on storage.objects;
create policy "personel usuwa zdjecia ofert"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'offer-photos');
