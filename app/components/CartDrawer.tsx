'use client'

import { useCart } from '../context/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2, Send } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTACT_INFO } from '../data/contact'

import { useState, useEffect } from 'react'
import { createOrder } from '../lib/db/orders'
import { DeliveryZone } from '../lib/types/delivery'

export default function CartDrawer({ lang }: { lang: string }) {
    const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total } = useCart()

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

    // Load Delivery Config
    useEffect(() => {
        fetch('/api/delivery/config')
            .then(res => res.json())
            .then(data => {
                if (data.success) setZones(data.zones)
            })
            .catch(console.error)
    }, [])

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


    const sendOrderToAdmin = async (platform: 'WhatsApp' | 'Telegram') => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // Validation
            // Validation
            if (orderType === 'delivery') {
                if (!address) {
                    alert(lang === 'ru' ? 'Пожалуйста, введите адрес доставки' : 'Please enter delivery address')
                    setIsSubmitting(false)
                    return
                }
                if (!selectedZoneId) {
                    alert(lang === 'ru' ? 'Пожалуйста, выберите зону доставки' : 'Please select a delivery zone')
                    setIsSubmitting(false)
                    return
                }
                const zone = zones.find(z => z.id === selectedZoneId)
                if (zone && total < zone.minOrder) {
                    alert(lang === 'ru'
                        ? `Минимальный заказ для "${zone.name}": ${zone.minOrder} AED`
                        : `Minimum order for "${zone.name}": ${zone.minOrder} AED`)
                    setIsSubmitting(false)
                    return
                }
            }

            // ... email validation ...
            if (email && !email.includes('@')) {
                // ... existing check
            }


            // 1. Construct Message First (Synchronous & Fast)
            const orderItems = items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join(platform === 'WhatsApp' ? '%0A' : '\n')

            let locationText = ''
            if (orderType === 'delivery') {
                const zoneName = zones.find(z => z.id === selectedZoneId)?.name || ''
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

            // 2. Open App IMMEDIATELY
            // ... (existing window.open logic) ...
            if (platform === 'WhatsApp') {
                window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${fullMsg}`, '_blank')
            } else {
                navigator.clipboard.writeText(fullMsg.replace(/%0A/g, '\n')).then(() => {
                    alert(lang === 'ru' ? 'Заказ скопирован! Вставьте его в чат.' : 'Order copied! Paste it in the chat.')
                    window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
                }).catch(() => {
                    window.open(`https://t.me/${CONTACT_INFO.telegram}`, '_blank')
                })
            }

            // 3. Save to DB & Notify (Background)
            createOrder({
                items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                total: `${finalTotal} AED`, // Save final total
                platform,
                status: 'new',
                type: orderType,
                address,
                apartment,
                paymentMethod,
                email,
                // Delivery Fields
                deliveryZoneId: selectedZoneId,
                deliveryFee
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
                    total: `${finalTotal} AED`,
                    address: orderType === 'delivery' ? `${zones.find(z => z.id === selectedZoneId)?.name}, ${address} ${apartment}` : undefined,
                    paymentMethod,
                    deliveryFee
                })
            }).catch(e => console.error('BG Telegram Error:', e))

            // ... email sending ...
            if (email) {
                // ... existing email fetch ...
                fetch('/api/email/send', {
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
                            deliveryFee // Pass fee to template if supported, or just total
                        }
                    })
                }).catch(err => console.error("BG Email Error", err))
            }

            setTimeout(() => setIsSubmitting(false), 2000)

        } catch (e) {
            // ...
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ... (Backdrop & Drawer wrapper) ... */}
                    <motion.div
                        // ... props ...
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[70] flex flex-col shadow-2xl"
                    >
                        {/* ... (Header & Items) ... */}

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

                                <div className="grid grid-cols-2 gap-3">

                                    {/* Order Type Specific Inputs */}
                                    {orderType === 'delivery' && (
                                        <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4 animate-in slide-in-from-top-5 fade-in">
                                            <h3 className="font-bold text-white text-sm">
                                                {lang === 'ru' ? 'Зона доставки' : 'Delivery Zone'}
                                            </h3>
                                            <select
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
