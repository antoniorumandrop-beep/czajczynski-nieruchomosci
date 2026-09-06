# Czajczyński Nieruchomości

Strona i panel dla wrocławskiego biura nieruchomości. Next.js 16 + Supabase.

## Uruchomienie lokalne

```bash
cd web
cp .env.local.example .env.local   # uzupełnij kluczami z Supabase
npm install
npm run dev
```

Bez kluczy Supabase strona działa na danych z `web/src/data/offers.json`,
a panel pokazuje ekran „nie skonfigurowano".

## Komendy

| Komenda | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski na porcie 3000 |
| `npm run build` | build produkcyjny |
| `npm test` | testy logiki (odmiana, filtry, sortowanie) |
| `npm run seed` | import ofert i zdjęć do Supabase |

## Struktura

```
web/src/app/(site)/   strona publiczna
web/src/app/panel/    panel dla właścicieli
web/src/lib/data/     dwa źródła danych: JSON i Supabase
supabase/migrations/  SQL do wklejenia w SQL Editor
tools/                scraper i normalizer starej strony
```

Szczegóły konfiguracji: [SETUP.md](SETUP.md).
Stan prac i następne kroki: [NEXT-STEPS.md](NEXT-STEPS.md).
