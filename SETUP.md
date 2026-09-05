# Konfiguracja Supabase

Instrukcja krok po kroku. Wszystko robi się raz.

## 1. Projekt w Supabase

Ustawienia przy zakładaniu projektu:

| Pole | Wartość |
|---|---|
| Region | Central EU (Frankfurt) |
| Enable Data API | zaznaczone |
| Automatically expose new tables | **odznaczone** |
| Enable automatic RLS | **zaznaczone** |
| Postgres Type | Postgres (default) |

Hasło do bazy zapisz w menedżerze haseł — Supabase pokazuje je raz.

## 2. Schemat bazy

W panelu Supabase: **SQL Editor → New query**. Wklej i uruchom po kolei,
w tej kolejności:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_and_grants.sql`
3. `supabase/migrations/0003_storage.sql`

Każdy skrypt można uruchomić ponownie bez psucia danych.

## 3. Wyłączenie rejestracji

**Authentication → Sign In / Providers → Email**: wyłącz „Allow new users to
sign up". Konta zakładamy ręcznie, tylko dla Beaty i Piotra. Bez tego każdy,
kto trafi na adres panelu, mógłby założyć sobie konto i zobaczyć szkice ofert
oraz zapytania z formularza.

## 4. Konta dla właścicieli

**Authentication → Users → Add user → Create new user**. Dwa konta, na adresy
e-mail Beaty i Piotra. Zaznacz „Auto Confirm User", żeby nie czekać na maila
potwierdzającego.

Hasła wygeneruj mocne i przekaż im bezpiecznie — nie mailem. Po pierwszym
zalogowaniu mogą je zmienić.

Po założeniu kont trzeba połączyć je z wierszami w tabeli `agents`
(kolumna `user_id`). Robi to skrypt importu w kroku 6.

## 5. Klucze w projekcie

**Project Settings → API keys**. Skopiuj do pliku `web/.env.local`
(wzór: `web/.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — klucz `anon` / `publishable`
- `SUPABASE_SERVICE_ROLE_KEY` — klucz `service_role` / `secret`

Klucz `service_role` omija wszystkie zabezpieczenia bazy. Nie wkleja się go
nigdzie poza tym plikiem — ani na czat, ani do repozytorium, ani do kodu,
który trafia do przeglądarki.

## 6. Import 22 ofert

```
cd web && npm run seed
```

Skrypt wgra oferty, zdjęcia do Storage i połączy konta z profilami agentów.
Można go uruchomić ponownie — aktualizuje istniejące rekordy zamiast dublować.

## 7. Wdrożenie na Vercel

Te same zmienne środowiskowe trzeba wpisać w **Vercel → Settings →
Environment Variables**. `NEXT_PUBLIC_SITE_URL` ustaw na docelowy adres strony,
bo z niego budują się tagi Open Graph i mapa strony.

Uwaga na później: darmowy plan Vercela (Hobby) zabrania użytku komercyjnego.
Na demo i pokaz jest w porządku. Gdy strona ma działać dla biura na poważnie —
plan Pro albo inny hosting.
