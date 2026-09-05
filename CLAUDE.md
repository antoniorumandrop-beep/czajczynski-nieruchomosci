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

## Co zostało

- Podpięcie Supabase i test panelu na żywo (czeka na klucze)
- Import 22 ofert do bazy: `npm run seed`
- Wdrożenie na Vercel
- Usunięcie `/warianty` przed startem — to były makiety do wyboru kierunku
