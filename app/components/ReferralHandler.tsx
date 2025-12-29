'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function ReferralHandler() {
    const searchParams = useSearchParams()
    const { toggleCart, isOpen } = useCart()
    const processedRef = useRef('')

    useEffect(() => {
        const refCode = searchParams.get('ref')

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
    }, [searchParams, toggleCart, isOpen])

    return null
}
