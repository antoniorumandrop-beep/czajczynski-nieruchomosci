import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { applyFilters, buildQuery, parseFilters, sortOffers } from '../filters.ts'
import type { Offer } from '../types.ts'

function offer(over: Partial<Offer> & { id: string }): Offer {
  return {
    offerNumber: `CZN-MS-${over.id}`,
    slug: `oferta-${over.id}`,
    title: 'Test',
    propertyType: 'apartment',
    transactionType: 'sale',
    market: 'secondary',
    status: 'published',
    isExclusive: false,
    price: 500000,
    area: 50,
    rooms: 2,
    floor: 1,
    totalFloors: 4,
    city: 'Wrocław',
    district: 'Krzyki',
    addressLine: null,
    description: '',
    attributes: [],
    photos: [],
    agentId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  }
}

const SET: Offer[] = [
  offer({ id: '1', price: 300000, area: 30, rooms: 1, floor: 0, city: 'Wrocław', district: 'Krzyki' }),
  offer({ id: '2', price: 800000, area: 80, rooms: 3, floor: 4, city: 'Wrocław', district: 'Psie Pole' }),
  offer({ id: '3', price: 2500, area: 40, rooms: 2, floor: 2, transactionType: 'rent', market: null, city: 'Wałbrzych', district: null }),
  offer({ id: '4', price: 450000, area: null, rooms: null, floor: null, propertyType: 'plot', city: 'Oleśnica', district: null }),
]

describe('parsowanie parametrow z adresu', () => {
  it('odrzuca wartosci spoza slownika zamiast je przepuszczac', () => {
    const f = parseFilters({ transakcja: 'kradziez', typ: 'zamki', rynek: 'ksiezycowy', sort: 'losowo' })
    assert.equal(f.transakcja, null)
    assert.equal(f.typ, null)
    assert.equal(f.rynek, null)
    assert.equal(f.sort, 'najnowsze')
  })

  it('czyta liczby zapisane po polsku, ze spacja i przecinkiem', () => {
    const f = parseFilters({ cena_do: '1 200 000', m2_od: '46,29' })
    assert.equal(f.cena_do, 1200000)
    assert.equal(f.m2_od, 46.29)
  })

  it('mapuje slug kategorii na typ nieruchomosci', () => {
    assert.equal(parseFilters({ typ: 'dzialki' }).typ, 'plot')
    assert.equal(parseFilters({ typ: 'lokale' }).typ, 'commercial')
  })
})

describe('filtrowanie', () => {
  it('transakcja', () => {
    const f = parseFilters({ transakcja: 'wynajem' })
    assert.deepEqual(applyFilters(SET, f).map((o) => o.id), ['3'])
  })

  it('lokalizacja dziala mimo polskich znakow w adresie', () => {
    const f = parseFilters({ miasto: 'walbrzych' })
    assert.deepEqual(applyFilters(SET, f).map((o) => o.id), ['3'])
  })

  it('zakres ceny obejmuje krance', () => {
    assert.equal(applyFilters(SET, parseFilters({ cena_od: '300000', cena_do: '450000' })).length, 2)
  })

  it('oferty bez powierzchni wypadaja z filtru metrazu, zamiast udawac zero', () => {
    const wynik = applyFilters(SET, parseFilters({ m2_od: '1' }))
    assert.ok(!wynik.some((o) => o.id === '4'))
  })

  it('filtr ceny za metr pomija oferty, dla ktorych nie da sie jej policzyc', () => {
    const wynik = applyFilters(SET, parseFilters({ cena_m2_od: '1' }))
    assert.ok(!wynik.some((o) => o.id === '4'))
  })

  it('parter miesci sie w zakresie pieter od zera', () => {
    const wynik = applyFilters(SET, parseFilters({ pietro_od: '0', pietro_do: '0' }))
    assert.deepEqual(wynik.map((o) => o.id), ['1'])
  })

  it('kilka filtrow naraz zaweza wynik', () => {
    const f = parseFilters({ transakcja: 'sprzedaz', miasto: 'Wrocław', pokoje_od: '3' })
    assert.deepEqual(applyFilters(SET, f).map((o) => o.id), ['2'])
  })
})

describe('sortowanie', () => {
  it('po cenie w obie strony', () => {
    assert.deepEqual(sortOffers(SET, 'cena-rosnaco').map((o) => o.id), ['3', '1', '4', '2'])
    assert.deepEqual(sortOffers(SET, 'cena-malejaco').map((o) => o.id), ['2', '4', '1', '3'])
  })

  it('oferty bez powierzchni ladują na koncu, nie na poczatku', () => {
    const rosnaco = sortOffers(SET, 'm2-rosnaco').map((o) => o.id)
    assert.equal(rosnaco.at(-1), '4')
  })

  it('nie modyfikuje tablicy wejsciowej', () => {
    const kopia = [...SET]
    sortOffers(SET, 'cena-malejaco')
    assert.deepEqual(SET.map((o) => o.id), kopia.map((o) => o.id))
  })
})

describe('budowanie adresu', () => {
  it('pomija puste i domyslne wartosci', () => {
    assert.equal(buildQuery({ transakcja: null, sort: 'najnowsze' }), '')
    assert.equal(buildQuery({ transakcja: 'wynajem' }), '?transakcja=wynajem')
  })

  it('zamienia typ nieruchomosci na slug kategorii', () => {
    assert.equal(buildQuery({ typ: 'plot' }), '?typ=dzialki')
  })
})
