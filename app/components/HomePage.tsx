'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Utensils } from 'lucide-react'
import Navbar from './Navbar'
import Hero from './Hero'
import VibeCheck from './VibeCheck'
import SmartMenu from './SmartMenu'
import SocialProof from './SocialProof'
import FAQ from './FAQ'
import Footer from './Footer'
import FloatingChat from './FloatingChat'
import BookingModal from './BookingModal'
import FullMenuModal from './FullMenuModal'
import DishModal from './DishModal'
import JsonLd from './JsonLd'
import PulseTicker from './PulseTicker'
import CartDrawer from './CartDrawer'
import CartTrigger from './CartTrigger'
import { tenantConfig } from '../lib/config/tenant'
import { content } from '../data/content'
import { getMenuItemById } from '../data/menuData'

interface HomePageProps {
  lang: string
  searchParams: { vibe?: string }
}

export default function HomePage({ lang, searchParams }: HomePageProps) {
  const [activeVibe, setActiveVibe] = useState(searchParams?.vibe || 'classic')
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingInitialValues, setBookingInitialValues] = useState<{ promoCode?: string } | undefined>(undefined)
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<string | null>(null)

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState<{
    heroImage?: string
    heroTitle?: string
    heroSub?: string
    socialImages?: string[]
  }>({})

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // Listen for global booking events (from ShakeToWin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOpenBooking = (e: CustomEvent) => {
        if (e.detail?.promoCode) {
          setBookingInitialValues({ promoCode: e.detail.promoCode })
        } else {
          setBookingInitialValues(undefined)
        }
        setIsBookingOpen(true)
      }
      window.addEventListener('open-booking', handleOpenBooking as EventListener)
      return () => window.removeEventListener('open-booking', handleOpenBooking as EventListener)
    }
  }, [])

  // Fetch Site Settings (Tenant Aware)
  useEffect(() => {
    if (!db) return
    const fetchSettings = async () => {
      try {
        const docRef = doc(db!, 'site_settings', tenantConfig.id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setSiteSettings(snap.data())
        }
      } catch (e) {
        console.error('Failed to load site settings', e)
      }
    }
    fetchSettings()
  }, [])

  const handleDishClick = (dishId: string) => {
    setSelectedDish(dishId)
  }

  const handleBookClick = () => {
    setBookingInitialValues(undefined)
    setIsBookingOpen(true)
  }

  const handleMenuClick = () => {
    setIsFullMenuOpen(true)
  }

  const handleVibeChange = (vibe: string) => {
    setActiveVibe(vibe)
    const url = new URL(window.location.href)
    url.searchParams.set('vibe', vibe)
    window.history.pushState({}, '', url)
  }

  const langKey = lang as keyof typeof content
  const t = content[langKey] || content.en

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (tenantConfig.content.faq || []).map(item => ({
      "@type": "Question",
      "name": (item.question as any)[lang] || (item.question as any).en,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": (item.answer as any)[lang] || (item.answer as any).en
      }
    }))
  }

  return (
    <>
      <div className={`min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground`} dir={dir}>
        <CartDrawer lang={lang} />
        <CartTrigger />
        <JsonLd data={faqSchema} />
        <PulseTicker lang={lang} />
        <Navbar
          lang={lang}
          t={t}
          onBookClick={handleBookClick}
        />

        <main>
          <Hero
            lang={lang}
            t={t}
            onBookClick={handleBookClick}
            onMenuClick={handleMenuClick}
            heroImage={siteSettings.heroImage}
            heroTitle={siteSettings.heroTitle}
            heroSub={siteSettings.heroSub}
          />
          <VibeCheck
            lang={lang}
            t={t}
            activeVibe={activeVibe}
            setActiveVibe={handleVibeChange}
          />
          <SmartMenu
            lang={lang}
            t={t}
            onDishClick={handleDishClick}
            onFullMenuClick={handleMenuClick}
            activeVibe={activeVibe}
          />
          <SocialProof
            t={t}
            images={siteSettings.socialImages}
          />
          <FAQ lang={lang} />
          <FloatingChat lang={lang} activeVibe={activeVibe} onVibeChange={handleVibeChange} />
        </main>

        <Footer lang={lang} t={t} />

        <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden">
          <button
            onClick={handleBookClick}
            data-booking-trigger
            className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold shadow-2xl shadow-primary/50 flex items-center justify-center gap-2"
          >
            <Utensils size={18} /> {t.nav.book}
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        lang={lang}
        t={t}
        initialValues={bookingInitialValues}
      />
      <FullMenuModal
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        lang={lang}
        activeVibe={activeVibe}
      />
      <DishModal
        isOpen={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        dish={selectedDish ? getMenuItemById(selectedDish) || null : null}
        lang={lang}
      />
    </>
  )
}
