'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare } from 'lucide-react'

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIosDevice)

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

        // Check if already dismissed
        const isDismissed = localStorage.getItem('pwa_prompt_dismissed')

        if (!isStandalone && !isDismissed) {
            // Show after 3 seconds
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const dismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa_prompt_dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl relative">
                <button
                    onClick={dismiss}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="flex gap-4 pr-6">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black text-xl flex-shrink-0">
                        BO
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Install App</h3>
                        <p className="text-xs text-zinc-400 mt-1">
                            {isIOS
                                ? "Tap 'Share' then 'Add to Home Screen' for the best experience."
                                : "Add Bo Dubai to your home screen for faster ordering."
                            }
                        </p>
                    </div>
                </div>

                {isIOS && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 justify-center border-t border-zinc-800 pt-3">
                        <span>Tap</span>
                        <Share size={14} className="text-blue-500" />
                        <span>then</span>
                        <PlusSquare size={14} />
                        <span>Add to Home Screen</span>
                    </div>
                )}
            </div>
        </div>
    )
}
