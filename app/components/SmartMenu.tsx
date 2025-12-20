'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getMenuItemById, getMenuByCategory } from '../data/menuData'

interface SmartMenuProps {
  t: any
  lang: string
  onDishClick: (dishId: string) => void
  onFullMenuClick: () => void
  activeVibe?: string
}

import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getInitialTrends } from '../lib/trends'
import { Flame } from 'lucide-react'

export default function SmartMenu({ t, lang, onDishClick, onFullMenuClick, activeVibe }: SmartMenuProps) {
  const [liveData, setLiveData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!db) return // Skip if firebase not init

    // Listen to real-time menu updates
    console.log("Subscribing to menu_items...")
    const unsubscribe = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      console.log("Menu update received!", snapshot.size, "docs")
      const updates: Record<string, any> = {}
      snapshot.forEach((doc) => {
        updates[doc.id] = doc.data()
        console.log("Updated item:", doc.id, doc.data().price)
      })
      setLiveData(updates)
    }, (error) => {
      console.error("Menu snapshot error:", error)
    })
    return () => unsubscribe()
  }, [])
  // Get featured dishes based on active vibe or show default
  const featuredDishes = activeVibe && activeVibe !== 'all'
    ? getMenuByCategory(activeVibe).slice(0, 3)
    : [
      getMenuItemById('pho-bo-special'),
      getMenuItemById('nem-ran'),
      getMenuItemById('mango-shake')
    ].filter(Boolean) as any[]

  return (
    <section id="menu" className="py-24 bg-black relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-2">{t.menu.title}</h2>
            <div className="h-1 w-24 bg-red-600"></div>
          </div>
          <button
            onClick={onFullMenuClick}
            className="text-yellow-500 hover:text-white transition-colors flex items-center gap-2"
          >
            {lang === 'en' ? 'View Full Menu' : lang === 'ru' ? 'Полное Меню' : 'القائمة الكاملة'} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredDishes.map((staticDish, index) => {
            // Merge static data with live data (if available)
            // Use ID from static as key to find update.
            // If live data doesn't exist yet (first load), stick to static.
            const liveItem = liveData[staticDish.id]
            const dish = liveItem ? { ...staticDish, ...liveItem } : staticDish

            // Skip if out of stock (optional, or just show badge)
            // if (dish.stock === 'out_of_stock') return null 

            const name = lang === 'en' ? dish.name : lang === 'ru' ? dish.nameRu : dish.nameAr
            const desc = lang === 'en' ? dish.desc : lang === 'ru' ? dish.descRu : dish.descAr
            const tag = dish.tag && (lang === 'en' ? dish.tag : lang === 'ru' ? dish.tagRu : dish.tagAr)

            return (
              <button
                key={dish.id}
                onClick={() => onDishClick(dish.id)}
                className="group relative text-left block w-full"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative">
                  {tag && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
                      {tag}
                    </div>
                  )}
                  {/* Dynamic Trending Badge */}
                  {!tag && ['pho-bo-special', 'nem-ran'].includes(dish.id) && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1 animate-pulse">
                      <Flame size={12} fill="currentColor" /> {lang === 'ru' ? 'Популярное' : 'Trending'}
                    </div>
                  )}
                  {dish.stock === 'out_of_stock' && (
                    <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
                      <span className="text-red-500 font-black text-3xl -rotate-12 border-4 border-red-500 px-4 py-2 rounded">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  <Image
                    src={dish.image}
                    alt={name}
                    fill
                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${dish.stock === 'out_of_stock' ? 'grayscale' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <div className={`absolute bottom-6 left-6 right-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="flex justify-between items-end mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">{name}</h3>
                      <span className="text-xl font-bold text-yellow-400">{dish.price}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

