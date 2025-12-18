'use client'

import { ExternalLink, ShoppingBag } from 'lucide-react'

interface DeliveryServicesProps {
  lang: string
}

export default function DeliveryServices({ lang }: DeliveryServicesProps) {
  const isRTL = lang === 'ar'

  const deliveryServices = [
    {
      name: 'Zomato',
      nameRu: 'Zomato',
      nameAr: 'زوماتو',
      url: 'https://www.zomato.com/dubai/bo-dubai-festival-city',
      color: 'bg-red-600 hover:bg-red-700',
      icon: '🍽️'
    },
    {
      name: 'Talabat',
      nameRu: 'Talabat',
      nameAr: 'طلبات',
      url: 'https://www.talabat.com/uae/restaurant/bo-dubai',
      color: 'bg-green-600 hover:bg-green-700',
      icon: '🚴'
    },
    {
      name: 'Deliveroo',
      nameRu: 'Deliveroo',
      nameAr: 'دليفرو',
      url: 'https://deliveroo.ae/restaurants/dubai/bo-dubai',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '🛵'
    },
    {
      name: 'Careem',
      nameRu: 'Careem',
      nameAr: 'كريم',
      url: 'https://www.careem.com/en-ae/food/restaurant/bo-dubai',
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: '🚗'
    }
  ]

  const title = lang === 'en' 
    ? 'Order Online' 
    : lang === 'ru' 
    ? 'Заказать онлайн' 
    : 'اطلب عبر الإنترنت'

  return (
    <div className={`bg-zinc-800 rounded-xl p-6 border border-zinc-700 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center gap-3 mb-4">
        <ShoppingBag className="text-yellow-500" size={24} />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">
        {lang === 'en' 
          ? 'Order your favorite Vietnamese dishes through our delivery partners'
          : lang === 'ru'
          ? 'Закажите ваши любимые вьетнамские блюда через наших партнеров по доставке'
          : 'اطلب أطباقك الفيتنامية المفضلة من خلال شركائنا في التوصيل'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {deliveryServices.map((service) => (
          <a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${service.color} text-white px-4 py-3 rounded-lg font-bold transition-all hover:scale-105 flex items-center justify-between gap-2 shadow-lg`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{service.icon}</span>
              <span className="text-sm">
                {lang === 'en' ? service.name : lang === 'ru' ? service.nameRu : service.nameAr}
              </span>
            </div>
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
    </div>
  )
}


