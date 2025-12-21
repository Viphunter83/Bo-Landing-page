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

export default function Hero({ t, lang, onBookClick, onMenuClick, heroImage, heroTitle, heroSub }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage || "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=2600&q=80"}
          alt="Dark Moody Vietnamese Food"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      </div>

      <div className={`relative z-10 container mx-auto px-6 mt-20 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold mb-6 border border-yellow-500/30 backdrop-blur-sm animate-pulse">
          <MapPin size={14} /> {t.hero.location}
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-6">
          {t.hero.tagline.split(' ').map((word: string, i: number) => (
            <span key={i} className={i === 1 || i === 4 ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600" : ""}>{word} </span>
          ))}
        </h1>

        <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mb-10 font-light border-l-4 border-yellow-500 pl-4">
          {t.hero.sub}
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onBookClick}
            data-booking-trigger
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
          >
            {t.hero.cta} <ChevronRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
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

