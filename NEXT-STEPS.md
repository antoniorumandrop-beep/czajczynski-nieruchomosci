# Co dalej — stan na 5 września 2026

Projekt Supabase: `svlwzannmfzdodpwfifa` (Frankfurt).
Klucze siedzą w `web/.env.local` — sprawdzone, działają.

**Zrobione przez Antonia:** migracje 0001–0003 uruchomione, rejestracja
wyłączona, konto testowe `antonioruman99@gmail.com` założone. GitHub i Vercel
ma na koncie od projektu xoxo — nowy projekt dokłada tam.

**Dołożone potem:** granty dla `service_role` (plik 0002 ich nie miał, przez
co import dostawał 42501). Plik jest poprawiony w repo.

---

## Zrobione

- Node 24 LTS w `~/.local/node` (nie było go w systemie)
- Next.js 16 + Tailwind 4, build produkcyjny przechodzi, 43 podstrony
- 22 oferty i 218 zdjęć zassane ze starej strony, znormalizowane do modelu danych
- Trzy warianty designu; wybrany B „Kontora"
- Cała strona publiczna: główna, lista z filtrami i sortowaniem, strona oferty
  z galerią, profile agentów, o firmie, wycena, kontakt, sitemap, robots, 404
- Panel: logowanie, formularz oferty, zarządzanie zdjęciami, skrzynka zapytań
- Facebook: generowanie tekstu posta + Open Graph
- Schemat bazy z RLS gotowy do wklejenia
- 24 testy logiki (`cd web && npm test`)

---

## Krok 1 — migracje — ZROBIONE

Supabase → **SQL Editor** → **New query**. Wklej i uruchom **po kolei**:

1. `supabase/migrations/0001_initial_schema.sql` — tabele
2. `supabase/migrations/0002_rls_and_grants.sql` — uprawnienia
3. `supabase/migrations/0003_storage.sql` — bucket na zdjęcia

Każdy można puścić ponownie, nic się nie zepsuje.

**Alternatywa:** podłącz MCP Supabase, a następna sesja zrobi to sama i od razu
sprawdzi, czy wszystko powstało. W zwykłym terminalu:

```
claude mcp add --scope project --transport http supabase https://mcp.supabase.com/mcp
```

potem `/mcp` → `supabase` → Authenticate. W Feature groups **zaznacz `storage`** —
domyślnie jest wyłączony, a bez niego nie da się sprawdzić wgrywania zdjęć.

## Krok 2 — wyłączenie rejestracji — ZROBIONE

**Authentication → Sign In / Providers → Email** → wyłącz „Allow new users to sign up".

Bez tego każdy, kto trafi na `/panel/logowanie`, może założyć sobie konto
i zobaczyć szkice ofert oraz zapytania z formularza.

## Krok 3 — konta — ZROBIONE (jedno, testowe)

**Authentication → Users → Add user → Create new user**, zaznacz „Auto Confirm User".

Na razie mogą to być Twoje adresy do testów — prawdziwe maile Beaty i Piotra
wpiszemy, gdy powiedzą „tak". Adres e-mail konta musi się zgadzać z tym
w `web/src/data/agents.json`, żeby import połączył konto z profilem agenta.
Teraz jest tam `oferty@superlokum.pl` przy obu — do zmiany.

## Krok 4 — import 22 ofert — ZROBIONE

22 oferty i 218 zdjęć są w bazie i w Storage. Powtórzenie `npm run seed`
zaktualizuje istniejące rekordy zamiast dublować.

## Krok 5 — test panelu

**Sprawdzone automatycznie na żywej bazie (13 z 13):** dodanie szkicu,
liczenie ceny za m² przez bazę, ukrycie szkicu przed gościem, stemplowanie
daty publikacji, wgranie zdjęcia z opisem do Storage i jego publiczny odczyt,
odrzucenie działki z pokojami i zduplikowanego numeru oferty, wysłanie
zapytania przez gościa przy jednoczesnym braku dostępu do cudzych zapytań,
kaskadowe kasowanie zdjęć razem z ofertą. Panel jest też odgrodzony —
każdy adres pod `/panel` przekierowuje niezalogowanego na logowanie.

