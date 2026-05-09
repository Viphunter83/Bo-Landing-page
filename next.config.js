/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc';
    const defaultLocale = tenantId === 'luna_hcmc' ? 'vn' : 'en';
    
    return [
      {
        source: '/',
        destination: `/${defaultLocale}`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
