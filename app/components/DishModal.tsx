'use client'

import { X, Clock, Flame, Leaf, Heart } from 'lucide-react'
import Image from 'next/image'
import { MenuItem } from '../data/menuData'
import DeliveryServices from './DeliveryServices'

interface DishModalProps {
  isOpen: boolean
  onClose: () => void
  dish: MenuItem | null
  lang: string
}

export default function DishModal({ isOpen, onClose, dish, lang }: DishModalProps) {
  if (!isOpen || !dish) return null

  const isRTL = lang === 'ar'
  const name = lang === 'en' ? dish.name : lang === 'ru' ? dish.nameRu : dish.nameAr
  const desc = lang === 'en' ? dish.desc : lang === 'ru' ? dish.descRu : dish.descAr
  const tag = dish.tag && (lang === 'en' ? dish.tag : lang === 'ru' ? dish.tagRu : dish.tagAr)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-zinc-900 rounded-2xl max-w-4xl w-full my-8 border border-yellow-500/20 ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-yellow-500 transition-colors p-2 hover:bg-zinc-800 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Image */}
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={dish.image}
            alt={name}
            fill
            className="object-cover rounded-t-2xl"
            onError={(e) => {
              // Fallback to a default image if the image fails to load
              const target = e.target as HTMLImageElement
              target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-t-2xl" />
          {tag && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              {tag}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{name}</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-2xl font-bold text-yellow-400">{dish.price}</span>
              {dish.spicy && (
                <div className="flex items-center gap-1 text-red-500">
                  <Flame size={18} />
                  <span className="text-sm font-medium">
                    {lang === 'en' ? 'Spicy' : lang === 'ru' ? 'Острое' : 'حار'}
                  </span>
                </div>
              )}
              {dish.vegetarian && (
                <div className="flex items-center gap-1 text-green-500">
                  <Leaf size={18} />
                  <span className="text-sm font-medium">
                    {lang === 'en' ? 'Vegetarian' : lang === 'ru' ? 'Вегетарианское' : 'نباتي'}
                  </span>
                </div>
              )}
              {dish.glutenFree && (
                <div className="flex items-center gap-1 text-blue-500">
                  <Heart size={18} />
                  <span className="text-sm font-medium">
                    {lang === 'en' ? 'Gluten Free' : lang === 'ru' ? 'Без глютена' : 'خال من الغلوتين'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">{desc}</p>

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-3">
                {lang === 'en' ? 'Ingredients' : lang === 'ru' ? 'Ингредиенты' : 'المكونات'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-sm border border-zinc-700"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Services */}
          <div className="mb-6">
            <DeliveryServices lang={lang} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              {lang === 'en' ? 'Close' : lang === 'ru' ? 'Закрыть' : 'إغلاق'}
            </button>
            <button
              onClick={() => {
                // Scroll to booking section or open booking modal
                const bookingBtn = document.querySelector('[data-booking-trigger]')
                if (bookingBtn) {
                  (bookingBtn as HTMLElement).click()
                }
                onClose()
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-red-600/30"
            >
              {lang === 'en' ? 'Book a Table' : lang === 'ru' ? 'Забронировать стол' : 'احجز طاولة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

