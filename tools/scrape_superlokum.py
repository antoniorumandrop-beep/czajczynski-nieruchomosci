#!/usr/bin/env python3
"""
Zasysa oferty ze superlokum.pl do lokalnego JSON-a + katalogu ze zdjeciami.
Uruchamiane raz, na potrzeby migracji tresci do nowej strony.

Uzycie:  python3 tools/scrape_superlokum.py <katalog-wyjsciowy>
"""
import json
import os
import re
import sys
import time
import urllib.request
from html import unescape

BASE = "https://www.superlokum.pl"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
PAGE_DELAY = 5.0
PHOTO_DELAY = 0.3


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", errors="replace")


def strip_tags(s):
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</p>", "\n\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = unescape(s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n\s*\n+", "\n\n", s)
    return s.strip()


def num(s):
    """'16 850,29' -> 16850.29 ; zwraca None gdy nie liczba."""
    if s is None:
        return None
    s = re.sub(r"[^\d,.-]", "", s.replace("\xa0", "").replace(" ", ""))
    s = s.replace(",", ".")
    if not re.match(r"^-?\d+(\.\d+)?$", s or ""):
        return None
    v = float(s)
    return int(v) if v == int(v) else v


def first(pattern, text, group=1, flags=re.S):
    m = re.search(pattern, text, flags)
    return m.group(group) if m else None


def collect_offer_urls():
    """Zwraca liste unikalnych URL-i ofert z listingu."""
    html = get(f"{BASE}/oferty?page=2")
    slugs = re.findall(r'href="((?:mieszkania|domy|dzialki|lokale|garaze|hale|obiekty)-na-[a-z]+-[^"]*?-o\d+)"', html)
    seen, out = set(), []
    for s in slugs:
        if s not in seen:
            seen.add(s)
            out.append(f"{BASE}/{s}")
    return out, html


def parse_listing_cards(html):
    """Z listingu bierzemy flage wylacznosci i cene - na detalu latwiej sie pomylic."""
    cards = {}
    for block in re.split(r'(?=<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 noPaddingLeft singleOffer ofe)', html):
        oid = first(r'singleOffer ofe(\d+)', block)
        if not oid:
            continue
        cards[oid] = {
            "is_exclusive": "flag-exclusive" in block or "ofe-flag exclusive" in block,
            "location_raw": strip_tags(first(r'class="locationListOffer[^"]*"[^>]*>(.*?)</div>', block) or ""),
            "offer_number": strip_tags(first(r'class="idListOffer[^"]*"[^>]*>(.*?)</div>', block) or ""),
            "transaction_raw": strip_tags(first(r'class="transactionListOffer[^"]*"[^>]*>(.*?)</div>', block) or "").lstrip(", "),
        }
    return cards


def parse_offer(url, html):
    oid = first(r"-o(\d+)$", url)
    slug = url.rsplit("/", 1)[-1]

    def headfield(cls):
        # kilka divow ma te sama klase (jeden to przycisk FB, bez wartosci) -
        # bierzemy pierwszy, ktory faktycznie zawiera valofe
        for m in re.finditer(r'class="%s\s+pull-left' % re.escape(cls), html):
            v = first(r'class="valofe">(.*?)</span>', html[m.end():m.end() + 400])
            if v:
                return strip_tags(v)
        return None

    # typ i transakcje bierzemy ze sluga - jest jednoznaczny i zawsze obecny
    m = re.match(r'^([a-z]+)-na-([a-z]+)-', slug)
    kind_raw, trans_raw = (m.group(1), m.group(2)) if m else (None, None)
    PROPERTY_TYPES = {"mieszkania": "apartment", "domy": "house",
                      "dzialki": "plot", "lokale": "commercial",
                      "garaze": "garage", "hale": "commercial",
                      "obiekty": "commercial"}
    TRANSACTIONS = {"sprzedaz": "sale", "wynajem": "rent"}

    params = {}
    for m in re.finditer(
        r'<div class="fieldDetails (vir_[a-zA-Z_]+)">\s*'
        r'<div class="pull-left">(.*?)</div>\s*'
        r'<div class="pull-right[^"]*">(.*?)</div>', html, re.S):
        key, label, value = m.group(1), strip_tags(m.group(2)), strip_tags(m.group(3))
        if value:
            params[key] = {"label": label, "value": value}

    desc_html = first(r'<div class="valueDescription">(.*?)</div>\s*</div>', html) or ""
    photos = sorted(set(re.findall(r'(https://www\.superlokum\.pl/photos/[^"\'\s]+_1280_960_[^"\'\s]+\.jpg)', html)))

    agent = first(r'Po[śs]rednik odpowiedzialny zawodowo[^:]*:\s*([^<\n-]+)', strip_tags(html))

    return {
        "source_id": oid,
        "source_url": url,
        "source_slug": slug,
        "title": strip_tags(first(r'<title>(.*?)</title>', html) or ""),
        "location_raw": strip_tags(first(r'class="locationOffer[^"]*"[^>]*>(.*?)</div>', html) or ""),
        "property_type": PROPERTY_TYPES.get(kind_raw),
        "transaction_type": TRANSACTIONS.get(trans_raw),
        "headline": strip_tags(first(r'class="transactionListOffer[^"]*"[^>]*>(.*?)</div>', html) or ""),
        "rooms": num(headfield("ofeRoom")),
        "area": num(headfield("ofeArea")),
        "price_per_m2": num(headfield("ofePriceSquare")),
        "price": num(headfield("ofePrice")),
        "description": strip_tags(desc_html),
        "description_html": desc_html.strip(),
        "params": params,
        "agent_raw": (agent or "").strip(),
        "photo_urls": photos,
    }


def main():
    outdir = sys.argv[1] if len(sys.argv) > 1 else "scraped"
    photodir = os.path.join(outdir, "photos")
    os.makedirs(photodir, exist_ok=True)

    print("Pobieram listing...", flush=True)
    urls, listing_html = collect_offer_urls()
    cards = parse_listing_cards(listing_html)
    print(f"Znalazlem {len(urls)} ofert, {len(cards)} kart w listingu\n", flush=True)

    offers = []
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url.rsplit('/', 1)[-1]}", flush=True)
        try:
            offer = parse_offer(url, get(url))
        except Exception as e:
            print(f"    BLAD strony: {e}", flush=True)
            continue

        offer.update(cards.get(offer["source_id"], {}))

        saved = []
        for n, purl in enumerate(offer["photo_urls"], 1):
            fname = f"{offer['source_id']}_{n:02d}.jpg"
            fpath = os.path.join(photodir, fname)
            if not os.path.exists(fpath):
                try:
                    with open(fpath, "wb") as f:
                        f.write(get(purl, binary=True))
                    time.sleep(PHOTO_DELAY)
                except Exception as e:
                    print(f"    BLAD zdjecia {purl}: {e}", flush=True)
                    continue
            saved.append(fname)
        offer["photos"] = saved
        del offer["photo_urls"]
        print(f"    {offer.get('offer_number') or '?'} | {offer.get('price')} zl | {len(saved)} zdjec", flush=True)

        offers.append(offer)
        time.sleep(PAGE_DELAY)

    path = os.path.join(outdir, "offers.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(offers, f, ensure_ascii=False, indent=2)
    total = sum(len(o["photos"]) for o in offers)
    print(f"\nGotowe: {len(offers)} ofert, {total} zdjec -> {path}", flush=True)


if __name__ == "__main__":
    main()
