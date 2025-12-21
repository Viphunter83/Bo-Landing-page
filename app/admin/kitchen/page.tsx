'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Clock, CheckCircle, Flame, Bell, Utensils } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Order {
    id: string
    name: string
    items: string
    notes?: string
    guests?: string
    status: string
    type: 'dine_in' | 'delivery' | 'pickup'
    createdAt: any
    bookingDateTime: string
    date?: string
    time?: string
    phone?: string
}

export default function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<Order[]>([])
    const [now, setNow] = useState(new Date())

    // Update relative time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (!db) return

        // Fetch valid active orders
        // Note: In a real app, complex queries might need composite indexes.
        // For simple MVP, filter client-side if needed, but here we query active ones.
        const q = query(
            collection(db, 'bookings'),
            orderBy('createdAt', 'asc') // Oldest first (FIFO)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Order))
                .filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))

            setOrders(data)
        })
        return () => unsubscribe()
    }, [])

    const updateStatus = async (id: string, status: string) => {
        if (!db) return
        await updateDoc(doc(db, 'bookings', id), { status })
    }

    const getElapsedMinutes = (order: Order) => {
        // Use createdAt if available, otherwise bookingDateTime
        const startTime = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.bookingDateTime)
        const diff = now.getTime() - startTime.getTime()
        return Math.floor(diff / 60000)
    }

    const columns = [
        {
            id: 'new',
            title: 'New / Pending',
            icon: Bell,
            color: 'border-blue-500',
            bg: 'bg-blue-500/10',
            orders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed'),
            action: { label: 'Start', status: 'preparing', icon: Flame }
        },
        {
            id: 'prep',
            title: 'In Prep',
            icon: Flame,
            color: 'border-orange-500',
            bg: 'bg-orange-500/10',
            orders: orders.filter(o => o.status === 'preparing'),
            action: { label: 'Ready', status: 'ready', icon: CheckCircle }
        },
        {
            id: 'ready',
            title: 'Ready for Service',
            icon: CheckCircle,
            color: 'border-green-500',
            bg: 'bg-green-500/10',
            orders: orders.filter(o => o.status === 'ready'),
            action: { label: 'Complete', status: 'completed', icon: Utensils }
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white p-4 overflow-x-auto">
            <header className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <Utensils className="text-red-500" size={32} />
                    <h1 className="text-2xl font-bold tracking-wider">KITCHEN DISPLAY SYSTEM</h1>
                </div>
                <div className="text-zinc-500 font-mono text-xl">
                    {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-100px)]">
                {columns.map(col => (
                    <div key={col.id} className={`flex flex-col rounded-xl border-t-4 ${col.color} bg-zinc-900/50 backdrop-blur`}>
                        <div className={`p-4 ${col.bg} flex items-center justify-between`}>
                            <h2 className="font-bold flex items-center gap-2 uppercase tracking-wide">
                                <col.icon size={20} />
                                {col.title}
                            </h2>
                            <span className="bg-black/50 px-3 py-1 rounded-full text-xs font-mono">
                                {col.orders.length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {col.orders.length === 0 && (
                                <div className="text-center text-zinc-600 italic mt-10">No active orders</div>
                            )}

                            {col.orders.map(order => {
                                const elapsed = getElapsedMinutes(order)
                                const isLate = elapsed > 20
                                const typeColor = order.type === 'delivery' ? 'text-blue-400' :
                                    order.type === 'pickup' ? 'text-orange-400' : 'text-purple-400'

                                return (
                                    <div key={order.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-lg flex flex-col gap-3 relative overflow-hidden group">
                                        {/* Timer Badge */}
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold font-mono rounded-bl-lg ${isLate ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-700 text-zinc-400'
                                            }`}>
                                            {elapsed}m
                                        </div>

                                        {/* Header */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${typeColor}`}>
                                                    {order.type || 'DINE IN'}
                                                </span>
                                                <span className="text-zinc-500 text-xs">#{order.id.slice(-4)}</span>
                                            </div>

                                            {/* Logic split: Reservation vs Food Order */}
                                            {order.items === 'Table Reservation' || !order.items ? (
                                                <div className="mb-2">
                                                    <h3 className="text-xl font-bold leading-tight text-white mb-1">
                                                        {order.name || 'Guest'}
                                                    </h3>
                                                    <div className="flex flex-col gap-1 text-sm text-zinc-300">
                                                        {(order.date && order.time) ? (
                                                            <div className="flex items-center gap-2 text-yellow-500 font-bold">
                                                                <Clock size={14} />
                                                                <span>{order.date} at {order.time}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-red-400 text-xs">Missing Date/Time</div>
                                                        )}
                                                        {order.phone && (
                                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                                <span>📞 {order.phone}</span>
                                                            </div>
                                                        )}
                                                        {order.guests && (
                                                            <div className="text-zinc-400 text-xs">
                                                                👥 {order.guests} Guests
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold leading-tight">{order.items}</h3>
                                                    {(order.guests) && <div className="text-xs text-zinc-400 mt-1">Guests: {order.guests}</div>}
                                                </>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {(order.notes) && (
                                            <div className="text-sm text-zinc-300 bg-black/20 p-2 rounded border border-zinc-700/50">
                                                <span className="text-zinc-500 block text-xs mb-0.5">Note:</span>
                                                {order.notes}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button
                                            onClick={() => updateStatus(order.id, col.action.status)}
                                            className="mt-auto w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <col.action.icon size={16} />
                                            {col.action.label}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
