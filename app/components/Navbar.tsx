'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useTelegram } from '../context/TelegramContext'

interface NavbarProps {
  lang: string
  t: any
  onBookClick: () => void
}

export default function Navbar({ lang, t, onBookClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isTelegram } = useTelegram()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isTelegram) return null

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl font-black tracking-tighter text-red-600 flex items-center gap-1">
          BO <span className="text-yellow-500 text-sm font-normal tracking-widest mt-2 ml-1">DUBAI</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#menu" className="text-white hover:text-yellow-400 transition-colors font-medium">{t.nav.menu}</a>
          <a href="#location" className="text-white hover:text-yellow-400 transition-colors font-medium">{t.nav.location}</a>
          <LanguageSwitcher current={lang} />
          <button
            onClick={onBookClick}
            data-booking-trigger
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-red-600/30"
          >
            {t.nav.book}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-zinc-800 p-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
          <a href="#menu" onClick={() => setIsOpen(false)} className="text-xl text-white font-medium">{t.nav.menu}</a>
          <a href="#location" onClick={() => setIsOpen(false)} className="text-xl text-white font-medium">{t.nav.location}</a>
          <div className="flex justify-between items-center">
            <LanguageSwitcher current={lang} />
          </div>
          <button
            onClick={onBookClick}
            data-booking-trigger
            className="w-full bg-red-600 py-3 rounded-lg text-white font-bold text-lg"
          >
            {t.nav.book}
          </button>
        </div>
      )}
    </nav>
  )
}

