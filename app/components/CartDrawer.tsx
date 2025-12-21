'use client'

import { useCart } from '../context/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2, Send, Flame } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTACT_INFO } from '../data/contact'

import { useState, useEffect } from 'react'
import { createOrder } from '../lib/db/orders'
import { DeliveryZone } from '../lib/types/delivery'

export default function CartDrawer({ lang }: { lang: string }) {
    const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total, isSurge, clearCart } = useCart()

    // Phase 9.6 & 12: Delivery UI State
    const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('delivery')
    const [address, setAddress] = useState('')
    const [apartment, setApartment] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('card')
    const [email, setEmail] = useState('')

    // Phase 12: Delivery Zones
    const [zones, setZones] = useState<DeliveryZone[]>([])
    const [selectedZoneId, setSelectedZoneId] = useState('')
    const [deliveryFee, setDeliveryFee] = useState(0)

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load Delivery Config (Reload when isSurge changes to get updated fees)
    useEffect(() => {
        if (!isOpen) return
        fetch('/api/delivery/config')
            .then(res => res.json())
            .then(data => {
                if (data.success) setZones(data.zones)
            })
            .catch(console.error)
    }, [isOpen, isSurge])

    // Calculate Delivery Fee
    useEffect(() => {
        if (orderType !== 'delivery' || !selectedZoneId) {
            setDeliveryFee(0)
            return
        }
        const zone = zones.find(z => z.id === selectedZoneId)
        if (zone) {
            // Check for free delivery threshold
            if (zone.freeDeliveryThreshold && total >= zone.freeDeliveryThreshold) {
                setDeliveryFee(0)
            } else {
                setDeliveryFee(zone.fee)
            }
        }
    }, [selectedZoneId, orderType, total, zones])

    const finalTotal = total + deliveryFee

    const [validationError, setValidationError] = useState<string | null>(null)

    const validateOrder = () => {
        setValidationError(null)
        if (orderType === 'delivery') {
            if (!selectedZoneId) return lang === 'ru' ? 'Выберите зону доставки' : 'Select a delivery zone'
            if (!address) return lang === 'ru' ? 'Введите адрес' : 'Enter address'

            const zone = zones.find(z => z.id === selectedZoneId)
            if (zone && total < zone.minOrder) {
                return lang === 'ru'
                    ? `Мин. заказ: ${zone.minOrder} AED`
                    : `Min order: ${zone.minOrder} AED`
            }
        }
        if (email && !email.includes('@')) return lang === 'ru' ? 'Неверный Email' : 'Invalid valid email'
        return null
    }

    const sendOrderToAdmin = async (platform: 'WhatsApp' | 'Telegram') => {
        // 1. Immediate Validation
        const error = validateOrder()
        if (error) {
            setValidationError(error)
            // Auto-clear error after 3s
            setTimeout(() => setValidationError(null), 3000)
            return
        }

        setIsSubmitting(true)

        try {
            // 2. Prepare Message
            const orderItems = items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join(platform === 'WhatsApp' ? '%0A' : '\n')

            let locationText = ''
            if (orderType === 'delivery') {
                // Safe lookup
                const zoneName = zones.find(z => z.id === selectedZoneId)?.name || 'Zone'
                const addr = `📍 *Delivery to:* ${zoneName}, ${address} ${apartment ? `(Apt ${apartment})` : ''}`
                locationText = platform === 'WhatsApp' ? `%0A${addr}` : `\n${addr}`
            } else {
                locationText = platform === 'WhatsApp' ? `%0A🛍️ *Pickup*` : `\n🛍️ *Pickup*`
            }

            const paymentText = platform === 'WhatsApp' ? `%0A💳 Payment: ${paymentMethod}` : `\n💳 Payment: ${paymentMethod}`

            let costsText = `Subtotal: ${total} AED`
            if (deliveryFee > 0) {
                costsText += platform === 'WhatsApp' ? `%0A🛵 Delivery: ${deliveryFee} AED` : `\n🛵 Delivery: ${deliveryFee} AED`
            }
            costsText += platform === 'WhatsApp' ? `%0A*Total: ${finalTotal} AED*` : `\n*Total: ${finalTotal} AED*`

            const msgBody = orderItems + locationText + paymentText + (platform === 'WhatsApp' ? `%0A%0A${costsText}` : `\n\n${costsText}`)
            const fullMsg = `Hi Bo! I would like to order:${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}${msgBody}${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}Please confirm! 🍜`

            // 3. Open App IMMEDIATELY (Critical for iOS)
            // We do NOT wait for anything else.
            if (platform === 'WhatsApp') {
                window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${fullMsg}`, '_blank')
            } else {
                // Best effort copy, but don't block window.open
                navigator.clipboard.writeText(fullMsg.replace(/%0A/g, '\n')).catch(() => { })
                window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
            }

            // 4. Background Tasks (Deferred)
            setTimeout(() => {
                // Parallel execution of non-critical tasks
                const bgTasks = [
                    createOrder({
                        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                        total: `${finalTotal} AED`,
                        platform,
                        status: 'new',
                        type: orderType,
                        address,
                        apartment,
                        paymentMethod,
                        email,
                        deliveryZoneId: selectedZoneId,
                        deliveryFee
                    }),

                    fetch('/api/notifications/telegram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: orderType,
                            source: 'web',
                            name: 'Online Customer',
                            phone: platform,
                            items: items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join('\n'),
                            total: `${finalTotal} AED`,
                            address: orderType === 'delivery' ? `${zones.find(z => z.id === selectedZoneId)?.name}, ${address} ${apartment}` : undefined,
                            paymentMethod,
                            deliveryFee
                        })
                    })
                ]

                // Email is optional check
                if (email) {
                    bgTasks.push(fetch('/api/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'order',
                            to: email,
                            subject: lang === 'ru' ? 'Ваш заказ в Bo Dubai 🍜' : 'Your Order at Bo Dubai 🍜',
                            data: {
                                items: items.map(i => ({ name: lang === 'ru' ? i.nameRu : i.name, price: i.price, quantity: i.quantity })),
                                total: `${finalTotal} AED`,
                                type: orderType,
                                address: orderType === 'delivery' ? `${zones.find(z => z.id === selectedZoneId)?.name}, ${address}` : '',
                                apartment,
                                deliveryFee
                            }
                        })
                    }))
                }

                Promise.allSettled(bgTasks).then(() => {
                    console.log("Background tasks complete")
                    // Clear cart for better UX
                    clearCart()
                    toggleCart() // Close drawer
                })

                // Always reset UI state
                setIsSubmitting(false)
            }, 1000)

        } catch (e) {
            console.error('Critical Error in Order Flow', e)
            // Ensure we reset state even if main crash (unlikely due to try/catch)
            setIsSubmitting(false)
            setValidationError("System Error. Please try again.")
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

                            {isSurge && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 animate-pulse">
                                    <Flame className="text-red-500" size={20} />
                                    <div>
                                        <div className="text-red-500 font-bold text-sm uppercase tracking-wider">High Demand</div>
                                        <div className="text-red-400 text-xs">Delivery fees slightly increased</div>
                                    </div>
                                </div>
                            )}



                            {/* Email Input */}
                            <div className="mb-4">
                                <label htmlFor="email-input" className="sr-only">{lang === 'ru' ? "Ваш Email" : "Your Email"}</label>
                                <input
                                    id="email-input"
                                    type="email"
                                    placeholder={lang === 'ru' ? "Ваш Email (для чека)" : "Your Email (for receipt)"}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 border placeholder:text-zinc-500"
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
                                                <p className="text-xs text-zinc-400 mb-3 line-clamp-1">
                                                    {item.ingredients?.join(', ')}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                                        <button
                                                            aria-label="Decrease quantity"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-700 rounded hover:bg-zinc-600 transition"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                                        <button
                                                            aria-label="Increase quantity"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-700 rounded hover:bg-zinc-600 transition"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        aria-label="Remove item"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="ml-auto text-red-500/80 hover:text-red-500 p-2 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Order Type Specific Inputs & Zones */}
                                    {orderType === 'delivery' && (
                                        <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4 animate-in slide-in-from-top-5 fade-in">
                                            <h3 className="font-bold text-white text-sm">
                                                {lang === 'ru' ? 'Зона доставки' : 'Delivery Zone'}
                                            </h3>
                                            <label htmlFor="delivery-zone" className="sr-only">Delivery Zone</label>
                                            <select
                                                id="delivery-zone"
                                                value={selectedZoneId}
                                                onChange={e => setSelectedZoneId(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 border"
                                            >
                                                <option value="">{lang === 'ru' ? 'Выберите район' : 'Select Area'}</option>
                                                {zones.map(z => (
                                                    <option key={z.id} value={z.id}>
                                                        {z.name} - {z.fee} AED
                                                        {z.freeDeliveryThreshold && ` (Free > ${z.freeDeliveryThreshold})`}
                                                    </option>
                                                ))}
                                            </select>

                                            <h3 className="font-bold text-white text-sm">
                                                {lang === 'ru' ? 'Адрес' : 'Address'}
                                            </h3>
                                            <label htmlFor="address-input" className="sr-only">Address</label>
                                            <input
                                                id="address-input"
                                                type="text"
                                                placeholder={lang === 'ru' ? "Улица, здание..." : "Street, Building..."}
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 border placeholder:text-zinc-500"
                                            />
                                            <label htmlFor="apartment-input" className="sr-only">Apartment</label>
                                            <input
                                                id="apartment-input"
                                                type="text"
                                                placeholder={lang === 'ru' ? "Квартира / Офис" : "Apartment / Office"}
                                                value={apartment}
                                                onChange={e => setApartment(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 border placeholder:text-zinc-500"
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
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-zinc-400 text-sm">
                                        <span>{lang === 'ru' ? 'Сумма' : 'Subtotal'}</span>
                                        <span className="text-white">{total} AED</span>
                                    </div>
                                    {deliveryFee > 0 && (
                                        <div className="flex justify-between items-center text-zinc-400 text-sm">
                                            <span>{lang === 'ru' ? 'Доставка' : 'Delivery'} ({zones.find(z => z.id === selectedZoneId)?.name})</span>
                                            <span className="text-yellow-500">+{deliveryFee} AED</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-zinc-400 text-sm pt-2 border-t border-zinc-800">
                                        <span className="font-bold text-white">{lang === 'ru' ? 'Итого' : (lang === 'ar' ? 'المجموع' : 'Total')}</span>
                                        <span className="text-white font-bold text-lg">{finalTotal} AED</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 relative">
                                    {validationError && (
                                        <div className="absolute -top-10 left-0 w-full bg-red-500/90 text-white text-xs font-bold p-2 rounded text-center animate-in slide-in-from-bottom-2">
                                            {validationError}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => sendOrderToAdmin('WhatsApp')}
                                        disabled={isSubmitting}
                                        className={`bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>WhatsApp</span>
                                    </button>

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
