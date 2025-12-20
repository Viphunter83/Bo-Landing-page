'use client'

import { useState } from 'react'
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
import DubaiPulseTicker from '../components/DubaiPulseTicker'
import CartDrawer from '../components/CartDrawer'
import { CartProvider } from '../context/CartContext'
import { content } from '../data/content'
import { faqData } from '../data/faqData'
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
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<string | null>(null)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const handleDishClick = (dishId: string) => {
    setSelectedDish(dishId)
  }

  const handleBookClick = () => {
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

  // Generate FAQ Schema
  const currentFaq = faqData[lang as keyof typeof faqData] || faqData.en
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": currentFaq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <CartProvider>
      <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white`} dir={dir}>
        <CartDrawer lang={lang} />
        <JsonLd data={faqSchema} />
        <DubaiPulseTicker lang={lang} />
        <Navbar
          lang={lang}
          t={content[lang as keyof typeof content]}
          onBookClick={handleBookClick}
        />
        <Hero
          lang={lang}
          t={content[lang as keyof typeof content]}
          onBookClick={handleBookClick}
          onMenuClick={handleMenuClick}
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
        <SocialProof t={content[lang as keyof typeof content]} />
        <FAQ lang={lang} />
        <FloatingChat lang={lang} activeVibe={activeVibe} onVibeChange={handleVibeChange} />
        <Footer lang={lang} t={content[lang as keyof typeof content]} />

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden">
          <button
            onClick={handleBookClick}
            data-booking-trigger
            className="w-full bg-red-600 text-white py-4 rounded-full font-bold shadow-2xl shadow-red-900/50 flex items-center justify-center gap-2"
          >
            <Utensils size={18} /> {content[lang as keyof typeof content].nav.book}
          </button>
        </div>

        {/* Modals */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          lang={lang}
          t={content[lang as keyof typeof content]}
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
      </div>
    </CartProvider >
  )
}
