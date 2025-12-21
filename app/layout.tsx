import type { Metadata } from 'next'
import './globals.css'
import SchemaScript from './components/SchemaScript'

export const metadata: Metadata = {
  title: 'Bo Restaurant Dubai - Vietnamese Cuisine',
  description: 'Taste the Soul of Vietnam in Dubai Festival City. From Russia with Love, to the Heart of Dubai.',
  keywords: 'Vietnamese restaurant, Dubai, Festival City, Pho, Asian cuisine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SchemaScript />
        {/* Global Providers can go here */}
        {children}
      </body>
    </html>
  )
}
