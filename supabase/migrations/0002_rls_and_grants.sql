-- =====================================================================
-- Uprawnienia i Row Level Security
--
-- Model dostepu jest prosty, bo biuro ma dwie osoby i zero kont klienckich:
--   anon          - niezalogowany gosc strony
--   authenticated - Beata albo Piotr po zalogowaniu do panelu = personel
--
-- Rejestracja w Supabase jest wylaczona recznie (Authentication > Sign In),
-- wiec "authenticated" nie moze stac sie nikt z ulicy.
-- =====================================================================

-- Projekt zalozono z odznaczonym "Automatically expose new tables",
-- wiec przywileje na tabelach nadajemy tutaj, jawnie.
--
-- service_role omija RLS, ale przywilejow tabelarycznych nie omija - bez
-- tych grantow skrypt importu i operacje serwerowe dostaja 42501.
grant usage on schema public to anon, authenticated, service_role;

grant all privileges on public.agents       to service_role;
grant all privileges on public.offers       to service_role;
grant all privileges on public.offer_photos to service_role;
grant all privileges on public.inquiries    to service_role;

alter table public.agents       enable row level security;
alter table public.offers       enable row level security;
alter table public.offer_photos enable row level security;
alter table public.inquiries    enable row level security;

-- ---------------------------------------------------------------------
-- Ktore statusy sa widoczne publicznie
-- ---------------------------------------------------------------------
create or replace function public.is_public_status(s offer_status)
returns boolean
language sql
immutable
set search_path = ''
as $$ select s in ('published', 'reserved') $$;

-- ---------------------------------------------------------------------
-- agents
-- ---------------------------------------------------------------------
grant select on public.agents to anon, authenticated;
grant insert, update, delete on public.agents to authenticated;

drop policy if exists "agenci widoczni publicznie" on public.agents;
create policy "agenci widoczni publicznie"
  on public.agents for select
  to anon, authenticated
  using (true);

drop policy if exists "personel zarzadza agentami" on public.agents;
create policy "personel zarzadza agentami"
  on public.agents for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------
grant select on public.offers to anon, authenticated;
grant insert, update, delete on public.offers to authenticated;

drop policy if exists "opublikowane oferty widoczne publicznie" on public.offers;
create policy "opublikowane oferty widoczne publicznie"
  on public.offers for select
  to anon
  using (public.is_public_status(status));

-- personel widzi rowniez szkice - inaczej podglad przed publikacja nie ma sensu
drop policy if exists "personel zarzadza ofertami" on public.offers;
create policy "personel zarzadza ofertami"
  on public.offers for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- offer_photos - widocznosc dziedziczona po ofercie
-- ---------------------------------------------------------------------
grant select on public.offer_photos to anon, authenticated;
grant insert, update, delete on public.offer_photos to authenticated;

drop policy if exists "zdjecia opublikowanych ofert" on public.offer_photos;
create policy "zdjecia opublikowanych ofert"
  on public.offer_photos for select
  to anon
  using (
    exists (
      select 1 from public.offers o
      where o.id = offer_photos.offer_id
        and public.is_public_status(o.status)
    )
  );

drop policy if exists "personel zarzadza zdjeciami" on public.offer_photos;
create policy "personel zarzadza zdjeciami"
  on public.offer_photos for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- inquiries - kazdy moze wyslac, czyta wylacznie personel
-- ---------------------------------------------------------------------
grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

drop policy if exists "kazdy moze wyslac zapytanie" on public.inquiries;
create policy "kazdy moze wyslac zapytanie"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

-- brak polityki SELECT dla anon = nikt z zewnatrz nie odczyta cudzych zapytan,
-- nawet znajac identyfikator
drop policy if exists "personel czyta zapytania" on public.inquiries;
create policy "personel czyta zapytania"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "personel oznacza zapytania" on public.inquiries;
create policy "personel oznacza zapytania"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "personel usuwa zapytania" on public.inquiries;
create policy "personel usuwa zapytania"
  on public.inquiries for delete
  to authenticated
  using (true);
