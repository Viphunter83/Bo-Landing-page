'use client'

import { MapPin, Phone, Instagram, Globe, Clock, Utensils } from 'lucide-react'
import Image from 'next/image'
import DeliveryServices from './DeliveryServices'
import { useTelegram } from '../context/TelegramContext'

import { tenantConfig } from '../lib/config/tenant'

interface FooterProps {
  t: any
  lang: string
}

export default function Footer({ t, lang }: FooterProps) {
  const { isTelegram } = useTelegram()

  const getDirectionsText = {
    en: 'Get Directions',
    ru: 'Маршрут',
    vn: 'Chỉ đường',
    ar: 'احصل على الاتجاهات'
  }

  if (isTelegram) return null

  return (
    <footer id="location" className="bg-background pt-20 border-t border-border">
      {/* Delivery Services Section */}
      {tenantConfig.features.enableDelivery && (
        <div className="container mx-auto px-6 mb-16">
          <DeliveryServices lang={lang} />
        </div>
      )}

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div>
          <h2 className="text-4xl font-black text-primary mb-6 uppercase">{tenantConfig.brand.name.split(' ')[0]}</h2>
          <p className="text-muted-foreground mb-6 whitespace-pre-line">
            {tenantConfig.brand.description[lang as keyof typeof tenantConfig.brand.description]}
          </p>
          <div className="flex gap-4">
            {tenantConfig.contact.socials.instagram && (
              <a
                href={tenantConfig.contact.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram size={20} />
              </a>
            )}
            {tenantConfig.contact.socials.telegram && (
              <a
                href={tenantConfig.contact.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Globe size={20} />
              </a>
            )}
            {tenantConfig.contact.socials.zalo && (
              <a
                href={tenantConfig.contact.socials.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <span className="font-bold text-xs">Zalo</span>
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-foreground font-bold mb-6 text-lg">Contact</h4>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <MapPin className="text-primary shrink-0 mt-1" size={18} />
              <span>{tenantConfig.contact.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="text-primary shrink-0 mt-1" size={18} />
              <span>{t.footer.hours}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-primary shrink-0 mt-1" size={18} />
              <a href={`tel:${tenantConfig.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                {tenantConfig.contact.phone}
              </a>
            </li>
          </ul>
        </div>

        {/* Map (Simulated) */}
        <div className="lg:col-span-2 h-64 bg-muted rounded-2xl overflow-hidden relative group">
          <Image
            src={tenantConfig.brand.ogImage}
            alt="Map"
            fill
            className="object-cover opacity-50 group-hover:opacity-30 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={tenantConfig.contact.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <MapPin size={18} /> {(getDirectionsText as any)[lang] || getDirectionsText.en}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        {t.footer.rights}
      </div>
    </footer>
  )
}

