import type { Metadata, Viewport } from 'next'
import './globals.css'
import SchemaScript from './components/SchemaScript'
import ShakeToWin from './components/ShakeToWin'
import InstallPrompt from './components/InstallPrompt'

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://bo-restuarant.vercel.app'),
  title: {
    default: 'Bo Restaurant Dubai - Authentic Vietnamese Cuisine',
    template: '%s | Bo Restaurant Dubai'
  },
  description: 'Experience the soul of Vietnam in Dubai Festival City. Authentic Pho, Banh Mi, and more. Delivery across Dubai.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bo Dubai',
  },
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
        url: '/images/og-image.jpg',
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
    images: ['/images/og-image.jpg'],
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
    google: 'verification_token',
    yandex: 'yandex_verification_token',
  },
}

import { Suspense } from 'react'
import { TelegramProvider } from './context/TelegramContext'
import { CartProvider } from './context/CartContext'
import ReferralHandler from './components/ReferralHandler'
import TableHandler from './components/TableHandler'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TelegramProvider>
          <CartProvider>
            <ShakeToWin />
            <Suspense fallback={null}>
              <ReferralHandler />
            </Suspense>
            <InstallPrompt />
            <SchemaScript />
            {/* Global Providers can go here */}
            {children}
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  )
}
