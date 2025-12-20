'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import AdminOrderModal from '../components/AdminOrderModal'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<any[]>([])
    const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 })
    const [filter, setFilter] = useState('all')
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

    useEffect(() => {
        if (!db) return

        // 1. Subscribe to Bookings
        const qBookings = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50))
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), dataSource: 'booking' }))
            updateUnifiedList(bookingsData, null)
        })

        // 2. Subscribe to Orders (New)
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    ...data,
                    dataSource: 'order',
                    type: data.type || 'online_order', // Dynamic Type
                    date: data.createdAt?.toDate().toLocaleDateString() || 'Today',
                    time: data.createdAt?.toDate().toLocaleTimeString() || 'Now',
                    address: data.address ? `${data.address}${data.apartment ? ', ' + data.apartment : ''}` : null
                }
            })
            updateUnifiedList(null, ordersData)
        })

        return () => {
            unsubBookings()
            unsubOrders()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Merge helper
    const [rawBookings, setRawBookings] = useState<any[]>([])
    const [rawOrders, setRawOrders] = useState<any[]>([])

    const updateUnifiedList = (newBookings: any[] | null, newOrders: any[] | null) => {
        let b = newBookings || rawBookings
        let o = newOrders || rawOrders

        if (newBookings) setRawBookings(newBookings)
        if (newOrders) setRawOrders(newOrders)

        // Merge and Sort
        const merged = [...b, ...o].sort((a, b) => {
            // Sort by createdAt descending
            const tA = a.createdAt?.seconds || 0
            const tB = b.createdAt?.seconds || 0
            return tB - tA
        })
        setBookings(merged)

        // Update Stats
        const today = new Date().toISOString().split('T')[0]
        setStats({
            total: merged.length,
            pending: merged.filter((x: any) => x.status === 'new' || x.status === 'pending').length,
            today: merged.filter((x: any) => x.date === today || x.date === 'Today').length // Approximate
        })
    }

    const updateStatus = async (id: string, status: string, dataSource: string) => {
        if (!db) return
        const collectionName = dataSource === 'order' ? 'orders' : 'bookings'
        await updateDoc(doc(db, collectionName, id), { status })
    }

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.type === filter || (!b.type && filter === 'dine_in')) // backwards compat

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Unified Orders</h2>
                    <p className="text-zinc-400">Manage Dine-in, Delivery, and Pickup orders.</p>
                </div>
                <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    + New Order
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Orders" value={stats.total.toString()} change={`${stats.today} today`} />
                <StatCard title="Pending Action" value={stats.pending.toString()} change="Needs attention" color="text-yellow-500" />
                <StatCard title="Active Mode" value={filter.toUpperCase()} change="Filter applied" />
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <div className="flex gap-4 border-b border-zinc-800 mb-6">
                    {['all', 'dine_in', 'online_order', 'delivery', 'pickup'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors ${filter === tab
                                ? 'text-red-500 border-b-2 border-red-500'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-800/50 text-zinc-200 uppercase font-medium">
                            <tr>
                                <th className="p-3">Type</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Details</th>
                                <th className="p-3">Notes/Items</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-3">
                                        <Badge type={booking.type || 'dine_in'} />
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold text-white">{booking.name}</div>
                                        <div className="text-xs">{booking.phone}</div>
                                        {booking.address && (
                                            <div className="text-xs text-zinc-500 mt-1 flex gap-1 items-center">
                                                📍 {booking.address}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="text-white">{booking.date}</div>
                                        <div className="text-xs">{booking.time}</div>
                                        <div className="text-xs mt-1">{booking.guests} ppl</div>
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <div className="truncate text-white">
                                            {Array.isArray(booking.items)
                                                ? booking.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')
                                                : (booking.items || '-')
                                            }
                                        </div>
                                        <div className="text-xs text-zinc-500 truncate">{booking.specialRequests || booking.notes}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${(booking.status === 'confirmed' || booking.status === 'ready') ? 'bg-green-500/20 text-green-500' :
                                            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {booking.status ? booking.status.toUpperCase() : 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        {(booking.status === 'pending' || booking.status === 'new') && (
                                            <>
                                                <button onClick={() => updateStatus(booking.id, 'confirmed', booking.dataSource || 'booking')} className="text-green-500 hover:text-green-400 font-medium text-xs border border-green-500/30 px-2 py-1 rounded">
                                                    Accept
                                                </button>
                                                <button onClick={() => updateStatus(booking.id, 'cancelled', booking.dataSource || 'booking')} className="text-red-500 hover:text-red-400 font-medium text-xs border border-red-500/30 px-2 py-1 rounded">
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBookings.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">No orders found in this category.</div>
                    )}
                </div>
            </div>

            <AdminOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </div>
    )
}

function Badge({ type }: { type: string }) {
    const colors = {
        dine_in: 'bg-purple-500/20 text-purple-400',
        delivery: 'bg-blue-500/20 text-blue-400',
        pickup: 'bg-orange-500/20 text-orange-400',
        online_order: 'bg-teal-500/20 text-teal-400'
    }
    // @ts-ignore
    const color = colors[type] || colors.dine_in
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>
            {type.replace('_', ' ')}
        </span>
    )
}

function StatCard({ title, value, change, color }: { title: string; value: string; change: string, color?: string }) {
    return (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">{title}</h3>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{change}</span>
            </div>
        </div>
    )
}
