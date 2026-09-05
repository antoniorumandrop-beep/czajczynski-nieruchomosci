import type { MetadataRoute } from 'next'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { siteUrl } from '@/lib/site'
import { PROPERTY_TYPES } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const now = new Date()

  const staticPages = ['', '/oferty', '/zespol', '/o-firmie', '/wycena', '/kontakt'].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }))

  const categories = Object.values(PROPERTY_TYPES).map((t) => ({
    url: `${base}/oferty/${t.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const offers = (await getPublicOffers()).map((o) => ({
    url: `${base}/oferta/${o.slug}`,
    lastModified: new Date(o.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const agents = (await getAgents()).map((a) => ({
    url: `${base}/zespol/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...categories, ...offers, ...agents]
}
