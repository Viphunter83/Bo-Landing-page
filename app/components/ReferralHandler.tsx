'use client'

import { useEffect, useRef } from 'react'
import { useTelegram } from '../context/TelegramContext'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function ReferralHandler() {
    const searchParams = useSearchParams()
    const { openCart, isOpen } = useCart()
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
            if (refCode) {
                // Force open even if already open (to ensure effect triggers if needed, though effect dep is on isOpen)
                // actually if it's already open, useEffect in CartDrawer might not re-run if it depends on changing into open. 
                // But CartDrawer checks isOpen in render? No, useEffect. 
                // Let's just ensure it's open.
                openCart()
            }
        }
    }, [searchParams, startParam, ready, openCart, isOpen])

    return null
}
