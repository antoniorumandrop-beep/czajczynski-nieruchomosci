-- =====================================================================
-- Czajczynski Nieruchomosci - schemat poczatkowy
--
-- Zaloz nowy projekt w Supabase, otworz SQL Editor i wklej caly ten plik.
-- Skrypt mozna uruchomic ponownie - wszystko jest idempotentne.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Typy wyliczeniowe
-- ---------------------------------------------------------------------
do $$ begin
  create type property_type as enum ('apartment', 'house', 'plot', 'commercial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('sale', 'rent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type market_type as enum ('primary', 'secondary');
exception when duplicate_object then null; end $$;

do $$ begin
  create type offer_status as enum ('draft', 'published', 'reserved', 'sold', 'archived');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Agenci
-- ---------------------------------------------------------------------
create table if not exists public.agents (
  id          uuid primary key default gen_random_uuid(),
  -- powiazanie z kontem logowania; null oznacza agenta bez dostepu do panelu
  user_id     uuid unique references auth.users (id) on delete set null,
  slug        text not null unique,
  full_name   text not null,
  role        text not null,
  licence     text,
  phone       text,
  email       text,
  photo_path  text,
  bio         text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Oferty
-- ---------------------------------------------------------------------
create table if not exists public.offers (
  id               uuid primary key default gen_random_uuid(),
  offer_number     text not null unique,
  slug             text not null unique,
  title            text not null,

  property_type    property_type    not null,
  transaction_type transaction_type not null,
  market           market_type,
  status           offer_status     not null default 'draft',
  is_exclusive     boolean          not null default false,

  price            numeric(12, 2) not null check (price >= 0),
  area             numeric(10, 2) check (area > 0),
  -- cena za metr jest wyliczana przez baze, nigdy wpisywana recznie:
  -- jedno pole mniej do pomylenia w panelu i zero rozjazdow z cena
  price_per_m2     numeric(12, 2)
                   generated always as (
                     case when area is not null and area > 0
                          then round(price / area, 2) end
                   ) stored,

  rooms            int check (rooms > 0),
  floor            int,
  total_floors     int check (total_floors > 0),

  city             text not null,
  district         text,
  address_line     text,

  description      text not null default '',
  -- dodatkowe parametry (rok budowy, ogrzewanie, winda...) jako lista
  -- obiektow {label, value} - nie chcemy kolumny na kazdy z 30 atrybutow
  attributes       jsonb not null default '[]'::jsonb,

  agent_id         uuid references public.agents (id) on delete set null,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz,

  constraint offers_attributes_is_array check (jsonb_typeof(attributes) = 'array'),
  -- dzialka nie ma pokoi ani pieter
  constraint offers_plot_has_no_rooms check (property_type <> 'plot' or rooms is null),
  constraint offers_plot_has_no_floor check (property_type <> 'plot' or floor is null)
);

create index if not exists offers_status_idx      on public.offers (status);
create index if not exists offers_type_idx        on public.offers (property_type, transaction_type);
create index if not exists offers_city_idx        on public.offers (city, district);
create index if not exists offers_price_idx       on public.offers (price);
create index if not exists offers_created_at_idx  on public.offers (created_at desc);
create index if not exists offers_agent_idx       on public.offers (agent_id);

-- ---------------------------------------------------------------------
-- Zdjecia ofert
-- ---------------------------------------------------------------------
create table if not exists public.offer_photos (
  id           uuid primary key default gen_random_uuid(),
  offer_id     uuid not null references public.offers (id) on delete cascade,
  -- sciezka w buckecie storage, np. "CZN-MS-1238/01.jpg"
  storage_path text not null,
  -- osobny opis pod kazdym zdjeciem - wymog wlascicieli
  caption      text,
  sort_order   int  not null default 0,
  width        int,
  height       int,
  created_at   timestamptz not null default now(),

  unique (offer_id, storage_path)
);

create index if not exists offer_photos_offer_idx on public.offer_photos (offer_id, sort_order);

-- ---------------------------------------------------------------------
-- Zapytania z formularza
-- ---------------------------------------------------------------------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  offer_id     uuid references public.offers (id) on delete set null,
  offer_number text,
  name         text not null,
  contact      text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_unread_idx     on public.inquiries (is_read) where is_read = false;

-- ---------------------------------------------------------------------
-- updated_at utrzymywane przez baze, nie przez aplikacje
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists agents_touch_updated_at on public.agents;
create trigger agents_touch_updated_at
  before update on public.agents
  for each row execute function public.touch_updated_at();

drop trigger if exists offers_touch_updated_at on public.offers;
create trigger offers_touch_updated_at
  before update on public.offers
  for each row execute function public.touch_updated_at();

-- published_at ustawia sie samo przy pierwszej publikacji
create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists offers_set_published_at on public.offers;
create trigger offers_set_published_at
  before insert or update of status on public.offers
  for each row execute function public.set_published_at();
