'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare, Download } from 'lucide-react'

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Detect Mobile (Simple check)
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent)

        // Don't show on desktop (Check both UA and Width as a fallback)
        if (!isMobile && window.innerWidth > 768) return

        // Detect iOS
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIosDevice)

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

        // Check if already dismissed
        const isDismissed = localStorage.getItem('pwa_prompt_dismissed')

        if (isStandalone || isDismissed) return

        // Android: Capture the event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Show prompt
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // iOS: Just show after delay
        if (isIosDevice) {
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => clearTimeout(timer)
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }, [])

    const handleInstallClick = async () => {
        if (isIOS) {
            // iOS instructions are already visible, maybe just highlight them?
            // User can't click to install on iOS.
            return
        }

        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setDeferredPrompt(null)
                setShowPrompt(false)
            }
        }
    }

    const dismiss = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering install if user clicks X
        setShowPrompt(false)
        localStorage.setItem('pwa_prompt_dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div
                onClick={handleInstallClick}
                className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700 p-4 rounded-xl shadow-2xl relative cursor-pointer active:scale-[0.98] transition-transform"
            >
                <button
                    onClick={dismiss}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-white p-2"
                >
                    <X size={18} />
                </button>

                <div className="flex gap-4 pr-8">
                    <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black text-xl flex-shrink-0 shadow-lg overflow-hidden">
                        <img src="/icons/icon-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                            Install App
                            {!isIOS && <Download size={14} className="text-yellow-500" />}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-snug">
                            {isIOS
                                ? "Tap 'Share' then 'Add to Home Screen' for the best experience."
                                : "Get the App for faster ordering & exclusive deals."
                            }
                        </p>
                    </div>
                </div>

                {/* iOS Instructions */}
                {isIOS && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-300 justify-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span>Tap</span>
                        <Share size={16} className="text-blue-500" />
                        <span>then</span>
                        <PlusSquare size={16} />
                        <span>Add to Home Screen</span>
                    </div>
                )}

                {/* Android Button (Visual Cue) */}
                {!isIOS && (
                    <div className="mt-3 w-full bg-white text-black font-bold text-xs py-2 rounded-lg text-center hover:bg-zinc-200 transition-colors">
                        Install Now
                    </div>
                )}
            </div>
        </div>
    )
}
