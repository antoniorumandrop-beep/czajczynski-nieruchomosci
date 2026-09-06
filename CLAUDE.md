# Czajczyński Nieruchomości — strona i panel

Nowa strona dla wrocławskiego biura nieruchomości (obecnie superlokum.pl).
Budowana jako prezent/pitch: właściciele jeszcze o niej nie wiedzą.

## Kontekst

- Biuro: Beata Woroszkiewicz (pośrednik), Piotr Czajczyński (rzeczoznawca majątkowy)
- ul. Białoskórnicza 10, 50-134 Wrocław, tel. 71 794 49 83
- 22 oferty zassane ze starej strony razem z 218 zdjęciami
- 15 z 22 to wynajem, 21 z 22 na wyłączność, 18 z 22 we Wrocławiu

## Stack

Next.js 16 (App Router, Turbopack) + Tailwind 4 + Supabase + Vercel.
Node zainstalowany lokalnie w `~/.local/node` — nie ma go w systemie,
każda komenda wymaga `export PATH="$HOME/.local/node/bin:$PATH"`.

## Uwaga: to nie jest Next.js, który znasz

Wersja 16 ma zmiany łamiące. Przed pisaniem kodu czytaj
`web/node_modules/next/dist/docs/`. Najważniejsze:

- `params` i `searchParams` są Promise — trzeba `await`
- `middleware.ts` nazywa się teraz `proxy.ts` i chodzi na runtime nodejs
- `revalidateTag(tag)` wymaga drugiego argumentu; jest też `updateTag`
- Turbopack domyślnie w dev i build

## Struktura

```
web/src/
  app/(site)/     strona publiczna
  app/panel/      panel dla właścicieli
  lib/data/       dwa źródła danych: JSON (bez Supabase) i baza
  lib/panel/      schemat formularza, dostęp do danych panelu
tools/            scraper i normalizer starej strony
supabase/migrations/  SQL do wklejenia w SQL Editor
```

## Warstwa danych ma dwa tryby

Bez kluczy Supabase strona czyta `web/src/data/offers.json` (zassane ze
starej strony). Z kluczami — czyta bazę. Przełącza się samo, przez
`hasSupabase()`. Panel bez bazy pokazuje ekran „nie skonfigurowano".

## Konwencje

- Rozmowa i cała treść strony po polsku, kod i commity po angielsku
- Polska odmiana przez liczebnik jest w `lib/format.ts` — nie sklejaj
  „5 pokoje" ręcznie
- Cena za m² jest liczona, nigdy wpisywana (kolumna generowana w bazie)
- Nie zmyślaj faktów o firmie (rok założenia, liczba transakcji) — strona
  trafi do właścicieli

## Weryfikacja wizualna

Panel przeglądarki w sesji bywa schowany i nie renderuje. Zamiast niego:

```
export PATH="$HOME/.local/node/bin:$PATH"
cd web && node tools/shots.mjs / /oferty /panel
```

Zrzuty lądują w `shots/` (poza repo).

## Pułapki, na które już trafiliśmy

**`backdrop-filter` tworzy blok zawierający dla `position: fixed`.** Menu
mobilne było dzieckiem paska nawigacji z `backdrop-blur` i przez to `inset-0`
oznaczało rozmiar paska, nie ekranu — treść strony przechodziła przez menu.
Warstwy pełnoekranowe muszą być rodzeństwem paska, nie jego dzieckiem.

**Adresy zdjęć bywają względne albo pełne** — względne z pliku JSON, pełne
z Supabase Storage. Do tagów Open Graph i danych strukturalnych używaj
`absoluteUrl()` z `lib/site.ts`, nie sklejaj domeny ręcznie.

**Vercel na darmowym planie blokuje deploy commita, którego autor nie jest
właścicielem projektu.** Repozytorium ma ustawione `user.email` na adres
noreply konta GitHub — nie zmieniaj tego.

**`generateStaticParams` nie ma dostępu do ciasteczek**, bo działa przy
budowaniu. Dane publiczne czytaj przez `createPublicClient()`, nie przez
klient związany z sesją.

## Co zostało

- Konta w panelu dla Beaty i Piotra (jest tylko konto testowe Antonia)
- Ich zdjęcia do profili — teraz pokazują się inicjały
- Przypisanie ofert do Beaty — w danych wszystkie 22 ma Piotr
- Włączenie Web Analytics w panelu Vercela
