/**
 * Wgrywa do Supabase agentow, 22 oferty i ich zdjecia.
 *
 * Uruchamianie:  npm run seed
 * Skrypt jest idempotentny - druga probka aktualizuje to, co juz jest,
 * zamiast dublowac rekordy.
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    'Brakuje NEXT_PUBLIC_SUPABASE_URL albo SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Skopiuj .env.local.example do .env.local i uzupelnij klucze z Supabase.',
  )
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const ROOT = path.resolve(import.meta.dirname, '..')
const BUCKET = 'offer-photos'

const offers = JSON.parse(await readFile(path.join(ROOT, 'src/data/offers.json'), 'utf8'))
const agents = JSON.parse(await readFile(path.join(ROOT, 'src/data/agents.json'), 'utf8'))

// ---------------------------------------------------------------------
// Agenci - laczymy z kontami logowania po adresie e-mail, jesli konto istnieje
// ---------------------------------------------------------------------
console.log('Agenci...')

const { data: authUsers } = await supabase.auth.admin.listUsers()
const userByEmail = new Map(
  (authUsers?.users ?? []).map((u) => [String(u.email).toLowerCase(), u.id]),
)

const agentIdBySlug = new Map()

for (const [i, a] of agents.entries()) {
  const row = {
    slug: a.slug,
    full_name: a.fullName,
    role: a.role,
    licence: a.licence,
    phone: a.phone,
    email: a.email,
    bio: a.bio,
    sort_order: i,
    user_id: userByEmail.get(String(a.email).toLowerCase()) ?? null,
  }

  const { data, error } = await supabase
    .from('agents')
    .upsert(row, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    console.error(`  ${a.fullName}: ${error.message}`)
    process.exit(1)
  }
  agentIdBySlug.set(a.slug, data.id)
  console.log(`  ${a.fullName}${row.user_id ? ' (konto powiazane)' : ' (bez konta logowania)'}`)
}

// ---------------------------------------------------------------------
// Oferty
// ---------------------------------------------------------------------
console.log(`\nOferty (${offers.length})...`)

let photosUploaded = 0
let photosSkipped = 0

for (const [i, o] of offers.entries()) {
  const row = {
    offer_number: o.offerNumber,
    slug: o.slug,
    title: o.title,
    property_type: o.propertyType,
    transaction_type: o.transactionType,
    market: o.market,
    status: o.status,
    is_exclusive: o.isExclusive,
    price: o.price,
    area: o.area,
    rooms: o.rooms,
    floor: o.floor,
    total_floors: o.totalFloors,
    city: o.city,
    district: o.district,
    address_line: o.addressLine,
    description: o.description,
    attributes: o.attributes,
    agent_id: agentIdBySlug.get(o.agentId) ?? null,
  }

  const { data: saved, error } = await supabase
    .from('offers')
    .upsert(row, { onConflict: 'offer_number' })
    .select('id')
    .single()

  if (error) {
    console.error(`  ${o.offerNumber}: ${error.message}`)
    process.exit(1)
  }

  // ---- zdjecia ----
  const { data: existing } = await supabase
    .from('offer_photos')
    .select('storage_path')
    .eq('offer_id', saved.id)
  const already = new Set((existing ?? []).map((p) => p.storage_path))

  const dir = path.join(ROOT, 'public', 'oferty', o.offerNumber)
  let files = []
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.jpg')).sort()
  } catch {
    files = []
  }

  for (const [n, file] of files.entries()) {
    const storagePath = `${o.offerNumber}/${file}`
    if (already.has(storagePath)) {
      photosSkipped++
      continue
    }

    const body = await readFile(path.join(dir, file))
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, body, { contentType: 'image/jpeg', upsert: true })

    if (upErr) {
      console.error(`    ${storagePath}: ${upErr.message}`)
      continue
    }

    const { error: rowErr } = await supabase
      .from('offer_photos')
      .upsert(
        {
          offer_id: saved.id,
          storage_path: storagePath,
          caption: o.photos[n]?.caption ?? null,
          sort_order: n,
        },
        { onConflict: 'offer_id,storage_path' },
      )

    if (rowErr) console.error(`    ${storagePath}: ${rowErr.message}`)
    else photosUploaded++
  }

  console.log(
    `  [${i + 1}/${offers.length}] ${o.offerNumber}  ${files.length} zdjęć  ${o.city}`,
  )
}

console.log(
  `\nGotowe. ${offers.length} ofert, ${photosUploaded} zdjęć wgranych` +
    (photosSkipped ? `, ${photosSkipped} już było` : '') +
    '.',
)
