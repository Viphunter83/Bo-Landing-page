'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartTrigger() {
    const { items, toggleCart, isOpen } = useCart()
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    // Don't show if cart is empty or already open
    if (itemCount === 0 || isOpen) return null

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={toggleCart}
                className="fixed bottom-24 right-6 md:bottom-6 z-50 bg-yellow-500 text-black p-4 rounded-full shadow-2xl shadow-yellow-500/20 hover:scale-110 active:scale-95 transition-transform"
            >
                <div className="relative">
                    <ShoppingBag size={24} fill="currentColor" strokeWidth={0} className="text-black" />
                    <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-black" >
                        {itemCount}
                    </span>
                </div>
            </motion.button>
        </AnimatePresence>
    )
}
