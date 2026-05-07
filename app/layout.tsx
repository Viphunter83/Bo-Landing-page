import type { Metadata, Viewport } from 'next'
import './globals.css'
import SchemaScript from './components/SchemaScript'
import ShakeToWin from './components/ShakeToWin'
import InstallPrompt from './components/InstallPrompt'

import { tenantConfig } from './lib/config/tenant'

export const viewport: Viewport = {
  themeColor: tenantConfig.theme.primaryColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bo-restaurant-dubai.vercel.app'),
  title: {
    default: `${tenantConfig.brand.name} - ${tenantConfig.brand.description.en.split('.')[0]}`,
    template: `%s | ${tenantConfig.brand.name}`
  },
  description: tenantConfig.brand.description.en,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: tenantConfig.brand.name,
  },
  keywords: tenantConfig.brand.keywords,
  authors: [{ name: tenantConfig.brand.name }],
  creator: tenantConfig.brand.name,
  publisher: tenantConfig.brand.name,
  openGraph: {
    title: `${tenantConfig.brand.name} - ${tenantConfig.brand.description.en}`,
    description: tenantConfig.brand.description.en,
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://bo-restaurant-dubai.vercel.app',
    siteName: tenantConfig.brand.name,
    images: [
      {
        url: tenantConfig.brand.ogImage,
        width: 1200,
        height: 630,
        alt: tenantConfig.brand.name,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: tenantConfig.brand.name,
    description: tenantConfig.brand.description.en,
    images: [tenantConfig.brand.ogImage],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
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
  const { tokens } = tenantConfig.theme;
  
  const dynamicStyles = `
    :root {
      --background: ${tokens.background};
      --foreground: ${tokens.foreground};
      --card: ${tokens.card};
      --card-foreground: ${tokens.cardForeground};
      --popover: ${tokens.popover};
      --popover-foreground: ${tokens.popoverForeground};
      --primary: ${tokens.primary};
      --primary-foreground: ${tokens.primaryForeground};
      --secondary: ${tokens.secondary};
      --secondary-foreground: ${tokens.secondaryForeground};
      --muted: ${tokens.muted};
      --muted-foreground: ${tokens.mutedForeground};
      --accent: ${tokens.accent};
      --accent-foreground: ${tokens.accentForeground};
      --destructive: ${tokens.destructive};
      --destructive-foreground: ${tokens.destructiveForeground};
      --border: ${tokens.border};
      --input: ${tokens.input};
      --ring: ${tokens.ring};
      --radius: ${tokens.radius};
    }
  `;

  return (
    <html lang={tenantConfig.localization.defaultLang} className={tenantConfig.theme.mode === 'dark' ? 'dark' : ''}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      </head>
      <body className="antialiased">
        <TelegramProvider>
          <CartProvider>
            <ShakeToWin />
            <Suspense fallback={null}>
              <ReferralHandler />
            </Suspense>
            <InstallPrompt />
            <SchemaScript />
            {children}
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  )
}
