'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '../../lib/firebase'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { Timer, AlertTriangle, CheckCircle, Gift } from 'lucide-react'

// Basic types for the page
interface CouponData {
    id: string
    code: string
    type: string
    value: string | number
    status: 'active' | 'used' | 'expired'
    redeemedAt?: any
    expiryDate?: any
}

export default function OfferPage() {
    const params = useParams()
    const code = params.code as string

    const [coupon, setCoupon] = useState<CouponData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Redemption State
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [justRedeemed, setJustRedeemed] = useState(false)

    // Timer state for post-redemption countdown (5 mins)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    useEffect(() => {
        if (!code || !db) return

        // Assume we need to find the doc ID first - BUT simplified: 
        // In a real app we'd likely query by code to get ID, then listen to ID.
        // For efficiency, let's create a server action or API to get ID by CODE.
        // OR, just fetch once to find ID, then subscribe.

        const fetchAndSubscribe = async () => {
            try {
                // We'll use our new API for safety or direct query if rules allow.
                // Let's use direct query for now assuming public read on coupons (risky? maybe).
                // Better: creating an internal API to get public coupon data.

                const res = await fetch(`/api/marketing/coupon/get?code=${code}`)
                const data = await res.json()

                if (!data.success) {
                    setError('Invalid or expired coupon link.')
                    setLoading(false)
                    return
                }

                const couponId = data.coupon.id

                // Realtime listener
                const unsub = onSnapshot(doc(db!, 'coupons', couponId), (docSnap) => {
                    if (docSnap.exists()) {
                        const d = { id: docSnap.id, ...docSnap.data() } as CouponData
                        setCoupon(d)

                        // Check if just redeemed (within 5 mins)
                        if (d.status === 'used' && d.redeemedAt) {
                            const redeemedTime = d.redeemedAt.seconds * 1000
                            const now = Date.now()
                            const diff = now - redeemedTime
                            const fiveMin = 5 * 60 * 1000

                            if (diff < fiveMin) {
                                setTimeLeft(Math.max(0, fiveMin - diff))
                            } else {
                                setTimeLeft(0)
                            }
                        }
                    }
                    setLoading(false)
                })

                return unsub
            } catch (e) {
                console.error(e)
                setError('Failed to load offer.')
                setLoading(false)
            }
        }

        fetchAndSubscribe() // cleaning up promise is hard here without helper, assume OK for now

    }, [code])

    // Timer effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1000) return 0
                return prev - 1000
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timeLeft])

    const handleRedeem = async () => {
        if (!coupon) return
        if (!confirm('Activating this coupon will start a 5-minute timer. Only do this in front of staff. Continue?')) return // Native confirm for speed

        setIsRedeeming(true)
        try {
            const res = await fetch('/api/marketing/coupon/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponId: coupon.id })
            })
            const data = await res.json()

            if (data.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#EF4444', '#FCD34D', '#FFFFFF'] // Red, Yellow, White
                })
                setJustRedeemed(true)
            } else {
                alert('Redemption failed: ' + data.error)
            }
        } catch (e) {
            alert('Network error')
        }
        setIsRedeeming(false)
    }

    // Render Helpers
    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000)
        const m = Math.floor(totalSec / 60)
        const s = totalSec % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Magic... ✨</div>
    if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold px-6 text-center">{error}</div>
    if (!coupon) return null

    const isExpired = coupon.status === 'expired' || (coupon.status === 'used' && timeLeft === 0)
    const isUsedRecently = coupon.status === 'used' && timeLeft !== null && timeLeft > 0
    const isActive = coupon.status === 'active'

    return (
        <div 
            className="min-h-screen text-white font-sans selection:bg-primary/30"
            style={{ 
                backgroundColor: `hsl(${tenantConfig.theme.tokens.background})`,
                color: `hsl(${tenantConfig.theme.tokens.foreground})`
            }}
        >
            <main className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden">
                {/* Background Blobs */}
                <div 
                    className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] blur-[100px] rounded-full" 
                    style={{ backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.2)` }}
                />
                <div 
                    className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] blur-[100px] rounded-full" 
                    style={{ backgroundColor: `hsl(${tenantConfig.theme.tokens.accent} / 0.1)` }}
                />

                <div className="relative z-10 flex flex-col flex-1 p-6">
                    {/* Header */}
                    <div className="text-center mb-8 pt-8">
                        <div 
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 border"
                            style={{ 
                                backgroundColor: `hsl(${tenantConfig.theme.tokens.muted})`,
                                borderColor: `hsl(${tenantConfig.theme.tokens.border})`,
                                color: `hsl(${tenantConfig.theme.tokens.mutedForeground})`
                            }}
                        >
                            {tenantConfig.brand.name} Exclusive
                        </div>
                        <h1 className="text-3xl font-black leading-tight uppercase tracking-tight">
                            Your Special<br />
                            <span 
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: `linear-gradient(to right, hsl(${tenantConfig.theme.tokens.primary}), hsl(${tenantConfig.theme.tokens.accent}))` }}
                            >
                                Reward
                            </span>
                        </h1>
                    </div>

                    {/* Card */}
                    <div 
                        className="backdrop-blur-xl border rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center flex-1 min-h-[400px] relative overflow-hidden group"
                        style={{ 
                            backgroundColor: `hsl(${tenantConfig.theme.tokens.card} / 0.8)`,
                            borderColor: `hsl(${tenantConfig.theme.tokens.border})`
                        }}
                    >

                        {/* Status Overlay */}
                        {isExpired && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                <AlertTriangle className="text-destructive w-16 h-16 mb-4" />
                                <h2 className="text-2xl font-bold uppercase" style={{ color: `hsl(${tenantConfig.theme.tokens.mutedForeground})` }}>Expired</h2>
                                <p className="text-sm mt-2" style={{ color: `hsl(${tenantConfig.theme.tokens.mutedForeground})` }}>This offer is no longer valid.</p>
                            </div>
                        )}

                        {isUsedRecently && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm animate-pulse" style={{ backgroundColor: `hsl(${tenantConfig.theme.tokens.primary} / 0.1)` }}>
                                <CheckCircle 
                                    className="w-20 h-20 mb-6" 
                                    style={{ 
                                        color: `hsl(${tenantConfig.theme.tokens.primary})`,
                                        filter: `drop-shadow(0 0 15px hsl(${tenantConfig.theme.tokens.primary} / 0.5))`
                                    }} 
                                />
                                <div className="text-center">
                                    <h2 className="text-3xl font-black mb-2">VALID</h2>
                                    <p className="font-bold text-5xl font-mono tracking-wider" style={{ color: `hsl(${tenantConfig.theme.tokens.primary})` }}>
                                        {formatTime(timeLeft!)}
                                    </p>
                                    <p className="text-xs mt-4 uppercase tracking-widest" style={{ color: `hsl(${tenantConfig.theme.tokens.mutedForeground})` }}>Show this to staff</p>
                                </div>
                            </div>
                        )}


                        {/* Offer Content */}
                        <div className={`transition-all duration-500 ${!isActive ? 'blur-sm opacity-50 grayscale' : ''}`}>
                            <div 
                                className="w-24 h-24 rounded-2xl rotate-3 flex items-center justify-center mb-8 mx-auto shadow-lg"
                                style={{ 
                                    backgroundImage: `linear-gradient(to bottom right, hsl(${tenantConfig.theme.tokens.primary}), hsl(${tenantConfig.theme.tokens.accent}))`,
                                    boxShadow: `0 10px 15px -3px hsl(${tenantConfig.theme.tokens.primary} / 0.2)`
                                }}
                            >
                                <Gift className="text-white w-12 h-12" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: `hsl(${tenantConfig.theme.tokens.mutedForeground})` }}>You Received</h2>
                                <div className="text-5xl font-black">
                                    {coupon.type === 'discount_percentage' ? `${coupon.value}% OFF` :
                                        coupon.type === 'discount_fixed' ? `${tenantConfig.localization.currency.symbol}${coupon.value} OFF` :
                                            coupon.value}
                                </div>
                                <p 
                                    className="font-medium text-lg pt-2 border-t mt-6 inline-block w-full"
                                    style={{ 
                                        color: `hsl(${tenantConfig.theme.tokens.accent})`,
                                        borderColor: `hsl(${tenantConfig.theme.tokens.border})`
                                    }}
                                >
                                    Valid for Dine-in Only
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8">
                        {isActive && (
                            <div className="space-y-4">
                                <div 
                                    className="p-4 border rounded-xl flex items-start gap-3"
                                    style={{ 
                                        backgroundColor: `hsl(${tenantConfig.theme.tokens.destructive} / 0.1)`,
                                        borderColor: `hsl(${tenantConfig.theme.tokens.destructive} / 0.3)`
                                    }}
                                >
                                    <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs leading-relaxed" style={{ color: `hsl(${tenantConfig.theme.tokens.destructiveForeground})` }}>
                                        <strong>Stop!</strong> Only activate this button when you are at the restaurant and ready to pay. The coupon will expire 5 minutes after activation.
                                    </p>
                                </div>

                                <button
                                    onClick={handleRedeem}
                                    disabled={isRedeeming}
                                    className="w-full font-black py-5 rounded-2xl text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-wait"
                                    style={{ 
                                        backgroundColor: `hsl(${tenantConfig.theme.tokens.primaryForeground})`,
                                        color: `hsl(${tenantConfig.theme.tokens.primary})`,
                                    }}
                                >
                                    {isRedeeming ? 'Validating...' : 'ACTIVATE NOW'}
                                </button>
                            </div>
                        )}

                        {!isActive && !isUsedRecently && (
                            <button 
                                className="w-full font-bold py-4 rounded-xl cursor-not-allowed border"
                                style={{ 
                                    backgroundColor: `hsl(${tenantConfig.theme.tokens.muted})`,
                                    borderColor: `hsl(${tenantConfig.theme.tokens.border})`,
                                    color: `hsl(${tenantConfig.theme.tokens.mutedForeground})`
                                }}
                            >
                                Offer Closed
                            </button>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] uppercase font-mono tracking-widest" style={{ color: `hsl(${tenantConfig.theme.tokens.mutedForeground})` }}>
                            Code: {coupon.code} • ID: {coupon.id.slice(0, 6)}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
