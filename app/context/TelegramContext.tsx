'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Script from 'next/script'

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

    useEffect(() => {
        // Double check availability
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp
            setIsTelegram(true)

            // Expand to full height
            tg.expand()
            tg.ready()

            if (tg.initDataUnsafe?.user) {
                setUser(tg.initDataUnsafe.user)
            }

            setReady(true)
        }
    }, [])

    return (
        <TelegramContext.Provider value={{ isTelegram, user, ready }}>
            <Script
                src="https://telegram.org/js/telegram-web-app.js"
                strategy="beforeInteractive"
                onLoad={() => {
                    // Trigger retry if script loads late
                    if (window.Telegram?.WebApp) {
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
