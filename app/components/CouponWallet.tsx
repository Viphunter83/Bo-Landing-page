'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Gift, Clock, AlertCircle, Loader2, Check, Copy, Send } from 'lucide-react'
import { useTelegram } from '../context/TelegramContext'
import { getUserCoupons } from '../lib/coupons'
import { Coupon } from '../lib/types/marketing'

interface CouponWalletProps {
    isOpen: boolean
    onClose: () => void
    onSelect?: (code: string) => void
}

export default function CouponWallet({ isOpen, onClose, onSelect }: CouponWalletProps) {
    const { user, isTelegram } = useTelegram()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string>('')
    const [referralCode, setReferralCode] = useState<string>('')

    useEffect(() => {
        // Resolve User ID (Same logic as ShakeGame)
        let uid = user?.id?.toString()
        if (!uid && typeof window !== 'undefined') {
            uid = localStorage.getItem('bo_guest_id') || ''
        }
        setUserId(uid || '')
    }, [user])

    // Load Referral Code
    useEffect(() => {
        if (!userId || !isOpen) return

        fetch('/api/marketing/referral', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                name: user?.first_name || 'Friend'
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.code) setReferralCode(data.code)
            })
            .catch(err => console.error("Failed to load referral code", err))
    }, [userId, isOpen, user])

    useEffect(() => {
        const fetchCoupons = async () => {
            setLoading(true)
            try {
                const list = await getUserCoupons(userId)
                setCoupons(list)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen && userId) {
            fetchCoupons()
        }
    }, [isOpen, userId])

    const formatDate = (date: any) => {
        if (!date) return 'No stats'
        // Handle Firestore Timestamp or Date
        const d = date.toDate ? date.toDate() : new Date(date)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }

    const isExpiringSoon = (date: any) => {
        if (!date) return false
        const d = date.toDate ? date.toDate() : new Date(date)
        const diff = d.getTime() - new Date().getTime()
        const days = diff / (1000 * 60 * 60 * 24)
        return days < 2 && days > 0
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10020]" onClick={onClose} />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl border-t border-zinc-800 z-[10021] h-[85vh] flex flex-col pt-2"
                    >
                        {/* Handle */}
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto my-4" />

                        {/* Header */}
                        <div className="px-6 pb-6 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                    <Wallet className="text-yellow-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">My Wallet</h2>
                                    <p className="text-zinc-400 text-xs">
                                        {coupons.length} Active Coupons
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 transition-colors">
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">

                            {/* NEW: Referral Banner */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 shadow-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-white text-lg">INVITE & EARN</h3>
                                        <div className="bg-white/20 p-1.5 rounded-lg">
                                            <Gift size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-indigo-100 text-xs mb-4 max-w-[80%]">
                                        Share your secret code. Friends get <span className="font-bold text-white">50 AED</span>, you get <span className="font-bold text-white">50 AED</span> after their first order!
                                    </p>

                                    {/* Code Display */}
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                            <code className="font-mono font-bold text-white tracking-widest">
                                                {referralCode || 'LOADING...'}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(referralCode)
                                                    // Simple alert or toast if available, otherwise just feedback
                                                }}
                                                className="text-indigo-200 hover:text-white"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <a
                                            href={`https://t.me/share/url?url=${encodeURIComponent(`https://bo.app/start?ref=${referralCode}`)}&text=${encodeURIComponent('🎁 50 AED gift for you at Bo Dubai! Best Bun Bo Hue in town. 🍜')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-white text-indigo-600 font-bold px-4 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors"
                                        >
                                            <Send size={18} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-2">Your Coupons</h3>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                    <Loader2 className="animate-spin mb-4" />
                                    <p>Loading your loot...</p>
                                </div>
                            ) : coupons.length > 0 ? (
                                coupons.map((coupon) => (
                                    <div
                                        key={coupon.id}
                                        onClick={() => onSelect && onSelect(coupon.code)}
                                        className={`relative group bg-zinc-800/50 border border-white/5 rounded-2xl p-5 overflow-hidden transition-all hover:bg-zinc-800 cursor-pointer ${onSelect ? 'hover:border-yellow-500/50' : ''}`}
                                    >
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded border border-yellow-500/20">
                                                        {coupon.source.replace('_', ' ')}
                                                    </span>
                                                    {isExpiringSoon(coupon.expiresAt) && (
                                                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold animate-pulse">
                                                            <Clock size={10} /> Expiring
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-black text-white mb-1">
                                                    {coupon.value}{typeof coupon.value === 'number' ? '%' : ''} OFF
                                                </h3>
                                                <p className="text-zinc-400 text-xs flex items-center gap-1">
                                                    Min Order {coupon.minOrder} AED
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-mono text-lg font-bold text-zinc-200 bg-black/30 px-3 py-1 rounded-lg border border-white/5 mb-2">
                                                    {coupon.code}
                                                </div>
                                                <div className="text-[10px] text-zinc-500">
                                                    Valid until {formatDate(coupon.expiresAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Action */}
                                        {onSelect && (
                                            <div className="absolute inset-0 bg-yellow-500/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                                <span className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <Check size={16} /> Apply Coupon
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Gift className="text-zinc-600 opacity-50" size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Wallet Empty</h3>
                                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                        Shake your phone or play games to loot coupons!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 bg-zinc-950/50 text-center">
                            <p className="text-[10px] text-zinc-600">
                                Coupons are linked to this device/account. Expires automatically.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
