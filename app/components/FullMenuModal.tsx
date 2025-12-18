'use client'

import { useState } from 'react'
import { X, Search, Filter } from 'lucide-react'
import Image from 'next/image'
import { fullMenu, MenuItem } from '../data/menuData'
import DishModal from './DishModal'

interface FullMenuModalProps {
  isOpen: boolean
  onClose: () => void
  lang: string
  activeVibe?: string
}

export default function FullMenuModal({ isOpen, onClose, lang, activeVibe }: FullMenuModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(activeVibe || 'all')
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null)

  if (!isOpen) return null

  const isRTL = lang === 'ar'

  const categories = [
    { id: 'all', label: lang === 'en' ? 'All' : lang === 'ru' ? 'Все' : 'الكل' },
    { id: 'classic', label: lang === 'en' ? 'Classic' : lang === 'ru' ? 'Классика' : 'كلاسيكي' },
    { id: 'spicy', label: lang === 'en' ? 'Spicy' : lang === 'ru' ? 'Острое' : 'حار' },
    { id: 'fresh', label: lang === 'en' ? 'Fresh' : lang === 'ru' ? 'Свежее' : 'طازج' },
    { id: 'drinks', label: lang === 'en' ? 'Drinks' : lang === 'ru' ? 'Напитки' : 'مشروبات' },
    { id: 'desserts', label: lang === 'en' ? 'Desserts' : lang === 'ru' ? 'Десерты' : 'حلويات' }
  ]

  const filteredMenu = fullMenu.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto">
        <div className="min-h-full flex items-start justify-center p-4 py-8">
          <div className={`bg-zinc-900 rounded-2xl max-w-6xl w-full border border-yellow-500/20 my-auto ${isRTL ? 'text-right' : 'text-left'}`}>
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 z-10 rounded-t-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {lang === 'en' ? 'Full Menu' : lang === 'ru' ? 'Полное Меню' : 'القائمة الكاملة'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'en' ? 'Search dishes...' : lang === 'ru' ? 'Поиск блюд...' : 'ابحث عن الأطباق...'}
                  className={`w-full bg-black border border-zinc-700 rounded-lg ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-3 text-white focus:outline-none focus:border-yellow-500`}
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-6">
              {filteredMenu.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    {lang === 'en' ? 'No dishes found' : lang === 'ru' ? 'Блюда не найдены' : 'لم يتم العثور على أطباق'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenu.map(item => {
                    const name = lang === 'en' ? item.name : lang === 'ru' ? item.nameRu : item.nameAr
                    const desc = lang === 'en' ? item.desc : lang === 'ru' ? item.descRu : item.descAr
                    const tag = item.tag && (lang === 'en' ? item.tag : lang === 'ru' ? item.tagRu : item.tagAr)

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedDish(item)}
                        className="group text-left bg-black border border-zinc-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={item.image}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          {tag && (
                            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                              {tag}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                              {name}
                            </h3>
                            <span className="text-yellow-400 font-bold">{item.price}</span>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2">{desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dish Detail Modal */}
      <DishModal
        isOpen={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        dish={selectedDish}
        lang={lang}
      />
    </>
  )
}

