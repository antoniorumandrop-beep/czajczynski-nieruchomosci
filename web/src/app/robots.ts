import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // panel i podglady szkicow nie maja czego szukac w wynikach
      disallow: ['/panel', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
