'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Sparkles, Smartphone } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTelegram } from '../context/TelegramContext'

export default function ShakeToWin() {
    const { isTelegram } = useTelegram()
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [showPromo, setShowPromo] = useState(false)
    const [shakeCount, setShakeCount] = useState(0)
    const lastUpdate = useRef(0)
    const lastX = useRef(0)
    const lastY = useRef(0)
    const lastZ = useRef(0)

    // Only for iOS 13+
    const [needsPermission, setNeedsPermission] = useState(false)

    useEffect(() => {
        if (!isTelegram) return

        // Check if we need to ask for permission (iOS 13+)
        if (typeof DeviceMotionEvent !== 'undefined' &&
            // @ts-ignore
            typeof DeviceMotionEvent.requestPermission === 'function') {
            setNeedsPermission(true)
        } else {
            setPermissionGranted(true)
        }
    }, [isTelegram])

    useEffect(() => {
        if (!permissionGranted || showPromo) return

        const triggerWin = () => {
            // Haptic Feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
            } else if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
            }

            setShowPromo(true)

            // Confetti
            const duration = 3000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#EF4444', '#EAB308'] // Red & Gold
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

                if (speed > 800) { // Shake Threshold Increased
                    setShakeCount(prev => {
                        const newCount = prev + 1
                        if (newCount >= 2) { // Require 2 rapid shakes
                            triggerWin()
                            return 0
                        }
                        return newCount
                    })
                    // Reset if next shake takes too long
                    setTimeout(() => setShakeCount(0), 1000)
                }

                lastX.current = x
                lastY.current = y
                lastZ.current = z
            }
        }

        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [permissionGranted, showPromo])

    const requestAccess = async () => {
        // @ts-ignore
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const response = await DeviceMotionEvent.requestPermission()
                if (response === 'granted') {
                    setPermissionGranted(true)
                    setNeedsPermission(false)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    if (!isTelegram) return null

    return (
        <>
            {/* Permission Button for iOS */}
            {needsPermission && !permissionGranted && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={requestAccess}
                    className="fixed bottom-24 left-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full animate-bounce shadow-lg"
                >
                    <Smartphone className="w-6 h-6 text-yellow-500" />
                </motion.button>
            )}

            {/* Persistent Hint for better discovery */}
            {permissionGranted && !showPromo && (
                <div className="fixed top-24 right-4 z-30 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="bg-black/60 backdrop-blur-md text-xs text-white px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2 shadow-lg"
                    >
                        <Smartphone size={14} className="text-yellow-500 animate-shake" />
                        <span className="font-bold">Shake for Magic!</span>
                    </motion.div>
                </div>
            )}

            {/* Win Modal */}
            <AnimatePresence>
                {showPromo && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 w-full max-w-sm rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500" />

                            <button
                                onClick={() => setShowPromo(false)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center space-y-6">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border border-yellow-500/50"
                                >
                                    <Gift size={40} className="text-yellow-500" />
                                </motion.div>

                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">YOU WON! 🎉</h2>
                                    <p className="text-zinc-400 text-sm">
                                        Show this screen to your waiter to claim your reward.
                                    </p>
                                </div>

                                <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl border-dashed">
                                    <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Promo Code</p>
                                    <div className="text-3xl font-mono font-bold text-yellow-500 tracking-widest select-all">
                                        SHAKE10
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('SHAKE10')
                                            // Simple alert for now, or use toast if available
                                            alert('Code copied!')
                                        }}
                                        className="bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>Copy Code</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPromo(false)
                                            // Dispatch event to open booking modal with code
                                            window.dispatchEvent(new CustomEvent('open-booking', {
                                                detail: { promoCode: 'SHAKE10' }
                                            }))
                                        }}
                                        className="bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>Book Table</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
