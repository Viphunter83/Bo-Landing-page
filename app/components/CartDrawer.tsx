'use client'

import { useCart } from '../context/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2, Flame, Wallet, Gift } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import CouponWallet from './CouponWallet'
import { getCouponByCode } from '../lib/coupons'

import { useState, useEffect } from 'react'
import { createOrder } from '../lib/db/orders'
import { DeliveryZone } from '../lib/types/delivery'
import { useTenant } from '../context/TenantContext'

export default function CartDrawer({ lang }: { lang: string }) {
    const tenantConfig = useTenant()
    const { items, isOpen, toggleCart, updateQuantity, removeFromCart, total, isSurge, clearCart, tableNumber } = useCart()

    const currencySymbol = tenantConfig.localization.currency.symbol

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

    // Wallet State
    const [isWalletOpen, setIsWalletOpen] = useState(false)

    // Force Dine-in if Table is set
    useEffect(() => {
        if (tableNumber) {
            setOrderType('dine_in')
        }
    }, [tableNumber])

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

    // Auto-Apply Referral Code
    useEffect(() => {
        if (isOpen && !promoCode && !appliedCouponId) {
            const storedRef = localStorage.getItem(`${tenantConfig.id}_referral_code`)
            if (storedRef) {
                setPromoCode(storedRef)
                applyPromo(storedRef)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // Promo Code State
    const [promoCode, setPromoCode] = useState('')
    const [discount, setDiscount] = useState(0)
    const [promoError, setPromoError] = useState<string | null>(null)
    const [promoSuccess, setPromoSuccess] = useState<string | null>(null)
    const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null)

    const applyPromo = async (codeOverride?: string) => {
        const codeToCheck = codeOverride || promoCode
        setPromoError(null)
        setPromoSuccess(null)
        setDiscount(0)
        setAppliedCouponId(null)

        if (!codeToCheck.trim()) return

        const cleanCode = codeToCheck.trim().toUpperCase()

        // Hardcoded Marketing Deep Links (Example)
        if (cleanCode === 'WELCOME50') {
            setDiscount(50)
            setPromoSuccess(lang === 'ru' ? `Скидка 50 ${currencySymbol} применена!` : `50 ${currencySymbol} Discount Applied!`)
            return
        }

        // DB Coupon Check
        try {
            const coupon = await getCouponByCode(cleanCode)
            if (!coupon) {
                setPromoError(lang === 'ru' ? 'Неверный код' : 'Invalid code')
                return
            }

            if (coupon.status !== 'active') {
                setPromoError(lang === 'ru' ? 'Купон использован или истек' : 'Coupon used or expired')
                return
            }

            if (coupon.minOrder && total < coupon.minOrder) {
                setPromoError(lang === 'ru' ? `Мин. заказ: ${coupon.minOrder} ${currencySymbol}` : `Min order: ${coupon.minOrder} ${currencySymbol}`)
                return
            }

            // Calculate Discount
            let discountValue = 0
            if (coupon.type === 'discount_percentage') {
                discountValue = total * (Number(coupon.value) / 100)
            } else if (coupon.type === 'discount_fixed') {
                discountValue = Number(coupon.value)
            }

            setDiscount(discountValue)
            setAppliedCouponId(coupon.id || null)
            setPromoSuccess(`${coupon.value}${coupon.type === 'discount_percentage' ? '%' : ` ${currencySymbol}`} OFF Applied!`)

        } catch (e) {
            console.error(e)
            setPromoError('Error checking code')
        }
    }

    const finalTotal = Math.max(0, total + deliveryFee - discount)

    const [validationError, setValidationError] = useState<string | null>(null)

    const validateOrder = () => {
        setValidationError(null)
        if (orderType === 'delivery') {
            if (!selectedZoneId) return lang === 'ru' ? 'Выберите зону доставки' : 'Select a delivery zone'
            if (!address) return lang === 'ru' ? 'Введите адрес' : 'Enter address'

            const zone = zones.find(z => z.id === selectedZoneId)
            if (zone && total < zone.minOrder) {
                return lang === 'ru'
                    ? `Мин. заказ: ${zone.minOrder} ${currencySymbol}`
                    : `Min order: ${zone.minOrder} ${currencySymbol}`
            }
        }
        if (email && !email.includes('@')) return lang === 'ru' ? 'Неверный Email' : 'Invalid email'
        return null
    }

    const sendOrderToAdmin = async (platform: 'WhatsApp' | 'Telegram') => {
        const error = validateOrder()
        if (error) {
            setValidationError(error)
            setTimeout(() => setValidationError(null), 3000)
            return
        }

        setIsSubmitting(true)

        try {
            const orderItems = items.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join(platform === 'WhatsApp' ? '%0A' : '\n')

            let locationText = ''
            if (orderType === 'delivery') {
                const zoneName = zones.find(z => z.id === selectedZoneId)?.name || 'Zone'
                const addr = `📍 *Delivery to:* ${zoneName}, ${address} ${apartment ? `(Apt ${apartment})` : ''}`
                locationText = platform === 'WhatsApp' ? `%0A${addr}` : `\n${addr}`
            } else {
                locationText = platform === 'WhatsApp' ? `%0A🛍️ *Pickup*` : `\n🛍️ *Pickup*`
            }

            const paymentText = platform === 'WhatsApp' ? `%0A💳 Payment: ${paymentMethod}` : `\n💳 Payment: ${paymentMethod}`

            let costsText = `Subtotal: ${total} ${currencySymbol}`
            if (deliveryFee > 0) {
                costsText += platform === 'WhatsApp' ? `%0A🛵 Delivery: ${deliveryFee} ${currencySymbol}` : `\n🛵 Delivery: ${deliveryFee} ${currencySymbol}`
            }
            costsText += platform === 'WhatsApp' ? `%0A*Total: ${finalTotal.toFixed(2)} ${currencySymbol}*` : `\n*Total: ${finalTotal.toFixed(2)} ${currencySymbol}*`

            const msgBody = orderItems + locationText + paymentText + (platform === 'WhatsApp' ? `%0A%0A${costsText}` : `\n\n${costsText}`)
            const fullMsg = `Hi ${tenantConfig.brand.name}! I would like to order:${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}${msgBody}${platform === 'WhatsApp' ? '%0A%0A' : '\n\n'}Please confirm! 🍜`

            if (platform === 'WhatsApp') {
                window.open(`https://wa.me/${tenantConfig.contact.whatsapp}?text=${fullMsg}`, '_blank')
            } else {
                navigator.clipboard.writeText(fullMsg.replace(/%0A/g, '\n')).catch(() => { })
                const tgUser = tenantConfig.contact.socials.telegram?.split('/').pop() || ''
                window.open(`https://t.me/${tgUser}`, '_blank')
            }

            setTimeout(() => {
                const bgTasks = [
                    createOrder({
                        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                        total: `${finalTotal.toFixed(2)} ${currencySymbol}`,
                        platform,
                        status: 'new',
                        type: orderType,
                        address,
                        apartment,
                        paymentMethod,
                        email,
                        deliveryZoneId: selectedZoneId,
                        deliveryFee,
                        promoCode: promoCode ? promoCode : undefined,
                        discount: discount > 0 ? discount : undefined
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
                            total: `${finalTotal.toFixed(2)} ${currencySymbol}`,
                            address: orderType === 'delivery' ? `${zones.find(z => z.id === selectedZoneId)?.name}, ${address} ${apartment}` : undefined,
                            paymentMethod,
                            deliveryFee
                        })
                    })
                ]

                if (email) {
                    bgTasks.push(fetch('/api/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'order',
                            to: email,
                            subject: lang === 'ru' ? `Ваш заказ в ${tenantConfig.brand.name} 🍜` : `Your Order at ${tenantConfig.brand.name} 🍜`,
                            data: {
                                items: items.map(i => ({ name: lang === 'ru' ? i.nameRu : i.name, price: i.price, quantity: i.quantity })),
                                total: `${finalTotal.toFixed(2)} ${currencySymbol}`,
                                type: orderType,
                                address: orderType === 'delivery' ? `${zones.find(z => z.id === selectedZoneId)?.name}, ${address}` : '',
                                apartment,
                                deliveryFee
                            }
                        })
                    }))
                }

                Promise.allSettled(bgTasks).then(() => {
                    clearCart()
                    toggleCart()
                })

                setIsSubmitting(false)
            }, 1000)

        } catch (e) {
            console.error('Critical Error in Order Flow', e)
            setIsSubmitting(false)
            setValidationError("System Error. Please try again.")
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[70] flex flex-col shadow-2xl"
                        data-testid="cart-drawer"
                    >
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShoppingBag style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }} />
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

                            <div className="mb-4">
                                <label htmlFor="email-input" className="sr-only">{lang === 'ru' ? "Ваш Email" : "Your Email"}</label>
                                <input
                                    id="email-input"
                                    type="email"
                                    placeholder={lang === 'ru' ? "Ваш Email (для чека)" : "Your Email (for receipt)"}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none border placeholder:text-zinc-500"
                                    style={{ borderColor: `hsl(${tenantConfig.theme.tokens.border})` }}
                                />
                            </div>

                            <div className="bg-zinc-800 p-1 rounded-lg">
                                {tableNumber ? (
                                    <div className="py-2 px-3 text-center rounded-md border" style={{ backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.1)`, borderColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.2)` }}>
                                        <h3 className="font-bold flex items-center justify-center gap-2" style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }}>
                                            🍽️ Dine-in: Table #{tableNumber}
                                        </h3>
                                        <p className="text-zinc-400 text-xs">Ordering directly to your table</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-1">
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
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                                    <ShoppingBag size={48} className="opacity-20" />
                                    <p>{lang === 'ru' ? 'Корзина пуста' : (lang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty')}</p>

                                    {promoSuccess && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mt-4"
                                        >
                                            <Gift size={16} />
                                            {promoSuccess}
                                        </motion.div>
                                    )}
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
                                                    <span className="font-bold text-sm" style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }}>{item.price}</span>
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
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none border focus:border-primary"
                                            >
                                                <option value="">{lang === 'ru' ? 'Выберите район' : 'Select Area'}</option>
                                                {zones.map(z => (
                                                    <option key={z.id} value={z.id}>
                                                        {z.name} - {z.fee} {currencySymbol}
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
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none border placeholder:text-zinc-500"
                                            />
                                            <label htmlFor="apartment-input" className="sr-only">Apartment</label>
                                            <input
                                                id="apartment-input"
                                                type="text"
                                                placeholder={lang === 'ru' ? "Квартира / Офис" : "Apartment / Office"}
                                                value={apartment}
                                                onChange={e => setApartment(e.target.value)}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none border placeholder:text-zinc-500"
                                            />
                                        </div>
                                    )}

                                    <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-white text-sm">
                                                {lang === 'ru' ? 'Промокод' : 'Promo Code'}
                                            </h3>
                                            <button
                                                onClick={() => setIsWalletOpen(true)}
                                                className="text-xs flex items-center gap-1 hover:opacity-80 transition-colors"
                                                style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }}
                                            >
                                                <Wallet size={12} />
                                                <span>{lang === 'ru' ? 'Мои Купоны' : 'My Wallet'}</span>
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder={lang === 'ru' ? 'Введите код' : 'Enter code'}
                                                className="flex-1 bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none border uppercase placeholder:normal-case"
                                            />
                                            <button
                                                onClick={() => applyPromo()}
                                                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                {lang === 'ru' ? 'Применить' : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
                                        {promoSuccess && <p className="text-green-500 text-xs">{promoSuccess}</p>}
                                    </div>

                                    <div className="border-t border-zinc-800 pt-6 mt-6 space-y-4">
                                        <h3 className="font-bold text-white text-sm">
                                            {lang === 'ru' ? 'Способ оплаты' : 'Payment Method'}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className="py-2 px-1 text-xs font-bold rounded-md border transition-all"
                                                style={paymentMethod === 'card' ? { borderColor: `hsl(${tenantConfig.theme.tokens.primary})`, color: `hsl(${tenantConfig.theme.tokens.primary})`, backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.1)` } : { backgroundColor: '#27272a', borderColor: 'transparent', color: '#a1a1aa' }}
                                            >
                                                💳 {lang === 'ru' ? 'Карта' : 'Card'}
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('cash')}
                                                className="py-2 px-1 text-xs font-bold rounded-md border transition-all"
                                                style={paymentMethod === 'cash' ? { borderColor: `hsl(${tenantConfig.theme.tokens.primary})`, color: `hsl(${tenantConfig.theme.tokens.primary})`, backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.1)` } : { backgroundColor: '#27272a', borderColor: 'transparent', color: '#a1a1aa' }}
                                            >
                                                💵 {lang === 'ru' ? 'Наличные' : 'Cash'}
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('online')}
                                                className="py-2 px-1 text-xs font-bold rounded-md border transition-all"
                                                style={paymentMethod === 'online' ? { borderColor: `hsl(${tenantConfig.theme.tokens.primary})`, color: `hsl(${tenantConfig.theme.tokens.primary})`, backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.1)` } : { backgroundColor: '#27272a', borderColor: 'transparent', color: '#a1a1aa' }}
                                            >
                                                🔗 {lang === 'ru' ? 'Ссылка' : 'Link'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-md space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-zinc-400 text-sm">
                                        <span>{lang === 'ru' ? 'Сумма' : 'Subtotal'}</span>
                                        <span className="text-white">{total} {currencySymbol}</span>
                                    </div>
                                    {deliveryFee > 0 && (
                                        <div className="flex justify-between items-center text-zinc-400 text-sm">
                                            <span>{lang === 'ru' ? 'Доставка' : 'Delivery'} ({zones.find(z => z.id === selectedZoneId)?.name})</span>
                                            <span style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }}>+{deliveryFee} {currencySymbol}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-zinc-400 text-sm">
                                            <span>{lang === 'ru' ? 'Скидка' : 'Discount'} ({promoCode})</span>
                                            <span className="text-green-500">-{discount.toFixed(2)} {currencySymbol}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-zinc-400 text-sm pt-2 border-t border-zinc-800">
                                        <span className="font-bold text-white">{lang === 'ru' ? 'Итого' : (lang === 'ar' ? 'المجموع' : 'Total')}</span>
                                        <span className="text-white font-bold text-lg">{finalTotal.toFixed(2)} {currencySymbol}</span>
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
                                        className="bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>WhatsApp</span>
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (paymentMethod === 'online') {
                                                const error = validateOrder()
                                                if (error) {
                                                    setValidationError(error)
                                                    setTimeout(() => setValidationError(null), 3000)
                                                    return
                                                }
                                                setIsSubmitting(true)

                                                try {
                                                    const orderId = await createOrder({
                                                        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                                                        total: `${finalTotal.toFixed(2)} ${currencySymbol}`,
                                                        subtotal: total,
                                                        discount: discount > 0 ? discount : 0,
                                                        promoCode: promoCode.trim().toUpperCase() || null,
                                                        platform: 'Web',
                                                        status: 'new',
                                                        paymentStatus: 'pending',
                                                        type: orderType,
                                                        table: tableNumber || null,
                                                        address: orderType === 'delivery' ? address : null,
                                                        apartment: orderType === 'delivery' ? apartment : null,
                                                        paymentMethod: 'online',
                                                        email,
                                                        deliveryZoneId: selectedZoneId || null,
                                                        deliveryFee
                                                    })

                                                    if (!orderId) throw new Error("Order creation failed")

                                                    const res = await fetch('/api/checkout', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            items: items.map(i => ({
                                                                name: lang === 'ru' ? i.nameRu : i.name,
                                                                price: i.price,
                                                                quantity: i.quantity
                                                            })),
                                                            deliveryFee,
                                                            discount,
                                                            zoneName: zones.find(z => z.id === selectedZoneId)?.name,
                                                            orderId,
                                                            email,
                                                            table: tableNumber || undefined
                                                        })
                                                    })

                                                    const data = await res.json()

                                                    if (!res.ok) {
                                                        throw new Error(data.error || 'Checkout initialization failed')
                                                    }

                                                    if (data.url) {
                                                        window.location.href = data.url
                                                    } else {
                                                        throw new Error('No payment URL received')
                                                    }
                                                } catch (e: any) {
                                                    console.error(e)
                                                    setValidationError(e.message || 'Payment System Error')
                                                    setIsSubmitting(false)
                                                }
                                            } else {
                                                sendOrderToAdmin('Telegram')
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        className="text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: `hsl(${tenantConfig.theme.tokens.primary})` }}
                                    >
                                        <span>{paymentMethod === 'online' ? (lang === 'ru' ? 'Оплатить Онлайн' : 'Pay Now') : 'Telegram'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <CouponWallet
                        isOpen={isWalletOpen}
                        onClose={() => setIsWalletOpen(false)}
                        onSelect={(code) => {
                            setPromoCode(code)
                            applyPromo(code)
                            setIsWalletOpen(false)
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    )
}
