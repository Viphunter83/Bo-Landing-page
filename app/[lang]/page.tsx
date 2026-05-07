'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Utensils } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import VibeCheck from '../components/VibeCheck'
import SmartMenu from '../components/SmartMenu'
import SocialProof from '../components/SocialProof'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import FloatingChat from '../components/FloatingChat'
import BookingModal from '../components/BookingModal'
import FullMenuModal from '../components/FullMenuModal'
import DishModal from '../components/DishModal'
import JsonLd from '../components/JsonLd'
import PulseTicker from '../components/PulseTicker'
import CartDrawer from '../components/CartDrawer'
import CartTrigger from '../components/CartTrigger'
import { tenantConfig } from '../lib/config/tenant'

import { content } from '../data/content'
import { getMenuItemById } from '../data/menuData'

export default function Home({
  params: { lang },
  searchParams
}: {
  params: { lang: string }
  searchParams: { vibe?: string }
}) {
  // const [lang, setLang] = useState('en') // Handled by URL now
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
      // @ts-ignore
      window.addEventListener('open-booking', handleOpenBooking)
      // @ts-ignore
      return () => window.removeEventListener('open-booking', handleOpenBooking)
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

  // Sync URL when vibe changes
  const handleVibeChange = (vibe: string) => {
    setActiveVibe(vibe)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('vibe', vibe)
    window.history.pushState({}, '', url)
  }

  // Generate FAQ Schema from tenantConfig
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tenantConfig.content.faq.map(item => ({
      "@type": "Question",
      // @ts-ignore
      "name": item.question[lang] || item.question.en,
      "acceptedAnswer": {
        "@type": "Answer",
        // @ts-ignore
        "text": item.answer[lang] || item.answer.en
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
          t={content[lang as keyof typeof content]}
          onBookClick={handleBookClick}
        />

        <main>
          <Hero
            lang={lang}
            t={content[lang as keyof typeof content]}
            onBookClick={handleBookClick}
            onMenuClick={handleMenuClick}
            heroImage={siteSettings.heroImage}
            heroTitle={siteSettings.heroTitle}
            heroSub={siteSettings.heroSub}
          />
          <VibeCheck
            lang={lang}
            t={content[lang as keyof typeof content]}
            activeVibe={activeVibe}
            setActiveVibe={handleVibeChange}
          />
          <SmartMenu
            lang={lang}
            t={content[lang as keyof typeof content]}
            onDishClick={handleDishClick}
            onFullMenuClick={handleMenuClick}
            activeVibe={activeVibe}
          />
          <SocialProof
            t={content[lang as keyof typeof content]}
            images={siteSettings.socialImages}
          />
          <FAQ lang={lang} />
          <FloatingChat lang={lang} activeVibe={activeVibe} onVibeChange={handleVibeChange} />
        </main>

        <Footer lang={lang} t={content[lang as keyof typeof content]} />

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden">
          <button
            onClick={handleBookClick}
            data-booking-trigger
            className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold shadow-2xl shadow-primary/50 flex items-center justify-center gap-2"
          >
            <Utensils size={18} /> {content[lang as keyof typeof content].nav.book}
          </button>
        </div>
      </div>

      {/* Modals outside main container */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        lang={lang}
        t={content[lang as keyof typeof content]}
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
