import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getTenantConfig } from './lib/firebase/tenant'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc';
  const tenantConfig = await getTenantConfig(tenantId);
  
  if (!tenantConfig) {
    return {
        name: 'Universal Restaurant',
        short_name: 'Restaurant',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [],
    }
  }

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

