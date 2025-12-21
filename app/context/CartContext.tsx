'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MenuItem } from '../data/menuData'

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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isSurge, setIsSurge] = useState(false)

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
        // Poll every minute? Or just on mount/open. For MVP just mount + every 30s
        const interval = setInterval(checkSurge, 30000)
        return () => clearInterval(interval)
    }, [])

    // Load from local storage

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('bo_cart')
        if (saved) {
            try { setItems(JSON.parse(saved)) } catch (e) { console.error(e) }
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('bo_cart', JSON.stringify(items))
    }, [items])

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
        <CartContext.Provider value={{ items, isOpen, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, total, isSurge }}>
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
