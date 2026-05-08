'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { getTenantCollection } from '../lib/db/tenant_db'
import { fullMenu, getMenuByCategory } from '../data/menuData'
import { LogOut, Grid, Utensils, ShoppingBag, Plus, Minus, ChevronLeft, Send, CheckCircle } from 'lucide-react'

// Types
interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

interface TableOrder {
    [tableId: string]: CartItem[]
}

export default function WaiterApp() {
    const router = useRouter()
    const [view, setView] = useState<'tables' | 'menu'>('tables')
    const [selectedTable, setSelectedTable] = useState<number | null>(null)
    const [cart, setCart] = useState<TableOrder>({})
    const [activeCategory, setActiveCategory] = useState('classic')
    const [submitting, setSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Auth Check
    useEffect(() => {
        if (!mounted) return
        const auth = localStorage.getItem('waiter_auth')
        if (!auth) router.push('/waiter/login')
    }, [router, mounted])

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('waiter_auth')
        router.push('/waiter/login')
    }

    // Cart Logic
    const addToCart = (item: any) => {
        if (!selectedTable) return
        const tableId = selectedTable.toString()
        const currentCart = cart[tableId] || []
        const existing = currentCart.find(i => i.id === item.id)

        // Parse price "65 AED" -> 65
        const price = parseInt(item.price.replace(/\D/g, '')) || 0

        let newCart
        if (existing) {
            newCart = currentCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        } else {
            newCart = [...currentCart, { id: item.id, name: item.name, price, quantity: 1 }]
        }

        setCart({ ...cart, [tableId]: newCart })
    }

    const removeFromCart = (itemId: string) => {
        if (!selectedTable) return
        const tableId = selectedTable.toString()
        const currentCart = cart[tableId] || []
        const existing = currentCart.find(i => i.id === itemId)

        if (!existing) return

        let newCart
        if (existing.quantity > 1) {
            newCart = currentCart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        } else {
            newCart = currentCart.filter(i => i.id !== itemId)
        }

        setCart({ ...cart, [tableId]: newCart })
    }

    const getTableTotal = (tableId: number) => {
        const items = cart[tableId.toString()] || []
        return items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }

    // Submit Order
    const fireOrder = async () => {
        if (!selectedTable) return
        const tableId = selectedTable.toString()
        const items = cart[tableId] || []
        if (items.length === 0) return

        setSubmitting(true)
        try {
            await addDoc(getTenantCollection('orders'), {
                source: 'waiter',
                tableId: tableId,
                status: 'new', // KDS will pick this up (mapped to 'pending')
                items: items,
                total: getTableTotal(selectedTable),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                paymentStatus: 'pending'
            })

            // Clear Cart for Table
            setCart({ ...cart, [tableId]: [] })
            setView('tables')
            setSelectedTable(null)
            // Optional: Toast or Sound?
        } catch (e) {
            console.error('Error submitting order', e)
            alert('Failed to submit order!')
        }
        setSubmitting(false)
    }

    if (!mounted) return <div className="min-h-screen bg-black" />

    // Views
    if (view === 'tables') {
        return (
            <div className="min-h-screen bg-black text-white p-4">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Waiter Mode</h1>
                        <p className="text-zinc-500 text-sm">Select a table to start</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
                        <LogOut size={20} className="text-zinc-400" />
                    </button>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                        const hasItems = (cart[num.toString()] || []).length > 0
                        return (
                            <button
                                key={num}
                                onClick={() => {
                                    setSelectedTable(num)
                                    setView('menu')
                                }}
                                className={`h-32 rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all active:scale-95 ${hasItems ? 'border-orange-500 bg-orange-950/30' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                            >
                                <span className={`text-4xl font-black ${hasItems ? 'text-orange-500' : 'text-zinc-700'}`}>{num}</span>
                                <span className="text-xs uppercase font-bold text-zinc-500 mt-2">Table</span>
                                {hasItems && (
                                    <div className="absolute top-2 right-2 bg-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                        Active
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const currentItems = cart[selectedTable!.toString()] || []

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center sticky top-0 z-10">
                <button onClick={() => setView('tables')} className="flex items-center gap-2 text-zinc-400 hover:text-white">
                    <ChevronLeft size={24} />
                    <span className="font-bold">Back</span>
                </button>
                <div className="font-bold text-lg">Table {selectedTable}</div>
                <div className="w-8" />
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Menu List */}
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
                        {['classic', 'spicy', 'fresh', 'drinks', 'desserts'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold uppercase transition-colors ${activeCategory === cat ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {getMenuByCategory(activeCategory).map(item => (
                            <div key={item.id} className="bg-zinc-900/50 rounded-xl p-3 flex gap-4 active:bg-zinc-800 transition-colors" onClick={() => addToCart(item)}>
                                <Image src={item.image} alt={item.name} width={80} height={80} className="w-20 h-20 rounded-lg object-cover bg-zinc-800" />
                                <div className="flex-1 py-1">
                                    <h3 className="font-bold leading-tight">{item.name}</h3>
                                    <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{item.desc}</p>
                                    <div className="mt-2 font-mono text-orange-400">{item.price}</div>
                                </div>
                                <button className="self-center p-2 bg-zinc-800 rounded-full text-zinc-400">
                                    <Plus size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Sidebar (or Bottom Sheet on Mobile - keeping sidebar for ipad layout logic) */}
                <div className="w-1/3 bg-zinc-900 border-l border-zinc-800 flex flex-col">
                    <div className="p-4 border-b border-zinc-800 font-bold flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Current Order
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentItems.length === 0 ? (
                            <div className="text-center text-zinc-600 mt-10">
                                Empty Order
                            </div>
                        ) : (
                            currentItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-zinc-500">{item.price} AED</div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black rounded-lg p-1">
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-zinc-400 hover:text-white"><Minus size={14} /></button>
                                        <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="p-1 text-zinc-400 hover:text-white"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-800 bg-black/20">
                        <div className="flex justify-between items-center mb-4 text-lg font-bold">
                            <span>Total</span>
                            <span>{getTableTotal(selectedTable!)} AED</span>
                        </div>
                        <button
                            onClick={fireOrder}
                            disabled={submitting || currentItems.length === 0}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {submitting ? 'Sending...' : (
                                <>
                                    <Send size={18} /> Fire to Kitchen
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
