'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MenuItem } from '../data/menuData'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useTelegram } from './TelegramContext'

export interface CartItem extends MenuItem {
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    isOpen: boolean
    addToCart: (item: MenuItem, quantity?: number) => void
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, delta: number) => void
    clearCart: () => void
    toggleCart: () => void
    total: number
    isSurge: boolean
    tableNumber: string | null
    setTableNumber: (table: string | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isSurge, setIsSurge] = useState(false)
    const [tableNumber, setTableNumber] = useState<string | null>(null)
    const { user } = useTelegram()

    // Check for Rush Mode
    useEffect(() => {
        const checkSurge = () => {
            fetch('/api/delivery/config')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setIsSurge(data.isRushMode)
                })
                .catch(err => console.error("Surge check failed", err))
        }

        checkSurge()
        // Poll every 30s
        const interval = setInterval(checkSurge, 30000)
        return () => clearInterval(interval)
    }, [])

    // Load from local storage (Cart & Table)
    useEffect(() => {
        const savedCart = localStorage.getItem('bo_cart')
        if (savedCart) {
            try { setItems(JSON.parse(savedCart)) } catch (e) { console.error(e) }
        }

        const savedTable = localStorage.getItem('bo_table')
        if (savedTable) {
            setTableNumber(savedTable)
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('bo_cart', JSON.stringify(items))
    }, [items])

    useEffect(() => {
        if (tableNumber) {
            localStorage.setItem('bo_table', tableNumber)
        } else {
            localStorage.removeItem('bo_table')
        }
    }, [tableNumber])

    // Sync to DB (Debounced) - For Cart Recovery
    useEffect(() => {
        // Resolve effective user ID
        const userId = user?.id?.toString() || localStorage.getItem('bo_guest_id')

        if (!userId || !db) return

        const timeout = setTimeout(() => {
            if (!db) return
            // Check if we should sync (items > 0)
            if (items.length > 0) {
                setDoc(doc(db, 'customers', userId), {
                    cart: items,
                    cartUpdatedAt: new Date().toISOString()
                }, { merge: true }).catch(err => console.error("Cart Sync Failed", err))
            }
        }, 2000)

        return () => clearTimeout(timeout)
    }, [items, user])

    const addToCart = (item: MenuItem, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)
            }
            return [...prev, { ...item, quantity }]
        })
        setIsOpen(true) // Open cart when adding
    }

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = Math.max(0, i.quantity + delta)
                return { ...i, quantity: newQty }
            }
            return i
        }).filter(i => i.quantity > 0))
    }

    const clearCart = () => setItems([])
    const toggleCart = () => setIsOpen(prev => !prev)

    const total = items.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/\D/g, '')) || 0
        return sum + (price * item.quantity)
    }, 0)

    return (
        <CartContext.Provider value={{ items, isOpen, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, total, isSurge, tableNumber, setTableNumber }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
