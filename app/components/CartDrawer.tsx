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

    // Phase 9.6: Delivery UI State
    const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('delivery')
    const [address, setAddress] = useState('')
    const [apartment, setApartment] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('card')
    const [email, setEmail] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)

    const sendOrderToAdmin = async (platform: 'WhatsApp' | 'Telegram') => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // Validation
            if (orderType === 'delivery' && !address) {
                alert(lang === 'ru' ? 'Пожалуйста, введите адрес доставки' : 'Please enter delivery address')
                setIsSubmitting(false)
                return
            }
            // Basic email validation if provided
            if (email && !email.includes('@')) {
                alert(lang === 'ru' ? 'Пожалуйста, введите корректный Email' : 'Please enter valid email')
                setIsSubmitting(false)
                return
            }


            // 1. Construct Message First (Synchronous & Fast)
            const orderItems = items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join(platform === 'WhatsApp' ? '%0A' : '\n')

            let locationText = ''
            if (orderType === 'delivery') {
                const addr = `📍 *Delivery to:* ${address} ${apartment ? `(Apt ${apartment})` : ''}`
                locationText = platform === 'WhatsApp' ? `%0A${addr}` : `\n${addr}`
            } else {
                locationText = platform === 'WhatsApp' ? `%0A🛍️ *Pickup*` : `\n🛍️ *Pickup*`
            }

            const paymentText = platform === 'WhatsApp' ? `%0A💳 Payment: ${paymentMethod}` : `\n💳 Payment: ${paymentMethod}`

            const totalText = `Total: ${total} AED`
            const msgBody = orderItems + locationText + paymentText + (platform === 'WhatsApp' ? `%0A%0A${totalText}` : `\n\n${totalText}`)
            const fullMsg = `Hi Bo! I would like to order:${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}${msgBody}${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}Please confirm! 🍜`

            // 2. Open App IMMEDIATELY (Critical for INP & Popup Blockers)
            if (platform === 'WhatsApp') {
                window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${fullMsg}`, '_blank')
            } else {
                // Clipboard API is async but usually fast. 
                // We chain the window.open to it to ensure flows work, but it might delay slightly suitable for Telegram.
                navigator.clipboard.writeText(fullMsg.replace(/%0A/g, '\n')).then(() => {
                    alert(lang === 'ru' ? 'Заказ скопирован! Вставьте его в чат.' : 'Order copied! Paste it in the chat.')
                    window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
                }).catch(() => {
                    // Fallback if clipboard fails (rare)
                    window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
                })
            }

            // 3. Save to DB & Notify (Background / Fire-and-forget)
            // We do NOT await this to keep the UI responsive.
            createOrder({
                items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                total: `${total} AED`,
                platform,
                status: 'new',
                // New Fields
                type: orderType,
                address,
                apartment,
                paymentMethod,
                email
            }).catch(err => console.error("BG DB Save Error", err))

            // 4. Notifications (Background)
            fetch('/api/notifications/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: orderType,
                    source: 'web',
                    name: 'Online Customer',
                    phone: platform,
                    items: items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join('\n'),
                    total: `${total} AED`,
                    address: orderType === 'delivery' ? `${address} ${apartment}` : undefined,
                    paymentMethod
                })
            }).catch(e => console.error('BG Telegram Error:', e))

            if (email) {
                fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'order',
                        to: email,
                        subject: lang === 'ru' ? 'Ваш заказ в Bo Dubai 🍜' : 'Your Order at Bo Dubai 🍜',
                        data: {
                            items: items.map(i => ({ name: lang === 'ru' ? i.nameRu : i.name, price: i.price, quantity: i.quantity })),
                            total: `${total} AED`,
                            type: orderType,
                            address,
                            apartment
                        }
                    })
                }).catch(err => console.error("BG Email Error", err))
            }

            // Reset UI state
            setTimeout(() => setIsSubmitting(false), 2000)

        } catch (e) {
            console.error('Failed to notify admin', e)
            setIsSubmitting(false)
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
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
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

                            {/* Email Input - New */}
                            <div className="mb-4">
                                <input
                                    type="email"
                                    placeholder={lang === 'ru' ? "Ваш Email (для чека)" : "Your Email (for receipt)"}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 border"
                                />
                            </div>

                            {/* Delivery Toggle */}
                            <div className="bg-zinc-800 p-1 rounded-lg grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => setOrderType('delivery')}
                                    className={`py-2 text-sm font-bold rounded-md transition-all ${orderType === 'delivery' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    🛵 {lang === 'ru' ? 'Доставка' : 'Delivery'}
                                </button>
                                <button
                                    onClick={() => setOrderType('pickup')}
                                    className={`py-2 text-sm font-bold rounded-md transition-all ${orderType === 'pickup' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    🛍️ {lang === 'ru' ? 'Самовывоз' : 'Pickup'}
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                                    <ShoppingBag size={48} className="opacity-20" />
                                    <p>{lang === 'ru' ? 'Корзина пуста' : (lang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty')}</p>
                                </div>
                            ) : (
                                <>
                                    {items.map(item => (
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
                                    ))}

                                    {/* Order Type Specific Inputs */}
                                    {orderType === 'delivery' && (
                                        <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4 animate-in slide-in-from-top-5 fade-in">
                                            <h3 className="font-bold text-white text-sm">
                                                {lang === 'ru' ? 'Адрес доставки' : 'Delivery Address'}
                                            </h3>
                                            <input
                                                type="text"
                                                placeholder={lang === 'ru' ? "Улица, здание..." : "Street, Building..."}
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 border"
                                            />
                                            <input
                                                type="text"
                                                placeholder={lang === 'ru' ? "Квартира / Офис" : "Apartment / Office"}
                                                value={apartment}
                                                onChange={e => setApartment(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 border"
                                            />
                                        </div>
                                    )}

                                    {/* Payment Selector */}
                                    <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4">
                                        <h3 className="font-bold text-white text-sm">
                                            {lang === 'ru' ? 'Способ оплаты' : 'Payment Method'}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`py-2 px-1 text-xs font-bold rounded-md border transition-all ${paymentMethod === 'card'
                                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                                    : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                                            >
                                                💳 {lang === 'ru' ? 'Карта' : 'Card'}
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('cash')}
                                                className={`py-2 px-1 text-xs font-bold rounded-md border transition-all ${paymentMethod === 'cash'
                                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                                    : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                                            >
                                                💵 {lang === 'ru' ? 'Наличные' : 'Cash'}
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('online')}
                                                className={`py-2 px-1 text-xs font-bold rounded-md border transition-all ${paymentMethod === 'online'
                                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                                    : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
                                            >
                                                🔗 {lang === 'ru' ? 'Ссылка' : 'Link'}
                                            </button>
                                        </div>
                                    </div>
                                </>
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
                                        onClick={() => sendOrderToAdmin('WhatsApp')}
                                        disabled={isSubmitting}
                                        className={`bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>WhatsApp</span>
                                    </button>

                                    {/* Telegram Button */}
                                    <button
                                        onClick={() => sendOrderToAdmin('Telegram')}
                                        disabled={isSubmitting}
                                        className={`bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
