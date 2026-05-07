import { MetadataRoute } from 'next'
import { tenantConfig } from './lib/config/tenant'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: tenantConfig.brand.name,
    short_name: tenantConfig.brand.name,
    description: tenantConfig.brand.description.en,
    start_url: '/',
    display: 'standalone',
    background_color: `hsl(${tenantConfig.theme.tokens.background})`,
    theme_color: tenantConfig.theme.primaryColor,
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
