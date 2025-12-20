'use client'

import { MapPin, Phone, Instagram, Globe, Clock, Utensils } from 'lucide-react'
import Image from 'next/image'
import DeliveryServices from './DeliveryServices'

interface FooterProps {
  t: any
  lang: string
}

export default function Footer({ t, lang }: FooterProps) {
  return (
    <footer id="location" className="bg-black pt-20 border-t border-zinc-800">
      {/* Delivery Services Section */}
      <div className="container mx-auto px-6 mb-16">
        <DeliveryServices lang={lang} />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div>
          <h2 className="text-4xl font-black text-red-600 mb-6">BO</h2>
          <p className="text-gray-400 mb-6">
            Vietnam Cuisine <br />
            Dubai Energy <br />
            Russian Roots
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/bo_dubai"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://bo-dubai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <MapPin className="text-yellow-500 shrink-0 mt-1" size={18} />
              <span>{t.footer.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="text-yellow-500 shrink-0 mt-1" size={18} />
              <span>{t.footer.hours}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-yellow-500 shrink-0 mt-1" size={18} />
              <a href="tel:+97141234567" className="hover:text-yellow-400 transition-colors">+971 4 123 4567</a>
            </li>
          </ul>
        </div>

        {/* Map (Simulated) */}
        <div className="lg:col-span-2 h-64 bg-zinc-900 rounded-2xl overflow-hidden relative group">
          <Image
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80"
            alt="Map"
            fill
            className="object-cover opacity-50 group-hover:opacity-30 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dubai+Festival+City+Mall+Waterfront"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <MapPin size={18} /> {lang === 'en' ? 'Get Directions' : lang === 'ru' ? 'Маршрут' : 'احصل على الاتجاهات'}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900 py-8 text-center text-gray-400 text-sm">
        {t.footer.rights}
      </div>
    </footer>
  )
}

