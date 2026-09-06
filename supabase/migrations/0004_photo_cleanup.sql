-- =====================================================================
-- Sprzatanie zdjec na poziomie bazy
--
-- Panel kasuje pliki ze Storage sam, ale tylko wtedy, gdy sie go uzyje.
-- Ten wyzwalacz dziala niezaleznie od drogi: kasowanie oferty, kasowanie
-- pojedynczego zdjecia, kasowanie wiersza recznie w panelu Supabase.
-- Dzieki temu zdjecia nie moga zostac w pamieci po usunietej ofercie.
-- =====================================================================

create or replace function public.remove_orphaned_photo_object()
returns trigger
language plpgsql
security definer          -- musi siegnac do schematu storage
set search_path = ''
as $$
begin
  delete from storage.objects
   where bucket_id = 'offer-photos'
     and name = old.storage_path;
  return old;
end $$;

drop trigger if exists offer_photos_remove_object on public.offer_photos;
create trigger offer_photos_remove_object
  after delete on public.offer_photos
  for each row execute function public.remove_orphaned_photo_object();

-- Kaskada z offers na offer_photos juz istnieje (0001), wiec usuniecie oferty
-- pociaga wiersze zdjec, a te - dzieki powyzszemu - pociagaja pliki.
