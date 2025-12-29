'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Wine, Smartphone, Trophy, Zap, Clock, Wallet } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTelegram } from '../context/TelegramContext'
import { useCart } from '../context/CartContext'
import { checkCooldown, recordGamePlay } from '../lib/db/gamification'
import { createCoupon } from '../lib/coupons'

export default function ShakeToWin() {
    const { isTelegram, user } = useTelegram()
    const { isOpen: isCartOpen } = useCart()

    const [permissionGranted, setPermissionGranted] = useState(false)
    const [showGame, setShowGame] = useState(false)
    const [progress, setProgress] = useState(0) // 0 to 100
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [won, setWon] = useState(false)

    // RPG Logic
    const [canPlay, setCanPlay] = useState(true)
    const [cooldownRemaining, setCooldownRemaining] = useState(0)
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [wonCoupon, setWonCoupon] = useState<{ code: string, value: any } | null>(null)

    // Physics refs
    const lastUpdate = useRef(0)
    const lastX = useRef(0)
    const lastY = useRef(0)
    const lastZ = useRef(0)
    const progressRef = useRef(0)
    const decayInterval = useRef<NodeJS.Timeout | null>(null)

    // Only for iOS 13+
    const [needsPermission, setNeedsPermission] = useState(false)
    const [isDebugMode, setIsDebugMode] = useState(false)

    // Check Identity & Cooldown
    useEffect(() => {
        const initGame = async () => {
            let uid = user?.id?.toString()

            // Guest Logic for Web
            if (!uid) {
                const stored = localStorage.getItem('bo_guest_id')
                if (stored) {
                    uid = stored
                } else {
                    uid = 'guest_' + Math.random().toString(36).substr(2, 9)
                    localStorage.setItem('bo_guest_id', uid)
                }
            }
            setCurrentUserId(uid)

            // Check Cooldown
            const status = await checkCooldown(uid, 'shake_game')
            if (!status.allowed) {
                setCanPlay(false)
                setCooldownRemaining(status.remainingMs)
            } else {
                setCanPlay(true)
            }

            // Debug & Permissions
            if (window.location.hostname === 'localhost') {
                setIsDebugMode(true)
                setPermissionGranted(true)
            }

            if (typeof DeviceMotionEvent !== 'undefined' &&
                // @ts-ignore
                typeof DeviceMotionEvent.requestPermission === 'function') {
                setNeedsPermission(true)
            } else {
                if (!isTelegram && !isDebugMode) {
                    setNeedsPermission(false)
                } else {
                    setPermissionGranted(true)
                }
            }
        }

        initGame()
    }, [isTelegram, user, isDebugMode])

    // Timer Tick
    useEffect(() => {
        if (cooldownRemaining <= 0) return
        const interval = setInterval(() => {
            setCooldownRemaining(prev => {
                if (prev <= 1000) {
                    setCanPlay(true)
                    return 0
                }
                return prev - 1000
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [cooldownRemaining])

    // Decay Logic: Bar drops if you stop shaking
    useEffect(() => {
        if (!showGame || won) {
            if (decayInterval.current) clearInterval(decayInterval.current)
            return
        }

        decayInterval.current = setInterval(() => {
            setProgress(prev => {
                const decayAmount = 2.5 // INCREASED: Harder decay (was 1.5)
                const newProgress = Math.max(0, prev - decayAmount)
                progressRef.current = newProgress
                return newProgress
            })
            setShakeIntensity(prev => Math.max(0, prev - 5))
        }, 100)

        return () => {
            if (decayInterval.current) clearInterval(decayInterval.current)
        }
    }, [showGame, won])

    const handleWin = useCallback(async () => {
        if (won) return
        setWon(true)

        // Haptics
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
        } else if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
        }

        // Confetti
        const duration = 3000
        const end = Date.now() + duration
        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#EF4444', '#EAB308']
            })
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#EF4444', '#EAB308']
            })
            if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()

        // RPG Backend Logic
        try {
            // 1. Create Coupon
            const coupon = await createCoupon({
                type: 'discount_percentage',
                value: 10,
                userId: currentUserId,
                expiryDays: 3, // 3 days validity
                source: 'shake_game',
                minOrder: 50
            })

            setWonCoupon({ code: coupon.code, value: '10%' })

            // 2. Record Cooldown
            await recordGamePlay(currentUserId, 'shake_game', true, '10% OFF')

            // 3. Update Local State to Block Future Play
            setCanPlay(false)
            setCooldownRemaining(24 * 60 * 60 * 1000)

        } catch (e) {
            console.error("Game Save Failed", e)
            setWonCoupon({ code: 'OFFLINE10', value: '10%' })
        }
    }, [won, currentUserId])

    // Shake Handler
    useEffect(() => {
        if (!permissionGranted || !showGame || won) return

        const handleMotion = (event: DeviceMotionEvent) => {
            const current = event.accelerationIncludingGravity
            if (!current) return

            const currentTime = new Date().getTime()
            if ((currentTime - lastUpdate.current) > 100) {
                const diffTime = currentTime - lastUpdate.current
                lastUpdate.current = currentTime

                const x = current.x || 0
                const y = current.y || 0
                const z = current.z || 0

                const speed = Math.abs(x + y + z - lastX.current - lastY.current - lastZ.current) / diffTime * 10000

                if (speed > 1000) { // EXTREME: Harder threshold (was 500)
                    // Add progress based on speed/intensity
                    const bonus = Math.min(speed / 150, 10) // HARDER: Less bonus per shake (was /100, max 15)

                    setProgress(prev => {
                        const newProgress = Math.min(100, prev + bonus)
                        progressRef.current = newProgress // Keep ref synced for non-react usage if needed

                        if (newProgress >= 100 && !won) {
                            handleWin()
                        }
                        return newProgress
                    })

                    setShakeIntensity(Math.min(100, speed / 10))

                    // Haptic feedback on strong shakes
                    if (speed > 800) {
                        if (window.Telegram?.WebApp?.HapticFeedback) {
                            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
                        } else if (navigator.vibrate) {
                            navigator.vibrate(50)
                        }
                    }
                }

                lastX.current = x
                lastY.current = y
                lastZ.current = z
            }
        }

        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [permissionGranted, showGame, won, handleWin])



    const requestAccess = async () => {
        // @ts-ignore
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const response = await DeviceMotionEvent.requestPermission()
                if (response === 'granted') {
                    setPermissionGranted(true)
                    setNeedsPermission(false)
                    setShowGame(true)
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            // Non-iOS
            setPermissionGranted(true)
            setShowGame(true)
        }
    }

    // Debug helper to simulate shake
    const manualShake = () => {
        setProgress(prev => {
            const newP = Math.min(100, prev + 10)
            if (newP >= 100 && !won) handleWin()
            return newP
        })
        setShakeIntensity(80)
    }

    // Auto-show game trigger once if ready
    useEffect(() => {
        if (isTelegram && !won && !showGame) {
            setPermissionGranted(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTelegram])

    const formatTime = (ms: number) => {
        const h = Math.floor(ms / (1000 * 60 * 60))
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
        return `${h}h ${m}m`
    }

    if (!isTelegram && !isDebugMode) return null

    return (
        <>
            {/* Teaser Button (Trigger) */}
            {!showGame && !won && !isCartOpen && (
                <motion.div
                    className="fixed bottom-24 left-4 z-[9999]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                >
                    {canPlay ? (
                        <button
                            onClick={() => {
                                if (typeof DeviceMotionEvent !== 'undefined' &&
                                    // @ts-ignore
                                    typeof DeviceMotionEvent.requestPermission === 'function') {
                                    requestAccess()
                                } else {
                                    setShowGame(true)
                                }
                            }}
                            className="group relative flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20 duration-1000" />
                            <div className="bg-zinc-900 border border-yellow-500/50 p-4 rounded-full shadow-xl relative overflow-hidden">
                                <Wine className="text-yellow-500 w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </div>
                            <div className="absolute left-full ml-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-100 transition-opacity border border-white/10">
                                Shake for Gift! 🎁
                            </div>
                        </button>
                    ) : (
                        <button
                            className="group relative flex items-center justify-center opacity-80"
                            onClick={() => {
                                // Maybe show toast "Come back later"?
                            }}
                        >
                            <div className="bg-zinc-900 border border-red-500/30 p-4 rounded-full shadow-xl relative overflow-hidden grayscale">
                                <Clock className="text-zinc-500 w-6 h-6" />
                            </div>
                            <div className="absolute left-full ml-4 bg-black/80 text-zinc-400 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10 flex items-center gap-2">
                                <span>Cooldown</span>
                                <span className="font-mono text-white">{formatTime(cooldownRemaining)}</span>
                            </div>
                        </button>
                    )}
                </motion.div>
            )}

            {/* Game / Win Modal */}
            <AnimatePresence>
                {(showGame || won) && (
                    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="w-full max-w-sm relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowGame(false)
                                    setWon(false)
                                    setProgress(0)
                                }}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white p-2"
                            >
                                <X size={24} />
                            </button>

                            {/* Game Content */}
                            {!won ? (
                                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-center">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Bartender Challenge</h2>
                                        <p className="text-zinc-400 text-sm">Shake your phone to mix the perfect cocktail!</p>
                                    </div>

                                    {/* Shaker Animation */}
                                    <div className="relative h-64 flex items-center justify-center mb-8">
                                        {/* Outer glow ring based on intensity */}
                                        <motion.div
                                            animate={{
                                                scale: 1 + (shakeIntensity / 200),
                                                opacity: shakeIntensity / 100
                                            }}
                                            className="absolute w-48 h-48 bg-yellow-500/20 rounded-full blur-xl"
                                        />

                                        <motion.div
                                            animate={{
                                                rotate: Math.sin(Date.now() / 50) * (shakeIntensity / 2),
                                                y: Math.cos(Date.now() / 50) * (shakeIntensity / 5)
                                            }}
                                            className="relative z-10"
                                        >
                                            <Wine
                                                size={120}
                                                className={`transition-colors duration-300 ${shakeIntensity > 50 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-zinc-600'}`}
                                            />
                                            {/* Liquid fill effect could go here with a clip-path, for now using color change */}
                                        </motion.div>

                                        {/* Status Text */}
                                        <div className="absolute bottom-0 left-0 right-0">
                                            <AnimatePresence mode='wait'>
                                                {shakeIntensity > 80 ? (
                                                    <motion.span
                                                        key="hot"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-red-500 font-black text-xl uppercase tracking-widest"
                                                    >
                                                        FASTER! 🔥
                                                    </motion.span>
                                                ) : shakeIntensity > 30 ? (
                                                    <motion.span
                                                        key="keep"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-yellow-500 font-bold text-lg"
                                                    >
                                                        KEEP GOING!
                                                    </motion.span>
                                                ) : (
                                                    <motion.span
                                                        key="start"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-zinc-500 font-medium"
                                                    >
                                                        SHAKE IT!
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-6 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                                        <motion.div
                                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-yellow-600 to-yellow-400"
                                            style={{ width: `${progress}%` }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference uppercase tracking-widest">
                                            Mixing {Math.round(progress)}%
                                        </div>
                                    </div>

                                    {/* Debug Button */}
                                    {isDebugMode && (
                                        <button
                                            onClick={manualShake}
                                            className="mt-8 text-xs text-zinc-600 hover:text-white underline"
                                        >
                                            [Debug] Tap to Shake
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl text-center">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500" />

                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/50"
                                    >
                                        <Wallet size={48} className="text-yellow-500" />
                                    </motion.div>

                                    <h2 className="text-2xl font-black text-white mb-2">LOOT DROPPED! 🎒</h2>
                                    <p className="text-zinc-400 text-sm mb-8">
                                        You found a 10% Discount Coupon. It has been added to your Wallet.
                                    </p>

                                    <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl border-dashed mb-6 relative group cursor-pointer"
                                        onClick={() => {
                                            if (wonCoupon) navigator.clipboard.writeText(wonCoupon.code)
                                        }}
                                    >
                                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Coupon Code</p>
                                        <div className="text-3xl font-mono font-bold text-yellow-500 tracking-widest">
                                            {wonCoupon ? wonCoupon.code : 'LOADING...'}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            Click to Copy
                                        </div>
                                    </div>

                                    <p className="text-red-400 text-xs mb-6 flex items-center justify-center gap-1">
                                        <Clock size={12} /> Expires in 3 Days
                                    </p>

                                    <button
                                        onClick={() => {
                                            setShowGame(false)
                                            // TODO: Open Wallet
                                        }}
                                        className="bg-yellow-500 text-black font-bold py-4 px-8 rounded-xl hover:bg-yellow-400 transition-colors w-full flex items-center justify-center gap-2"
                                    >
                                        <Trophy size={20} />
                                        <span>Awesome!</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
