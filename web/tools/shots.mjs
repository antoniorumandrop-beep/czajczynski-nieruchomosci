/**
 * Zrzuty ekranu wariantow. Panel przegladarki w sesji bywa schowany
 * i nie renderuje - Playwright robi to niezaleznie i daje pelna strone.
 *
 * Uzycie: node tools/shots.mjs [sciezka ...]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3000'
const OUT = path.resolve(import.meta.dirname, '..', '..', 'shots')
const paths = process.argv.slice(2)
if (paths.length === 0) {
  console.error('podaj co najmniej jedna sciezke, np. /warianty/a')
  process.exit(1)
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor ?? 2,
    isMobile: vp.isMobile ?? false,
    hasTouch: vp.isMobile ?? false,
    locale: 'pl-PL',
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()

  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const p of paths) {
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 60000 })
    // wymus doladowanie obrazkow lazy - inaczej dol strony wychodzi pusty
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(600)

    const name = (p.replace(/^\//, '').replace(/\//g, '-') || 'home') + `-${vp.name}.png`
    await page.screenshot({ path: path.join(OUT, name), fullPage: true })
    console.log(`${name}  (${(await page.evaluate(() => document.body.scrollHeight))}px)`)
  }

  if (errors.length) {
    console.log(`\nBLEDY w konsoli (${vp.name}):`)
    for (const e of [...new Set(errors)].slice(0, 10)) console.log('  -', e)
  }
  await ctx.close()
}
await browser.close()
