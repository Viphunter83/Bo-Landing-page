'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'
import { useTelegram } from '../context/TelegramContext'
import { useTenant } from '../context/TenantContext'

interface NavbarProps {
  lang: string
  t: any
  onBookClick: () => void
}

export default function Navbar({ lang, t, onBookClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isTelegram } = useTelegram()
  const tenantConfig = useTenant()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const brandNameParts = tenantConfig.brand.name.split(' ')
  const mainName = brandNameParts[0]
  const subName = brandNameParts.slice(1).join(' ')

  if (isTelegram) {
    return (
      <nav className="fixed w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter text-primary flex items-center gap-1">
            {mainName.toUpperCase()} <span className="text-muted-foreground text-xs font-normal tracking-widest mt-1 ml-1 uppercase">{subName || 'MINI'}</span>
          </div>
          <LanguageSwitcher current={lang} />
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-lg border-b border-border py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl font-black tracking-tighter text-primary flex items-center gap-1 uppercase">
          {mainName} <span className="text-muted-foreground text-sm font-normal tracking-widest mt-2 ml-1 uppercase">{subName || (tenantConfig.id.split('_')[1]?.toUpperCase() || '')}</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#menu" className="text-foreground/80 hover:text-primary transition-colors font-medium">{t.nav.menu}</a>
          <a href="#location" className="text-foreground/80 hover:text-primary transition-colors font-medium">{t.nav.location}</a>
          <NotificationBell />
          <LanguageSwitcher current={lang} />
          {tenantConfig.features.enableBooking && (
            <button
              onClick={onBookClick}
              data-booking-trigger
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2 rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-primary/30"
            >
              {t.nav.book}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
          <a href="#menu" onClick={() => setIsOpen(false)} className="text-xl text-foreground font-medium">{t.nav.menu}</a>
          <a href="#location" onClick={() => setIsOpen(false)} className="text-xl text-foreground font-medium">{t.nav.location}</a>
          <div className="flex justify-between items-center">
            <NotificationBell />
            <LanguageSwitcher current={lang} />
          </div>
          {tenantConfig.features.enableBooking && (
            <button
              onClick={onBookClick}
              data-booking-trigger
              className="w-full bg-primary py-3 rounded-lg text-primary-foreground font-bold text-lg"
            >
              {t.nav.book}
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

