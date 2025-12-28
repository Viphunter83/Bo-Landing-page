'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Script from 'next/script'
import { auth } from '../lib/firebase'
import { signInWithCustomToken } from 'firebase/auth'

interface TelegramContextType {
    isTelegram: boolean
    user: TelegramUser | null
    ready: boolean
}

interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
}

// Global declaration for the window object
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string
                initDataUnsafe: {
                    user?: TelegramUser
                }
                ready: () => void
                expand: () => void
                HapticFeedback: {
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
                    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
                }
                MainButton: {
                    text: string
                    color: string
                    textColor: string
                    isVisible: boolean
                    isActive: boolean
                    show: () => void
                    hide: () => void
                    onClick: (callback: () => void) => void
                    offClick: (callback: () => void) => void
                    showProgress: (leaveActive: boolean) => void
                    hideProgress: () => void
                }
                ThemeParams: any
            }
        }
    }
}

const TelegramContext = createContext<TelegramContextType>({
    isTelegram: false,
    user: null,
    ready: false
})

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const [isTelegram, setIsTelegram] = useState(false)
    const [user, setUser] = useState<TelegramUser | null>(null)
    const [ready, setReady] = useState(false)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Validation check for Firebase
        if (!auth) {
            setError("Firebase Configuration Missing. Please check env variables.")
            console.error("Firebase Auth is null. Check NEXT_PUBLIC_FIREBASE_API_KEY.")
            return
        }

        // Double check availability
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp
            // Only initialize if we are actually in Telegram (have initData)
            if (tg.initData) {
                setIsTelegram(true)
                tg.expand()
                tg.ready()

                if (tg.initDataUnsafe?.user) {
                    setUser(tg.initDataUnsafe.user)

                    // Magic Login Logic
                    const login = async () => {
                        try {
                            // 1. Send initData to backend
                            const res = await fetch('/api/auth/telegram', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ initData: tg.initData })
                            })

                            if (!res.ok) {
                                const errorData = await res.json().catch(() => ({}));
                                throw new Error(errorData.error || `Server Error: ${res.status}`)
                            }

                            const { token } = await res.json()

                            // 2. Sign in with Firebase
                            await signInWithCustomToken(auth!, token)
                            console.log('🔮 Magic Login Success')
                        } catch (e: any) {
                            console.error('Magic Login Error', e)
                            setError(`Login Failed: ${e.message}`)
                        }
                    }

                    login()
                }
            }
            setReady(true)
        }
    }, [])

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white p-4 text-center">
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                    <h3 className="font-bold text-red-500 mb-2">Application Error</h3>
                    <p className="text-sm text-zinc-300">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <TelegramContext.Provider value={{ isTelegram, user, ready }}>
            <Script
                src="https://telegram.org/js/telegram-web-app.js"
                strategy="beforeInteractive"
                onLoad={() => {
                    // Trigger retry if script loads late
                    if (window.Telegram?.WebApp?.initData) {
                        setIsTelegram(true)
                        window.Telegram.WebApp.expand()
                    }
                }}
            />
            {children}
        </TelegramContext.Provider>
    )
}

export const useTelegram = () => useContext(TelegramContext)
