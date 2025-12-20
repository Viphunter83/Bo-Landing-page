'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore'
import { Truck, ChefHat, CheckCircle, MapPin, Phone, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

// Simple notification sound (Base64 short beep)
const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw//OEAAAAAAAAAAAAAAAAAAAAAAAMTGF2YzU4LjU0AAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAASBkAAAAAAAAAAAA//OEZAAAAAI0JAAAACQETSEH/45AAn5/wAAAP/+//OEZAAAAAI0JAAAACQETSEH/45AAn5/wAAAP/+//OEZAAAAAI0JAAAACQETSEH/45AAn5/wAAAP/+//OEZAAAAAI0JAAAACQETSEH/45AAn5/wAAAP/+'

const DRIVERS = [
    { id: 'd1', name: 'Ahmed (Bike)' },
    { id: 'd2', name: 'John (Car)' },
    { id: 'd3', name: 'Speedy (Bike)' }
]

export default function DeliveryAdminPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()

    // Audio ref
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialLoad = useRef(true)

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio(NOTIFICATION_SOUND)
    }, [])

    useEffect(() => {
        if (!db) return

        const q = query(
            collection(db, 'orders'),
            where('type', '==', 'delivery'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Filter active orders
            const activeOrders = data.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled')

            setOrders(activeOrders)
            setLoading(false)

            // Play sound processing
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !initialLoad.current) {
                    const newOrder = change.doc.data()
                    if (newOrder.status === 'new') {
                        audioRef.current?.play().catch(e => console.log("Audio play blocked", e))
                        showToast(`New Order #${change.doc.id.slice(-4)}!`, 'success')
                    }
                }
            })

            if (initialLoad.current) initialLoad.current = false
        })

        return () => unsubscribe()
    }, [showToast])

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!db) return
        try {
            const updates: any = { status: newStatus }

            // Auto-update internal delivery status logic
            if (newStatus === 'ready') updates.deliveryStatus = 'assigned'
            else if (newStatus === 'out_for_delivery') updates.deliveryStatus = 'out_for_delivery'
            else if (newStatus === 'completed') updates.deliveryStatus = 'delivered'

            await updateDoc(doc(db, 'orders', orderId), updates)
            showToast(`Order status updated to ${newStatus}`, 'success')
        } catch (e) {
            console.error(e)
            showToast("Failed to update status", "error")
        }
    }

    const assignDriver = async (orderId: string, driverId: string) => {
        if (!db) return
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                driverId: driverId
            })
            showToast("Driver assigned successfully", 'success')
        } catch (e) {
            console.error(e)
            showToast("Error assigning driver", 'error')
        }
    }

    const columns = [
        { id: 'new', label: 'New Orders', icon: <AlertCircle size={18} />, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'cooking', label: 'Kitchen', icon: <ChefHat size={18} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'ready', label: 'Ready', icon: <CheckCircle size={18} />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    )

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Truck className="text-yellow-500" />
                        KDS (Kitchen Display System)
                    </h1>
                    <p className="text-zinc-400 text-sm">Real-time delivery fulfillment board</p>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden min-w-[1024px]">
                {columns.map(col => (
                    <div key={col.id} className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden">
                        {/* Column Header */}
                        <div className={`p-4 border-b border-zinc-800 flex items-center justify-between ${col.bg}`}>
                            <h3 className={`font-bold text-lg flex items-center gap-2 ${col.color}`}>
                                {col.icon} {col.label}
                            </h3>
                            <span className="bg-black/40 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {orders.filter((o: any) =>
                                    (col.id === 'out_for_delivery' ? o.deliveryStatus === 'out_for_delivery' : o.status === col.id)
                                ).length}
                            </span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-zinc-900/50">
                            {orders
                                .filter((o: any) => {
                                    if (col.id === 'out_for_delivery') return o.deliveryStatus === 'out_for_delivery'
                                    if (col.id === 'ready') return o.status === 'ready' && o.deliveryStatus !== 'out_for_delivery'
                                    return o.status === col.id
                                })
                                .map((order: any) => (
                                    <div key={order.id} className="bg-black border border-zinc-800 p-4 rounded-xl shadow-lg relative group hover:border-zinc-600 transition-all">
                                        {/* Timer / Badge */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 rounded border border-zinc-800">
                                                {new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-lg font-bold text-white">#{order.id.slice(-4)}</span>
                                            <div className="text-sm text-zinc-400 font-mono mt-1 text-yellow-500 font-bold">
                                                {order.total} AED
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-1 last:border-0 last:pb-0">
                                                    <span className="text-zinc-300 font-medium">
                                                        <span className="text-red-500 mr-2">{item.quantity}x</span>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Address Info */}
                                        <div className="bg-zinc-900/50 p-2 rounded mb-3 text-xs text-zinc-400 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} /> <span className="truncate">{order.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} /> <span>{order.platform}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {col.id === 'new' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'cooking')}
                                                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                Start Cooking <ChefHat size={16} />
                                            </button>
                                        )}

                                        {col.id === 'cooking' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                Mark Ready <CheckCircle size={16} />
                                            </button>
                                        )}

                                        {col.id === 'ready' && (
                                            <div className="space-y-2">
                                                <select
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none focus:border-red-600"
                                                    onChange={(e) => {
                                                        if (e.target.value) assignDriver(order.id, e.target.value)
                                                    }}
                                                    value={order.driverId || ""}
                                                >
                                                    <option value="" disabled>Assign Driver...</option>
                                                    {DRIVERS.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                {order.driverId && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                                                        className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold text-white transition-colors"
                                                    >
                                                        Dispatch
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {col.id === 'out_for_delivery' && (
                                            <div className="space-y-2">
                                                <div className="text-xs text-center text-zinc-500 uppercase tracking-widest">
                                                    Driver: {DRIVERS.find(d => d.id === order.driverId)?.name || 'Unknown'}
                                                </div>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-white transition-colors"
                                                >
                                                    Complete Order
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                            {orders.filter((o: any) =>
                                (col.id === 'out_for_delivery' ? o.deliveryStatus === 'out_for_delivery' : o.status === col.id)
                            ).length === 0 && (
                                    <div className="text-center py-12 opacity-30">
                                        <div className="flex justify-center mb-2">{col.icon}</div>
                                        <p className="text-sm font-medium">Empty</p>
                                    </div>
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