**Przegląd kodu przed publikacją — poprawione:**

- zdjęcie wgrane do Storage, przy którym padł zapis do bazy, zostawało tam
  na zawsze i zjadało limit; teraz panel sprząta po sobie
- wyzwalacz w bazie (`0004`) kasuje plik razem z wierszem, niezależnie od
  tego, którędy ktoś usuwa ofertę
- portrety agentów były w modelu, ale nigdzie się nie wyświetlały — strona
  zespołu nie miała ani jednej twarzy; dodane w czterech miejscach,
  z inicjałami jako stanem przejściowym
- zmiana kolejności zdjęć szła 17 zapytaniami pod rząd, teraz równolegle
- przycisk „Podgląd" przy szkicu prowadził na 404; szkic widzi teraz
  zalogowany personel, z paskiem ostrzegawczym u góry
- cele dotykowe poniżej 32 px w stopce, nawigacji i na stronie kontaktu
- cztery błędy lintera, w tym dwa wzorce wywołujące kaskadę renderów

**Zostaje przejście przez interfejs** (musi zrobić człowiek — hasła nie użyję):

- logowanie i wylogowanie
- dodanie oferty od zera, nadanie numeru, zapis
- wgranie kilku zdjęć, zmiana kolejności przeciąganiem, opisy pod zdjęciami
- podgląd przed publikacją, publikacja, sprawdzenie że oferta jest na stronie
- wysłanie zapytania z formularza i sprawdzenie, że trafiło do skrzynki
- usunięcie oferty razem ze zdjęciami

## Krok 6 — wdrożenie na Vercel

Potrzebne od Ciebie: konto Vercel (darmowe) i połączenie repozytorium.
Repo jest lokalne, bez zdalnego — trzeba założyć na GitHubie.

Te same trzy zmienne co w `.env.local` wpisuje się w **Vercel → Settings →
Environment Variables**, plus `NEXT_PUBLIC_SITE_URL` ustawione na adres
z Vercela (nie localhost) — z niego budują się tagi Open Graph i sitemap.

---

## Czego jeszcze potrzebuję od Ciebie

| Co | Kiedy | Po co |
|---|---|---|
| Uruchomienie 3 plików SQL **albo** MCP | teraz | bez tego panel nie ruszy |
| Wyłączenie rejestracji | teraz | inaczej panel jest otwarty dla każdego |
| Dwa konta w Authentication | teraz | do testów logowania |
| Konto GitHub + Vercel | przed wdrożeniem | hosting |
| Zdjęcia Beaty i Piotra | przed pokazaniem im | profile mają puste miejsce na zdjęcie |
| Decyzja, które oferty prowadzi Beata | przed pokazaniem im | w danych wszystkie 22 ma Piotr |

---

## Do zrobienia przed pokazaniem właścicielom

- Usunąć `/warianty` — to były makiety do wyboru kierunku, nie część strony
- Podmienić `oferty@superlokum.pl` w `agents.json` na prawdziwe adresy
- Uzupełnić opisy pod zdjęciami przynajmniej w kilku ofertach, żeby było
  widać, że ta funkcja istnieje
- Krótka instrukcja obsługi panelu dla dwóch nietechnicznych osób

## Rzeczy, o których warto pamiętać

**Klucz `service_role` przez chwilę leżał w `.gitignore`**, czyli w pliku, który
trafia do repozytorium. Do żadnego commita nie wszedł (sprawdzone), ale skoro
już się przewinął — najtaniej go wymienić: Supabase → Project Settings → API
Keys → rotacja. Zajmuje minutę, potem trzeba podmienić wartość w `.env.local`.

**Darmowy plan Vercela (Hobby) zabrania użytku komercyjnego.** Na demo i pokaz
jest w porządku. Gdy strona ma działać dla biura na poważnie — Pro za 20 USD
miesięcznie albo inny hosting.

**Darmowy Supabase:** 500 MB bazy, 1 GB na zdjęcia. 22 oferty po kompresji to
około 100 MB. Przy mniej więcej 150 ofertach trzeba przejść na plan za 25 USD.

**Nie dotykamy superlokum.pl.** Stara strona ma działać bez przerwy, dopóki
właściciele nie powiedzą „tak".
