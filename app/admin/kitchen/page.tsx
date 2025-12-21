'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Clock, CheckCircle, Flame, Bell, Utensils, Truck, Users, MapPin, Phone } from 'lucide-react'

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
}

export default function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<UnifiedOrder[]>([])
    const [now, setNow] = useState(new Date())

    // Update relative time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (!db) return

        // 1. Listen to Bookings (Hall)
        const qBookings = query(
            collection(db, 'bookings'),
            where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready'])
        )

        // 2. Listen to Orders (Delivery)
        const qOrders = query(
            collection(db, 'orders'),
            where('status', 'in', ['new', 'cooking', 'ready']) // Map 'cooking' to 'preparing' logic
        )

        const unsubscribeBookings = onSnapshot(qBookings, (snap) => {
            const hallOrders = snap.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    firebaseId: d.id,
                    source: 'booking',
                    name: data.name || 'Guest',
                    items: data.items || 'Table Reservation',
                    status: data.status,
                    type: 'dine_in',
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.bookingDateTime || Date.now()),
                    bookingDateTime: data.bookingDateTime,
                    notes: data.notes,
                    guests: data.guests,
                    phone: data.phone
                } as UnifiedOrder
            })
            mergeOrders(hallOrders, 'booking')
        })

        const unsubscribeOrders = onSnapshot(qOrders, (snap) => {
            const deliveryOrders = snap.docs.map(d => {
                const data = d.data()
                return {
                    id: d.id,
                    firebaseId: d.id,
                    source: 'order',
                    name: data.userId || 'Customer', // improve if user name available
                    items: data.items, // Array of items
                    // Map delivery statuses to unified KDS statuses
                    status: data.status === 'new' ? 'pending' : data.status === 'cooking' ? 'preparing' : data.status,
                    type: data.type,
                    createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(),
                    totalPrice: data.total,
                    address: data.address,
                    phone: data.phone,
                    platform: data.platform
                } as UnifiedOrder
            })
            mergeOrders(deliveryOrders, 'order')
        })

        return () => {
            unsubscribeBookings()
            unsubscribeOrders()
        }
    }, [])

    // Helper to merge streams
    // We keep raw arrays in a ref or separate state? 
    // Easier: Just store all in one state variable, but we need to know which source updated.
    // Actually, distinct Listeners calling setOrders might race or overwrite.
    // Better: separate state for each, then use effect to combine.
    const [hallData, setHallData] = useState<UnifiedOrder[]>([])
    const [deliveryData, setDeliveryData] = useState<UnifiedOrder[]>([])

    // Overwrite the Listeners above to set specific state
    // ... wait, I can't change the useEffect body easily with 'replace_file' if I don't rewrite it all.
    // I AM rewriting it all. So I will fix the logic below.

    // ... (See implementation below)

    const updateStatus = async (order: UnifiedOrder, newStatus: string) => {
        if (!db) return

        const collectionName = order.source === 'booking' ? 'bookings' : 'orders'
        const updatePayload: any = { status: newStatus }

        // Specific logic for Delivery mapping
        if (order.source === 'order') {
            if (newStatus === 'preparing') updatePayload.status = 'cooking' // Map back to DB schema
            if (newStatus === 'completed') updatePayload.status = 'ready' // KDS Complete -> Ready for Dispatch
            // If user clicks "Ready" on KDS, it effectively means "Ready for Dispatch"
        }

        await updateDoc(doc(db, collectionName, order.firebaseId), updatePayload)
    }

    const getElapsedMinutes = (order: UnifiedOrder) => {
        const diff = now.getTime() - order.createdAt.getTime()
        return Math.floor(diff / 60000)
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
        <UniKDSLogic
            setOrders={setOrders}
            orders={orders}
            columns={columns}
            updateStatus={updateStatus}
            getElapsedMinutes={getElapsedMinutes}
            now={now}
        />
    )
}

// Breaking component to separate logic from View for cleaner code if possible, 
// but for single file replacement, I'll inline the full logic properly.

function UniKDSLogic({ setOrders, orders, columns, updateStatus, getElapsedMinutes, now }: any) {
    const [hall, setHall] = useState<UnifiedOrder[]>([])
    const [deliv, setDeliv] = useState<UnifiedOrder[]>([])

    useEffect(() => {
        if (!db) return

        // 1. Hall
        const unsubHall = onSnapshot(query(collection(db!, 'bookings'), where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready'])), (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                firebaseId: d.id,
                source: 'booking',
                name: d.data().name || 'Guest',
                items: d.data().items,
                status: d.data().status,
                type: 'dine_in',
                createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().bookingDateTime || Date.now()),
                bookingDateTime: d.data().bookingDateTime,
                notes: d.data().notes,
                guests: d.data().guests,
                phone: d.data().phone
            } as UnifiedOrder))
            setHall(data)
        })

        // 2. Delivery
        const unsubDeliv = onSnapshot(query(collection(db!, 'orders'), where('status', 'in', ['new', 'cooking', 'ready'])), (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                firebaseId: d.id,
                source: 'order',
                name: d.data().userId || 'Online Customer',
                items: d.data().items,
                status: d.data().status === 'new' ? 'pending' : d.data().status === 'cooking' ? 'preparing' : d.data().status,
                type: d.data().type || 'delivery',
                createdAt: d.data().createdAt?.seconds ? new Date(d.data().createdAt.seconds * 1000) : new Date(),
                totalPrice: d.data().total,
                address: d.data().address,
                phone: d.data().phone,
                platform: d.data().platform
            } as UnifiedOrder))
            setDeliv(data)
        })

        return () => { unsubHall(); unsubDeliv() }
    }, [setOrders])

    useEffect(() => {
        // Merge and Sort by Time (Oldest first)
        const merged = [...hall, ...deliv].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        setOrders(merged)
    }, [hall, deliv, setOrders])

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
                            <span className="flex items-center gap-1 text-orange-400"><Users size={12} /> Hall ({hall.length})</span>
                            <span className="flex items-center gap-1 text-blue-400"><Truck size={12} /> Delivery ({deliv.length})</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono font-bold">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
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
                                <div className="text-center text-zinc-600 italic mt-10 opacity-50">No active {col.title.toLowerCase()}</div>
                            )}

                            {col.orders.map((order: UnifiedOrder) => {
                                const elapsed = getElapsedMinutes(order)
                                const isLate = elapsed > 20
                                const isDelivery = order.source === 'order'
                                const typeColor = isDelivery ? 'text-blue-400' : 'text-orange-400'
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
