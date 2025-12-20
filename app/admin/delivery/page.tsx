'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore'
import { OrderData } from '../../lib/db/orders'
import { Truck, ChefHat, CheckCircle, MapPin, Phone } from 'lucide-react'

// Simple mock drivers for now
const DRIVERS = [
    { id: 'd1', name: 'Ahmed' },
    { id: 'd2', name: 'John' },
    { id: 'd3', name: 'Bike 1' }
]

export default function DeliveryAdminPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!db) return

        // Fetch ACTIVE delivery orders
        // In a real app, you might want a composite index or limit the date range
        // For MVP, we get all non-completed delivery orders
        const q = query(
            collection(db, 'orders'),
            where('type', '==', 'delivery'),
            where('status', '!=', 'completed'),
            orderBy('status'), // Requires Firestore Index maybe? If so, we'll see console error
            orderBy('createdAt', 'desc')
        )

        // Correction: '!=' queries can be tricky with multiple orderBys.
        // Let's just fetch recent orders and filter in memory if needed for MVP stability.
        const safeQuery = query(
            collection(db, 'orders'),
            where('type', '==', 'delivery'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(safeQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            // Filter out completed/old if needed, but maybe we want to see history
            setOrders(data.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled'))
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!db) return
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus,
                deliveryStatus: newStatus === 'ready' ? 'assigned' : newStatus === 'out_for_delivery' ? 'out_for_delivery' : 'pending'
            })
        } catch (e) {
            console.error("Error updating status", e)
            alert("Failed to update status")
        }
    }

    const assignDriver = async (orderId: string, driverId: string) => {
        if (!db) return
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                driverId: driverId,
                status: 'ready' // Assume assigning driver makes it ready for pickup/delivery? Or keep separate?
            })
        } catch (e) {
            console.error("Error assigning driver", e)
        }
    }

    const columns = [
        { id: 'new', label: 'New Orders', icon: <Truck size={16} /> },
        { id: 'cooking', label: 'In Kitchen', icon: <ChefHat size={16} /> },
        { id: 'ready', label: 'Ready / Assign', icon: <CheckCircle size={16} /> },
        { id: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={16} /> }
    ]

    if (loading) return <div className="p-8 text-zinc-400">Loading delivery board...</div>

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Truck className="text-yellow-500" />
                    Delivery Management
                </h1>
                <div className="flex gap-2">
                    {/* Filters could go here */}
                </div>
            </header>

            <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden min-w-[1000px]">
                {columns.map(col => (
                    <div key={col.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold text-zinc-300 flex items-center gap-2">
                                {col.icon} {col.label}
                            </h3>
                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                                {orders.filter((o: any) =>
                                    (col.id === 'out_for_delivery' ? o.deliveryStatus === 'out_for_delivery' : o.status === col.id)
                                ).length}
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-3">
                            {orders
                                .filter((o: any) => {
                                    // Custom mapping for columns
                                    if (col.id === 'out_for_delivery') return o.deliveryStatus === 'out_for_delivery'
                                    if (col.id === 'ready') return o.status === 'ready' && o.deliveryStatus !== 'out_for_delivery'
                                    return o.status === col.id
                                })
                                .map((order: any) => (
                                    <div key={order.id} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow-sm hover:border-yellow-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white">#{order.id.slice(-4)}</span>
                                            <span className="text-yellow-500 font-mono">{order.total}</span>
                                        </div>

                                        <div className="text-sm text-zinc-400 mb-3 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} />
                                                <span className="truncate">{order.address?.slice(0, 25)}...</span>
                                            </div>
                                            {order.deliveryZoneId && (
                                                <div className="text-xs text-zinc-500 ml-6">Zone: {order.deliveryZoneId}</div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} />
                                                <span>{order.platform}</span>
                                            </div>
                                        </div>

                                        {/* Items Summary */}
                                        <div className="text-xs text-zinc-500 border-t border-zinc-700/50 pt-2 mb-3">
                                            {order.items.map((i: any, idx: number) => (
                                                <div key={idx}>{i.quantity}x {i.name}</div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 mt-2">
                                            {col.id === 'new' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cooking')}
                                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white"
                                                >
                                                    Accept & Cook
                                                </button>
                                            )}

                                            {col.id === 'cooking' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                                    className="w-full py-2 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white"
                                                >
                                                    Mark Ready
                                                </button>
                                            )}

                                            {col.id === 'ready' && (
                                                <select
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                                                    onChange={(e) => {
                                                        if (e.target.value) assignDriver(order.id, e.target.value)
                                                    }}
                                                    defaultValue={order.driverId || ""}
                                                >
                                                    <option value="">Select Driver...</option>
                                                    {DRIVERS.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {col.id === 'ready' && order.driverId && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} // This updates deliveryStatus custom logic needed
                                                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold text-white"
                                                >
                                                    Start Delivery
                                                </button>
                                            )}

                                            {col.id === 'out_for_delivery' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-bold text-white"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {orders.filter(o => o.status === col.id).length === 0 && (
                                <div className="text-center py-10 text-zinc-600 text-sm">
                                    No orders
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
