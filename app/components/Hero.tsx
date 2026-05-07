'use client'

import { MapPin, ChevronRight, Utensils } from 'lucide-react'
import Image from 'next/image'

interface HeroProps {
  t: any
  lang: string
  onBookClick: () => void
  onMenuClick: () => void
  heroImage?: string
  heroTitle?: string
  heroSub?: string
}

import { tenantConfig } from '../lib/config/tenant'

interface HeroProps {
  t: any
  lang: string
  onBookClick: () => void
  onMenuClick: () => void
  heroImage?: string
  heroTitle?: string
  heroSub?: string
}

export default function Hero({ t, lang, onBookClick, onMenuClick, heroImage, heroTitle, heroSub }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage || tenantConfig.brand.ogImage}
          alt={tenantConfig.brand.name}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <div className={`relative z-10 container mx-auto px-6 mt-20 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-1 rounded-full text-sm font-bold mb-6 border border-secondary/30 backdrop-blur-sm animate-pulse">
          <MapPin size={14} /> {t.hero.location}
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-foreground leading-[0.9] mb-6">
          {t.hero.tagline.split(' ').map((word: string, i: number) => (
            <span key={i} className={i === 1 || i === 4 ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60" : ""}>{word} </span>
          ))}
        </h1>

        <p className="text-muted-foreground text-lg md:text-2xl max-w-2xl mb-10 font-light border-l-4 border-secondary pl-4">
          {t.hero.sub}
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          {tenantConfig.features.enableBooking && (
            <button
              onClick={onBookClick}
              data-booking-trigger
              className="bg-primary hover:opacity-90 text-primary-foreground px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] flex items-center justify-center gap-2"
            >
              {t.hero.cta} <ChevronRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
            </button>
          )}
          <button
            onClick={onMenuClick}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <Utensils size={18} /> {t.nav.menu}
          </button>
        </div>
      </div>
    </div>
  )
}

