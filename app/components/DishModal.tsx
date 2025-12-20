import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { X, Clock, Flame, Leaf, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
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
  const { addToCart, toggleCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !dish) return null

  const isRTL = lang === 'ar'
  const name = lang === 'en' ? dish.name : lang === 'ru' ? dish.nameRu : dish.nameAr
  const desc = lang === 'en' ? dish.desc : lang === 'ru' ? dish.descRu : dish.descAr
  const tag = dish.tag && (lang === 'en' ? dish.tag : lang === 'ru' ? dish.tagRu : dish.tagAr)

  const handleAddToCart = () => {
    addToCart(dish, quantity)
    onClose()
    toggleCart() // Open cart to show item
  }

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

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-zinc-800 items-center">
            {/* Quantity */}
            <div className="flex items-center gap-3 bg-zinc-800 rounded-full p-2 h-14">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-zinc-700 rounded-full transition"><Minus size={18} /></button>
              <span className="w-8 text-center font-bold text-xl">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-zinc-700 rounded-full transition"><Plus size={18} /></button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full font-bold transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              {lang === 'en' ? 'Add to Order' : lang === 'ru' ? 'Добавить в заказ' : 'أضف إلى الطلب'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

