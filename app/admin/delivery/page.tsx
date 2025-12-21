'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore'
import { Truck, ChefHat, CheckCircle, MapPin, Phone, Clock, AlertCircle, Flame, Users } from 'lucide-react'
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
            where('type', 'in', ['delivery', 'pickup']), // Include Pickup
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // ... existing snapshot logic ...
            // (I will keep the snapshot logic implicit or use a smaller range if possible, but replace_file requires contiguous replacement. 
            //  Since I need to change logic inside the render mapping too, I might need to target specific blocks or replace a larger chunk.
            //  Let's replace the Query first, and then the Render logic in a separate chunk to be safe? 
            //  No, replace_file needs to be efficient. I will do it in one go if I can frame it right, or just query first.)

            // Actually, I'll do the Query change first.

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
                    if (newOrder.status === 'new' && newOrder.deliveryStatus !== 'assigned') {
                        audioRef.current?.play().catch(e => console.log("Audio play blocked", e))
                        showToast(`New Order #${change.doc.id.slice(-4)}!`, 'success')
                    }
                }
            })

            if (initialLoad.current) initialLoad.current = false
        }, (error) => {
            console.error("Firestore snapshot error:", error)
            showToast("Failed to load orders. Check console for missing index.", "error")
            setLoading(false)
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
        // Monitor Phases (Read Only)
        { id: 'new', label: 'Processing', icon: <AlertCircle size={18} />, color: 'text-zinc-500', bg: 'bg-zinc-900', readOnly: true },
        { id: 'cooking', label: 'Cooking (In Kitchen)', icon: <ChefHat size={18} />, color: 'text-orange-500', bg: 'bg-zinc-900', readOnly: true },

        // Action Phases
        { id: 'ready', label: 'Ready for Dispatch', icon: <CheckCircle size={18} />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    ]

    const [rushMode, setRushMode] = useState(false)

    // ... existing useEffect

    useEffect(() => {
        // Fetch initial config
        fetch('/api/delivery/config')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRushMode(data.isRushMode)
            })
            .catch(err => console.error("Failed to fetch config", err))
    }, [])

    const toggleRushMode = async () => {
        const newState = !rushMode
        setRushMode(newState)
        try {
            await fetch('/api/delivery/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rushMode: newState })
            })
            showToast(newState ? "🔥 Rush Mode ACTIVATED!" : "Rush Mode Deactivated", newState ? "success" : "info")
            if (newState) audioRef.current?.play()
        } catch (e) {
            setRushMode(!newState) // Revert
            showToast("Failed to toggle Rush Mode", "error")
        }
    }

    // ... existing handlers

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    )

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-6 flex justify-between items-center bg-black/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Truck className="text-blue-500" />
                        LOGISTICS & DISPATCH
                    </h1>
                    <p className="text-zinc-400 text-sm">Real-time driver assignment & tracking</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex gap-4 mr-6">
                        <div className="text-center">
                            <div className="text-xs text-zinc-500 uppercase font-bold">Pending</div>
                            <div className="text-xl font-mono font-bold text-white">{orders.filter((o: any) => o.status === 'new' || o.status === 'cooking').length}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-zinc-500 uppercase font-bold">Ready</div>
                            <div className="text-xl font-mono font-bold text-green-500">{orders.filter((o: any) => o.status === 'ready').length}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-zinc-500 uppercase font-bold">En Route</div>
                            <div className="text-xl font-mono font-bold text-blue-500">{orders.filter((o: any) => o.status === 'out_for_delivery').length}</div>
                        </div>
                    </div>

                    <button
                        onClick={toggleRushMode}
                        className={`px-6 py-3 rounded-xl font-black flex items-center gap-3 transition-all ${rushMode
                            ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        <Flame size={20} className={rushMode ? 'fill-yellow-300 text-yellow-300' : ''} />
                        {rushMode ? 'RUSH MODE ACTIVE' : 'RUSH MODE OFF'}
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden min-w-[1024px]">
                {columns.map(col => (
                    <div key={col.id} className={`border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden ${col.readOnly ? 'bg-zinc-950/50' : 'bg-zinc-900'}`}>
                        {/* Column Header */}
                        <div className={`p-4 border-b border-zinc-800 flex items-center justify-between ${col.bg}`}>
                            <h3 className={`font-bold text-md flex items-center gap-2 ${col.color}`}>
                                {col.icon} {col.label}
                            </h3>
                            <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {orders.filter((o: any) =>
                                    (col.id === 'out_for_delivery' ? o.deliveryStatus === 'out_for_delivery' : o.status === col.id)
                                ).length}
                            </span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className={`p-3 flex-1 overflow-y-auto space-y-3 ${col.readOnly ? 'opacity-80' : ''}`}>
                            {orders
                                .filter((o: any) => {
                                    if (col.id === 'out_for_delivery') return o.deliveryStatus === 'out_for_delivery'
                                    if (col.id === 'ready') return o.status === 'ready' && o.deliveryStatus !== 'out_for_delivery'
                                    return o.status === col.id
                                })
                                .map((order: any) => (
                                    <div key={order.id} className="bg-black border border-zinc-800 p-4 rounded-xl shadow-lg relative group hover:border-zinc-700 transition-all">
                                        {/* Timer / Badge */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 rounded border border-zinc-800">
                                                {new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="mb-3 flex justify-between items-start">
                                            <div>
                                                <span className="text-lg font-bold text-white">#{order.id.slice(-4)}</span>
                                                <div className="text-sm text-zinc-400 font-mono mt-1 text-yellow-500 font-bold">
                                                    {order.total} AED
                                                </div>
                                                {/* Show Scheduled Time for Bookings/Pickups if available */}
                                                {order.bookingDateTime && (
                                                    <div className="mt-1 text-xs text-blue-300 font-semibold bg-blue-500/10 px-2 py-1 rounded w-fit">
                                                        📅 {new Date(order.bookingDateTime).toLocaleDateString()} at {new Date(order.bookingDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${order.type === 'pickup' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                {order.type === 'pickup' ? 'Pickup' : 'Delivery'}
                                            </span>
                                        </div>

                                        {/* Simplified Item List for Logistics */}
                                        <div className="space-y-1 mb-4 text-xs">
                                            {order.items.slice(0, 3).map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-zinc-400">
                                                    <span>
                                                        <span className="text-zinc-500 mr-1">{item.quantity}x</span>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && <div className="text-zinc-600 italic">+{order.items.length - 3} more items...</div>}
                                        </div>

                                        {/* Address Info */}
                                        <div className="bg-zinc-900/50 p-2 rounded mb-3 text-xs text-zinc-400 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className="text-blue-500" /> <span className="truncate">{order.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} /> <span>{order.platform}</span>
                                            </div>
                                        </div>

                                        {/* Actions - Only for Active Logistics Columns */}
                                        {col.id === 'ready' && (
                                            <div className="space-y-2">
                                                {order.type === 'pickup' ? (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                                        className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        Customer Picked Up <CheckCircle size={14} />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <select
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-600"
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
                                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                Dispatch <Truck size={14} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {col.id === 'out_for_delivery' && (
                                            <div className="space-y-2">
                                                <div className="text-xs text-center text-zinc-500 uppercase tracking-widest bg-zinc-900 py-1 rounded">
                                                    Driver: {DRIVERS.find(d => d.id === order.driverId)?.name || 'Unknown'}
                                                </div>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-white transition-colors"
                                                >
                                                    Mark Delivered
                                                </button>
                                            </div>
                                        )}

                                        {col.readOnly && (
                                            <div className="text-[10px] text-center text-zinc-600 uppercase font-black tracking-widest mt-2 border-t border-zinc-800 pt-2">
                                                Kitchen Handling
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
