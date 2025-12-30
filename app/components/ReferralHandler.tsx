'use client'

import { useEffect, useRef } from 'react'
import { useTelegram } from '../context/TelegramContext'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function ReferralHandler() {
    const searchParams = useSearchParams()
    const { toggleCart, isOpen } = useCart()
    const { startParam, ready } = useTelegram()
    const processedRef = useRef('')

    useEffect(() => {
        // Prioritize URL param, fallback to Telegram startParam
        const refCode = searchParams.get('ref') || (ready && startParam ? startParam : null)

        // Ensure we only process this once per session/load
        if (refCode && refCode !== processedRef.current) {
            processedRef.current = refCode

            // 1. Store locally for attribution
            localStorage.setItem('bo_referral_code', refCode)

            // 2. Open Cart to show "Discount Applied" (via CartDrawer logic)
            if (refCode.startsWith('BO-') && !isOpen) {
                toggleCart()
            }
        }
    }, [searchParams, startParam, ready, toggleCart, isOpen])

    return null
}
