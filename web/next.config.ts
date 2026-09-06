import type { NextConfig } from 'next'

/**
 * Host Supabase Storage czytamy ze zmiennej srodowiskowej, zeby konfiguracja
 * nie trzymala na sztywno identyfikatora projektu - inny projekt (albo
 * przeniesienie na wlasna domene) nie wymaga wtedy zmiany w kodzie.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
    // zdjecia ofert zmieniaja sie rzadko, a kazde przetworzenie kosztuje
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
