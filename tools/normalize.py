#!/usr/bin/env python3
"""
Zamienia surowy zrzut ze superlokum.pl na czysty model danych nowej strony
i przenosi zdjecia do web/public/oferty/<numer-oferty>/NN.jpg.

Uzycie: python3 tools/normalize.py
"""
import json
import os
import re
import shutil
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "scraped")
WEB = os.path.join(ROOT, "web")
PHOTO_OUT = os.path.join(WEB, "public", "oferty")
DATA_OUT = os.path.join(WEB, "src", "data")

PL = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "acelnoszzACELNOSZZ")

TYPE_LABEL = {
    "apartment": "Mieszkanie", "house": "Dom",
    "plot": "Działka", "commercial": "Lokal",
}
TRANS_SUFFIX = {"sale": "na sprzedaż", "rent": "na wynajem"}

# pola, ktore w nowym modelu sa pierwszoklasowe - nie duplikujemy ich
# w liscie dodatkowych parametrow
PROMOTED = {
    "vir_symbol_oferty", "vir_oferta_powierzchnia", "vir_oferta_iloscpokoi",
    "vir_oferta_pietro", "vir_oferta_iloscpieter",
}

AGENTS = {
    "piotr czajczynski": "piotr-czajczynski",
    "beata woroszkiewicz": "beata-woroszkiewicz",
}


def slugify(s):
    s = s.translate(PL)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def num(v):
    if v is None:
        return None
    s = re.sub(r"[^\d,.-]", "", str(v).replace("\xa0", "").replace(" ", "")).replace(",", ".")
    try:
        f = float(s)
    except ValueError:
        return None
    return int(f) if f == int(f) else f


def split_location(raw):
    """'Wrocław, Krzyki, Przedmieście Oławskie, Traugutta' -> miasto, dzielnica, pelny."""
    parts = [p.strip() for p in (raw or "").split(",") if p.strip()]
    # CMS dokleja kody typu "(gw)" = gmina wiejska - dla czytelnika to smiec
    parts = [re.sub(r"\s*\([^)]*\)", "", p).strip() for p in parts]
    parts = [p for p in parts if p]
    if not parts:
        return "", None, None
    city = parts[0]
    district = parts[1] if len(parts) > 1 else None
    return city, district, (raw.strip() if len(parts) > 2 else None)


def clean_description(text, is_exclusive):
    """Usuwa powtorzona plakietke wylacznosci i stopke prawna - maja wlasne miejsca."""
    lines = [l.rstrip() for l in (text or "").split("\n")]
    if is_exclusive and lines and lines[0].strip().lower().startswith("oferta na wyłączność"):
        lines = lines[1:]
    out, cut = [], False
    for l in lines:
        low = l.strip().lower()
        if low.startswith("niniejsza informacja nie stanowi oferty") or low.startswith("nota prawna"):
            cut = True
        if cut:
            continue
        out.append(l)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()


def main():
    with open(os.path.join(SRC, "offers.json"), encoding="utf-8") as f:
        raw = json.load(f)

    if os.path.isdir(PHOTO_OUT):
        shutil.rmtree(PHOTO_OUT)
    os.makedirs(PHOTO_OUT, exist_ok=True)
    os.makedirs(DATA_OUT, exist_ok=True)

    offers, warnings = [], []
    for r in raw:
        number = (r.get("offer_number") or "").strip()
        if not number:
            warnings.append(f"{r['source_url']}: brak numeru oferty, pomijam")
            continue

        params = r.get("params") or {}

        def param(key):
            return (params.get(key) or {}).get("value")

        ptype = r.get("property_type")
        trans = r.get("transaction_type")
        city, district, address = split_location(r.get("location_raw"))
        exclusive = bool(r.get("is_exclusive"))

        area = num(r.get("area")) or num(param("vir_oferta_powierzchnia"))
        r_rooms = num(r.get("rooms")) or num(param("vir_oferta_iloscpokoi"))
        # dzialka nie ma pokoi ani pieter, choc CMS potrafi tam cos wpisac
        if ptype == "plot":
            r_rooms = None

        label = TYPE_LABEL.get(ptype, "Nieruchomość")
        title_loc = ", ".join(x for x in [city, district] if x)
        title = f"{label} {TRANS_SUFFIX.get(trans, '')}, {title_loc}".strip().rstrip(",")

        slug = slugify(f"{label}-{TRANS_SUFFIX.get(trans, '')}-{title_loc}-{number}")

        agent_key = slugify(r.get("agent_raw") or "").replace("-", " ")
        agent_id = AGENTS.get(agent_key)
        if not agent_id and r.get("agent_raw"):
            warnings.append(f"{number}: nieznany agent {r['agent_raw']!r}")

        photos = []
        if r.get("photos"):
            dest = os.path.join(PHOTO_OUT, number)
            os.makedirs(dest, exist_ok=True)
            for i, fname in enumerate(r["photos"]):
                src = os.path.join(SRC, "photos", fname)
                if not os.path.exists(src):
                    continue
                out_name = f"{i + 1:02d}.jpg"
                shutil.copy2(src, os.path.join(dest, out_name))
                photos.append({
                    "id": f"{number}-{i + 1:02d}",
                    "url": f"/oferty/{number}/{out_name}",
                    "caption": None,
                    "sortOrder": i,
                })
        else:
            warnings.append(f"{number}: zero zdjec")

        offers.append({
            "id": number.lower(),
            "offerNumber": number,
            "slug": slug,
            "title": title,
            "propertyType": ptype,
            "transactionType": trans,
            # obecny CMS nie publikuje rynku; przy sprzedazy zakladamy wtorny,
            # wlasciciele poprawia w panelu jednym kliknieciem
            "market": "secondary" if trans == "sale" else None,
            "status": "published",
            "isExclusive": exclusive,
            "price": num(r.get("price")),
            "area": area,
            "rooms": r_rooms,
            "floor": None if ptype == "plot" else num(param("vir_oferta_pietro")),
            "totalFloors": None if ptype == "plot" else num(param("vir_oferta_iloscpieter")),
            "city": city,
            "district": district,
            "addressLine": address,
            "description": clean_description(r.get("description"), exclusive),
            "attributes": [
                {"label": v["label"], "value": v["value"]}
                for k, v in params.items()
                if k not in PROMOTED and v.get("value")
            ],
            "photos": photos,
            "agentId": agent_id,
            "createdAt": "2026-09-05T00:00:00.000Z",
            "updatedAt": "2026-09-05T00:00:00.000Z",
            "sourceUrl": r.get("source_url"),
        })

    # najnowsze najpierw - numer oferty rosnie w czasie
    offers.sort(key=lambda o: int(re.search(r"(\d+)$", o["offerNumber"]).group(1)), reverse=True)

    out = os.path.join(DATA_OUT, "offers.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(offers, f, ensure_ascii=False, indent=2)

    total_photos = sum(len(o["photos"]) for o in offers)
    print(f"{len(offers)} ofert, {total_photos} zdjec -> {out}")
    by_type = {}
    for o in offers:
        by_type[o["propertyType"]] = by_type.get(o["propertyType"], 0) + 1
    print("wg typu:", by_type)
    no_agent = [o["offerNumber"] for o in offers if not o["agentId"]]
    if no_agent:
        print(f"bez agenta ({len(no_agent)}):", ", ".join(no_agent))
    if warnings:
        print("\nUwagi:")
        for w in warnings:
            print(" -", w)


if __name__ == "__main__":
    main()
