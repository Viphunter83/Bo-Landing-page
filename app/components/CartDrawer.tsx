'use client'

import { useCart } from '../context/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2, Send } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTACT_INFO } from '../data/contact'

import { useState } from 'react'
import { createOrder } from '../lib/db/orders'

export default function CartDrawer({ lang }: { lang: string }) {
    const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total } = useCart()

    const sendOrderToAdmin = async (platform: 'WhatsApp' | 'Telegram') => {
        try {
            // 1. Save to DB (Fire and Forget for UI speed, but await for reliability if needed)
            // We don't await strictly to keep UI snappy, but here it's fast enough.
            createOrder({
                items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                total: `${total} AED`,
                platform,
                status: 'new'
            })

            // 2. Notify Admin via Telegram Bot
            const orderItems = items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join('\n')

            await fetch('/api/notifications/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pickup', // Defaulting to pickup/web order
                    source: 'web',
                    name: 'Online Customer',
                    phone: platform, // Indicating which platform they used
                    items: orderItems,
                    total: `${total} AED`
                })
            })
        } catch (e) {
            console.error('Failed to notify admin', e)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[70] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="text-yellow-500" />
                                {lang === 'ru' ? 'Ваш заказ' : (lang === 'ar' ? 'طلبك' : 'Your Order')}
                                <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full">
                                    {items.length}
                                </span>
                            </h2>
                            <button onClick={toggleCart} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                                    <ShoppingBag size={48} className="opacity-20" />
                                    <p>{lang === 'ru' ? 'Корзина пуста' : (lang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty')}</p>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-white text-sm">
                                                    {lang === 'ru' ? item.nameRu : (lang === 'ar' ? item.nameAr : item.name)}
                                                </h3>
                                                <span className="text-yellow-500 font-bold text-sm">{item.price}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mb-3 line-clamp-1">
                                                {item.ingredients?.join(', ')}
                                            </p>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-700/50 rounded hover:bg-zinc-700 transition"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-700/50 rounded hover:bg-zinc-700 transition"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-auto text-red-500/50 hover:text-red-500 p-2 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-md space-y-4">
                                <div className="flex justify-between items-center text-zinc-400 text-sm">
                                    <span>{lang === 'ru' ? 'Итого' : (lang === 'ar' ? 'المجموع' : 'Subtotal')}</span>
                                    <span className="text-white font-bold text-lg">{total} AED</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* WhatsApp Button */}
                                    <button
                                        onClick={() => {
                                            sendOrderToAdmin('WhatsApp')
                                            const orderText = items.map(i => `${i.quantity}x ${i.name} (${i.price})`).join('%0A')
                                            const totalText = `Total: ${total} AED`
                                            const customerMsg = `Hi Bo! I would like to order:%0A%0A${orderText}%0A%0A${totalText}%0A%0APlease confirm! 🍜`
                                            window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${customerMsg}`, '_blank')
                                        }}
                                        className="bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span>WhatsApp</span>
                                    </button>

                                    {/* Telegram Button */}
                                    <button
                                        onClick={() => {
                                            sendOrderToAdmin('Telegram')
                                            const orderText = items.map(i => `${i.quantity}x ${i.name} (${i.price})`).join('\n')
                                            const totalText = `Total: ${total} AED`
                                            const fullMsg = `Hi Bo! I would like to order:\n\n${orderText}\n\n${totalText}\n\nPlease confirm! 🍜`

                                            // Copy to clipboard first because TG ignores text param often
                                            navigator.clipboard.writeText(fullMsg).then(() => {
                                                alert(lang === 'ru' ? 'Заказ скопирован! Вставьте его в чат.' : 'Order copied! Paste it in the chat.')
                                                window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
                                            })
                                        }}
                                        className="bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span>Telegram</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    )
}
