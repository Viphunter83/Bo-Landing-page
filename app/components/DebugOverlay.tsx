'use client'

import { useState, useEffect } from 'react'
import { useTelegram } from '../context/TelegramContext'

export default function DebugOverlay() {
    const { isTelegram, user, ready } = useTelegram()
    const [debugInfo, setDebugInfo] = useState<any>({})
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const updateDebug = () => {
            const viewport = typeof window !== 'undefined' ? {
                width: window.innerWidth,
                height: window.innerHeight,
                tgExpanded: (window.Telegram?.WebApp as any)?.isExpanded
            } : {}

            setDebugInfo({
                isTelegram,
                ready,
                user: user ? `${user.id} (${user.first_name})` : 'null',
                hashPresent: typeof window !== 'undefined' ? window.location.hash.length > 0 : false,
                initDataLength: typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData?.length : 0,
                viewport
            })
        }

        updateDebug()
        const interval = setInterval(updateDebug, 1000)
        return () => clearInterval(interval)
    }, [isTelegram, user, ready])

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed top-0 right-0 z-[100] bg-red-500/20 text-red-500 text-[10px] px-1 hover:bg-red-500 hover:text-white"
            >
                DBG
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 text-green-400 font-mono text-xs p-4 overflow-auto" onClick={() => setIsVisible(false)}>
            <h3 className="text-white font-bold mb-2">DEBUG INFO (Tap to close)</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <div className="mt-4 text-white">
                <p>Location: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
                <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'SSR'}</p>
            </div>
        </div>
    )
}
