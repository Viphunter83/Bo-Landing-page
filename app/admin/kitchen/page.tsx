'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Clock, CheckCircle, Flame, Bell, Utensils, Truck, Users, MapPin, Phone, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface UnifiedOrder {
    id: string
    source: 'booking' | 'order'
    firebaseId: string // original ID for updates
    name: string
    items: any[] | string
    status: string
    type: 'dine_in' | 'delivery' | 'pickup'
    createdAt: Date
    bookingDateTime?: string // for bookings
    notes?: string
    guests?: string // for bookings
    totalPrice?: number // for orders
    address?: string // for delivery
    phone?: string
    platform?: string // for delivery
    driverId?: string // for delivery
    deliveryStatus?: string // for delivery
}

export default function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<UnifiedOrder[]>([])
    const [hallData, setHallData] = useState<UnifiedOrder[]>([])
    const [deliveryData, setDeliveryData] = useState<UnifiedOrder[]>([])
    const [now, setNow] = useState(new Date())

    // Update relative time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // Merge and Sort by Time (Oldest first)
        const merged = [...hallData, ...deliveryData].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        setOrders(merged)
    }, [hallData, deliveryData])

    useEffect(() => {
        if (!db) return

        // 1. Listen to Bookings (Hall)
        const qBookings = query(
            collection(db, 'bookings'),
            where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready'])
        )

        const unsubscribeBookings = onSnapshot(qBookings, (snap) => {
            const data = snap.docs.map(d => {
                const docData = d.data()
                return {
                    id: d.id,
                    firebaseId: d.id,
                    source: 'booking',
                    name: docData.name || 'Guest',
                    items: docData.items || 'Table Reservation',
                    status: docData.status,
                    type: 'dine_in',
                    createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(docData.bookingDateTime || Date.now()),
                    bookingDateTime: docData.bookingDateTime,
                    notes: docData.notes,
                    guests: docData.guests,
                    phone: docData.phone
                } as UnifiedOrder
            })
            setHallData(data)
        }, (error) => {
            console.error("Error fetching bookings:", error)
        })

        // 2. Listen to Orders (Delivery)
        const qOrders = query(
            collection(db, 'orders'),
            where('status', 'in', ['new', 'cooking', 'ready'])
        )

        const unsubscribeOrders = onSnapshot(qOrders, (snap) => {
            const data = snap.docs.map(d => {
                const docData = d.data()
                return {
                    id: d.id,
                    firebaseId: d.id,
                    source: 'order',
                    name: docData.userId || 'Online Customer',
                    items: docData.items,
                    // Map delivery statuses to unified KDS statuses
                    status: docData.status === 'new' ? 'pending' : docData.status === 'cooking' ? 'preparing' : docData.status,
                    type: docData.type || 'delivery',
                    createdAt: docData.createdAt?.seconds ? new Date(docData.createdAt.seconds * 1000) : new Date(),
                    totalPrice: docData.total,
                    address: docData.address,
                    phone: docData.phone,
                    platform: docData.platform,
                    driverId: docData.driverId,
                    deliveryStatus: docData.deliveryStatus
                } as UnifiedOrder
            })
            setDeliveryData(data)
        }, (error) => {
            console.error("Error fetching orders:", error)
        })

        return () => {
            unsubscribeBookings()
            unsubscribeOrders()
        }
    }, [])


    const updateStatus = async (order: UnifiedOrder, newStatus: string) => {
        if (!db) return

        const collectionName = order.source === 'booking' ? 'bookings' : 'orders'
        const updatePayload: any = { status: newStatus }

        // Specific logic for Delivery mapping
        if (order.source === 'order') {
            if (newStatus === 'preparing') updatePayload.status = 'cooking' // Map back to DB schema
            if (newStatus === 'completed') updatePayload.status = 'ready' // KDS Complete -> Ready for Dispatch in Logistics
        }

        try {
            await updateDoc(doc(db, collectionName, order.firebaseId), updatePayload)
        } catch (e) {
            console.error("Error updating status:", e)
        }
    }

    const getElapsedMinutes = (order: UnifiedOrder) => {
        const diff = now.getTime() - order.createdAt.getTime()
        const minutes = Math.floor(diff / 60000)
        return minutes < 0 ? 0 : minutes // Prevent negative time
    }

    // Columns Definition
    const columns = [
        {
            id: 'pending',
            title: 'New Orders',
            icon: Bell,
            color: 'border-zinc-500',
            bg: 'bg-zinc-800/50',
            orders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'new'),
            action: { label: 'Start Cooking', status: 'preparing', icon: Flame }
        },
        {
            id: 'preparing',
            title: 'On Fire (Cooking)',
            icon: Flame,
            color: 'border-orange-500',
            bg: 'bg-orange-500/10',
            orders: orders.filter(o => o.status === 'preparing' || o.status === 'cooking'),
            action: { label: 'Mark Ready', status: 'ready', icon: CheckCircle }
        },
        {
            id: 'ready',
            title: 'Ready to Serve/Dispatch',
            icon: CheckCircle,
            color: 'border-green-500',
            bg: 'bg-green-500/10',
            orders: orders.filter(o => o.status === 'ready'),
            action: { label: 'Complete / Served', status: 'completed', icon: Utensils }
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white p-4 overflow-x-auto selection:bg-orange-500/30">
            <header className="flex justify-between items-center mb-6 px-2 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-800 p-2 rounded-lg">
                        <Utensils className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase">Unified KDS</h1>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider mt-1">
                            <span className="flex items-center gap-1 text-orange-400"><Users size={12} /> Hall ({hallData.length})</span>
                            <span className="flex items-center gap-1 text-blue-400"><Truck size={12} /> Delivery ({deliveryData.length})</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono font-bold animate-pulse">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-zinc-500 text-xs font-bold uppercase">{now.toLocaleDateString()}</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
                {columns.map((col: any) => (
                    <div key={col.id} className={`flex flex-col rounded-2xl border-t-4 ${col.color} bg-zinc-900/40 backdrop-blur-sm shadow-xl`}>
                        <div className={`p-4 ${col.bg} flex items-center justify-between rounded-t-lg`}>
                            <h2 className="font-bold flex items-center gap-2 uppercase tracking-wide text-zinc-100">
                                <col.icon size={20} />
                                {col.title}
                            </h2>
                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-mono font-bold">
                                {col.orders.length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {col.orders.length === 0 && (
                                <div className="text-center text-zinc-600 italic mt-10 opacity-50 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-zinc-800/50 rounded-full">{col.icon && <col.icon size={24} className="opacity-50" />}</div>
                                    No active orders
                                </div>
                            )}

                            {col.orders.map((order: UnifiedOrder) => {
                                const elapsed = getElapsedMinutes(order)
                                const isLate = elapsed > 20
                                const isDelivery = order.source === 'order'
                                const borderColor = isDelivery ? 'border-blue-500/30 hover:border-blue-500' : 'border-orange-500/30 hover:border-orange-500'

                                return (
                                    <div key={order.firebaseId + order.source} className={`bg-black rounded-xl p-4 border ${borderColor} shadow-lg flex flex-col gap-3 relative overflow-hidden group transition-all duration-300`}>
                                        {/* Timer Badge */}
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold font-mono rounded-bl-lg z-10 ${isLate ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {elapsed}m
                                        </div>

                                        {/* Header */}
                                        <div className="pr-10">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isDelivery ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {isDelivery ? (order.type === 'pickup' ? 'PICKUP' : 'DELIVERY') : 'DINING'}
                                                </span>
                                                <span className="text-zinc-600 text-xs font-mono">#{order.id.slice(-4)}</span>
                                            </div>

                                            {/* Order Content */}
                                            {isDelivery ? (
                                                <div>
                                                    <div className="space-y-1 mb-2">
                                                        {Array.isArray(order.items) ? order.items.map((item: any, i: number) => (
                                                            <div key={i} className="flex justify-between items-start text-sm">
                                                                <span className="text-zinc-200 font-bold"><span className="text-blue-500 mr-2">{item.quantity}x</span>{item.name}</span>
                                                            </div>
                                                        )) : <div className="text-red-500">Invalid Items</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <MapPin size={10} /> {order.address ? order.address.slice(0, 20) + '...' : 'No Address'}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Hall Booking/Order */
                                                <div>
                                                    {order.items === 'Table Reservation' || !order.items ? (
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white mb-1">{order.name}</h3>
                                                            <div className="text-xs text-orange-400 font-bold flex items-center gap-1">
                                                                <Users size={12} /> {order.guests} Guests
                                                                {order.bookingDateTime && <span className="text-zinc-500 ml-1">at {order.bookingDateTime.split(' ')[1]}</span>}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{order.items as string}</h3>
                                                            {order.guests && <div className="text-xs text-zinc-500">Table for {order.guests}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {(order.notes) && (
                                            <div className="text-xs text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800">
                                                <span className="text-amber-500 font-bold block text-[10px] mb-0.5 uppercase">Chef Note:</span>
                                                {order.notes}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button
                                            onClick={() => updateStatus(order, col.action.status)}
                                            className={`mt-2 w-full py-3 rounded-lg font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${col.id === 'ready'
                                                ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white' // Complete button specific style
                                                : isDelivery ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                                                }`}
                                        >
                                            <col.action.icon size={14} />
                                            {col.action.label}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}
