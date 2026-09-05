import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { floorLabel, formatArea, formatPrice, offersCount, plural, rooms, slugify } from '../format.ts'

describe('odmiana przez liczebnik', () => {
  it('rozroznia trzy formy', () => {
    assert.equal(rooms(1), '1 pokój')
    assert.equal(rooms(2), '2 pokoje')
    assert.equal(rooms(3), '3 pokoje')
    assert.equal(rooms(4), '4 pokoje')
    assert.equal(rooms(5), '5 pokoi')
    assert.equal(rooms(10), '10 pokoi')
  })

  it('lapie wyjatek na 12-14, mimo koncowki 2-4', () => {
    assert.equal(rooms(12), '12 pokoi')
    assert.equal(rooms(13), '13 pokoi')
    assert.equal(rooms(14), '14 pokoi')
    assert.equal(rooms(22), '22 pokoje')
    assert.equal(rooms(112), '112 pokoi')
    assert.equal(rooms(122), '122 pokoje')
  })

  it('odmienia oferty tak samo', () => {
    assert.equal(offersCount(1), '1 oferta')
    assert.equal(offersCount(2), '2 oferty')
    assert.equal(offersCount(7), '7 ofert')
    assert.equal(offersCount(22), '22 oferty')
  })

  it('dziala na formie ogolnej', () => {
    assert.equal(plural(1, 'dom', 'domy', 'domów'), 'dom')
    assert.equal(plural(3, 'dom', 'domy', 'domów'), 'domy')
    assert.equal(plural(8, 'dom', 'domy', 'domów'), 'domów')
  })
})

describe('formatowanie liczb', () => {
  it('cena bez groszy', () => {
    assert.match(formatPrice(780000), /780/)
    assert.ok(!formatPrice(780000).includes(','))
  })

  it('powierzchnia z przecinkiem dziesietnym', () => {
    assert.equal(formatArea(46.29), '46,29 m²')
    assert.equal(formatArea(48), '48 m²')
    assert.equal(formatArea(null), null)
  })

  it('parter zamiast zerowego pietra', () => {
    assert.equal(floorLabel(0), 'Parter')
    assert.equal(floorLabel(2), '2. piętro')
    assert.equal(floorLabel(2, 5), '2. piętro z 5')
    assert.equal(floorLabel(null), null)
  })
})

describe('slugify', () => {
  it('zamienia polskie znaki na lacinskie', () => {
    assert.equal(slugify('Wrocław, Krzyki'), 'wroclaw-krzyki')
    assert.equal(slugify('Kąty Wrocławskie'), 'katy-wroclawskie'
    )
    assert.equal(slugify('Świdnica, Miernicza'), 'swidnica-miernicza')
    assert.equal(slugify('Żabia Grobla ŹŁĆŃ'), 'zabia-grobla-zlcn')
  })

  it('nie zostawia myslnikow na brzegach', () => {
    assert.equal(slugify('  --- Dom na sprzedaż ---  '), 'dom-na-sprzedaz')
  })
})
