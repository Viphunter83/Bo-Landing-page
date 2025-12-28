'use client'

import { ExternalLink, ShoppingBag } from 'lucide-react'

interface DeliveryServicesProps {
  lang: string
}

export default function DeliveryServices({ lang }: DeliveryServicesProps) {
  const isRTL = lang === 'ar'

  const deliveryServices = [
    {
      name: 'Talabat',
      nameRu: 'Talabat',
      nameAr: 'طلبات',
      url: 'https://www.talabat.com/uae/restaurant/bo-dubai',
      // Orange Brand
      style: 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]',
      icon: '🚴'
    },
    {
      name: 'Deliveroo',
      nameRu: 'Deliveroo',
      nameAr: 'دليفرو',
      url: 'https://deliveroo.ae/restaurants/dubai/bo-dubai',
      // Teal Brand
      style: 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white hover:border-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]',
      icon: '🛵'
    },
    {
      name: 'Careem',
      nameRu: 'Careem',
      nameAr: 'كريم',
      url: 'https://www.careem.com/en-ae/food/restaurant/bo-dubai',
      // Green Brand
      style: 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]',
      icon: '🚗'
    },
    {
      name: 'Zomato',
      nameRu: 'Zomato',
      nameAr: 'زوماتو',
      url: 'https://www.zomato.com/dubai/bo-dubai-festival-city',
      // Red Brand
      style: 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      icon: '🍽️'
    }
  ]

  const title = lang === 'en'
    ? 'Order Online'
    : lang === 'ru'
      ? 'Заказать онлайн'
      : 'اطلب عبر الإنترنت'

  return (
    <div className={`relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 shadow-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/10">
          <ShoppingBag className="text-yellow-500" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-zinc-500 text-xs">
            {lang === 'en' ? 'Fast delivery to your door' : (lang === 'ru' ? 'Быстрая доставка до двери' : 'توصيل سريع لبابك')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {deliveryServices.map((service) => (
          <a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                group relative flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300
                ${service.style}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
              <span className="text-sm font-bold tracking-wide">
                {lang === 'en' ? service.name : lang === 'ru' ? service.nameRu : service.nameAr}
              </span>
            </div>
            <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
          </a>
        ))}
      </div>
    </div>
  )
}


