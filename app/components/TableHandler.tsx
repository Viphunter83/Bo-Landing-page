'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function TableHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { setTableNumber, tableNumber } = useCart()

    useEffect(() => {
        const table = searchParams.get('table')
        if (table) {
            setTableNumber(table)

            // Optional: Remove query param to clean URL, but maybe better to keep it?
            // User wanted "bo.app/?table=5" -> Site opens in mode.
            // If we remove it, and they reload, we rely on persistence.
            // Persistence is already added to CartContext.

            console.log(`Table mode activated: ${table}`)
        }
    }, [searchParams, setTableNumber])

    return null // Invisible component
}
