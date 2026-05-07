import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bo-restuarant.vercel.app'

    // Static routes
    const routes = [
        '',
        '/en',
        '/ru',
        '/en/menu',
        '/ru/menu',
        '/en/about', // Assuming these exist or will exist
        '/ru/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...routes]
}
