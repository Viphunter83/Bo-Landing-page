'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Wine, Smartphone, Trophy, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTelegram } from '../context/TelegramContext'

export default function ShakeToWin() {
    const { isTelegram } = useTelegram()
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [showGame, setShowGame] = useState(false)
    const [progress, setProgress] = useState(0) // 0 to 100
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [won, setWon] = useState(false)

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

    // Check environment
    useEffect(() => {
        // Enable debug mode on localhost for testing without sensors
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            setIsDebugMode(true)
            // Auto-grant permission in debug
            setPermissionGranted(true)
        }

        if (typeof DeviceMotionEvent !== 'undefined' &&
            // @ts-ignore
            typeof DeviceMotionEvent.requestPermission === 'function') {
            setNeedsPermission(true)
        } else {
            // For non-iOS 13+ devices, we assume permission is implicitly granted (or available)
            // unless we are solely relying on a button press to start listening.
            if (!isTelegram && !isDebugMode) {
                // On normal web, we might still want the user to click "Start" logic if browser blocks it,
                // but for now let's assume auto-start is fine or handled by the "Teaser" click.
                setNeedsPermission(false)
            } else {
                setPermissionGranted(true)
            }
        }
    }, [isTelegram, isDebugMode])

    // Decay Logic: Bar drops if you stop shaking
    useEffect(() => {
        if (!showGame || won) {
            if (decayInterval.current) clearInterval(decayInterval.current)
            return
        }

        decayInterval.current = setInterval(() => {
            setProgress(prev => {
                const decayAmount = 1.5 // Speed of decay
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

                if (speed > 300) { // Shake detected
                    // Add progress based on speed/intensity
                    const bonus = Math.min(speed / 100, 15) // Cap max add per tick

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
    }, [permissionGranted, showGame, won])

    const handleWin = () => {
        setWon(true)
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
    }

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

    if (!isTelegram && !isDebugMode) return null

    return (
        <>
            {/* Teaser Button (Always visible if not detecting game yet) */}
            {!showGame && !won && (
                <motion.div
                    className="fixed bottom-24 right-4 z-40"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                >
                    {needsPermission && !permissionGranted ? (
                        <button
                            onClick={requestAccess}
                            className="bg-yellow-500 text-black p-4 rounded-full shadow-lg shadow-yellow-500/20 animate-bounce"
                        >
                            <Gift size={24} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowGame(true)}
                            className="group relative flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20 duration-1000" />
                            <div className="bg-zinc-900 border border-yellow-500/50 p-4 rounded-full shadow-xl relative overflow-hidden">
                                <Wine className="text-yellow-500 w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </div>
                            <div className="absolute right-full mr-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 hidden md:block">
                                Shake for Gift!
                            </div>
                        </button>
                    )}
                </motion.div>
            )}

            {/* Game / Win Modal */}
            <AnimatePresence>
                {(showGame || won) && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
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
                                        <Trophy size={48} className="text-yellow-500" />
                                    </motion.div>

                                    <h2 className="text-3xl font-black text-white mb-2">PERFECT MIX! 🍹</h2>
                                    <p className="text-zinc-400 text-sm mb-8">
                                        You are a natural bartender! Here is your reward.
                                    </p>

                                    <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl border-dashed mb-6 relative group cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText('SHAKE10')
                                        }}
                                    >
                                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Promo Code</p>
                                        <div className="text-3xl font-mono font-bold text-yellow-500 tracking-widest">
                                            SHAKE10
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            Click to Copy
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowGame(false)
                                            window.dispatchEvent(new CustomEvent('open-booking', {
                                                detail: { promoCode: 'SHAKE10' }
                                            }))
                                        }}
                                        className="bg-yellow-500 text-black font-bold py-4 px-8 rounded-xl hover:bg-yellow-400 transition-colors w-full flex items-center justify-center gap-2"
                                    >
                                        <Zap size={20} />
                                        <span>Book with Discount</span>
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
