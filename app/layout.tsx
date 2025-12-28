import type { Metadata } from 'next'
import './globals.css'
import SchemaScript from './components/SchemaScript'
import ShakeToWin from './components/ShakeToWin'

export const metadata: Metadata = {
  metadataBase: new URL('https://bo-restuarant.vercel.app'), // Using likely Vercel URL or custom domain if known. Safest is to set this.
  title: {
    default: 'Bo Restaurant Dubai - Authentic Vietnamese Cuisine',
    template: '%s | Bo Restaurant Dubai'
  },
  description: 'Experience the soul of Vietnam in Dubai Festival City. Authentic Pho, Banh Mi, and more. Delivery across Dubai.',
  keywords: ['Vietnamese Food Dubai', 'Best Pho Dubai', 'Asian Delivery Dubai', 'Dubai Festival City Restaurants', 'Bo Dubai'],
  authors: [{ name: 'Bo Restaurant' }],
  creator: 'Bo Restaurant',
  publisher: 'Bo Restaurant',
  openGraph: {
    title: 'Bo Restaurant Dubai - Authentic Vietnamese Cuisine',
    description: 'Taste the Soul of Vietnam in Dubai Festival City. From Russia with Love, to the Heart of Dubai.',
    url: 'https://bo-restuarant.vercel.app',
    siteName: 'Bo Restaurant Dubai',
    images: [
      {
        url: '/images/og-image.jpg', // Ensure this image exists or is handled
        width: 1200,
        height: 630,
        alt: 'Bo Restaurant Dubai',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bo Restaurant Dubai',
    description: 'Authentic Vietnamese Cuisine in Dubai Festival City',
    images: ['/images/og-image.jpg'], // Reusing OG image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token', // Placeholder, user can add later
    yandex: 'yandex_verification_token',
  },
}

import { TelegramProvider } from './context/TelegramContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TelegramProvider>
          <ShakeToWin />
          <SchemaScript />
          {/* Global Providers can go here */}
          {children}
        </TelegramProvider>
      </body>
    </html>
  )
}
