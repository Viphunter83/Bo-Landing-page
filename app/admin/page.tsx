'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<any[]>([])
    const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 })

    useEffect(() => {
        if (!db) return
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setBookings(data)

            // Calc stats
            const today = new Date().toISOString().split('T')[0]
            setStats({
                total: data.length,
                pending: data.filter((b: any) => b.status === 'pending').length,
                today: data.filter((b: any) => b.bookingDateTime?.startsWith(today)).length
            })
        })
        return () => unsubscribe()
    }, [])

    const updateStatus = async (id: string, status: string) => {
        if (!db) return
        await updateDoc(doc(db, 'bookings', id), { status })
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                <p className="text-zinc-400">Welcome back to Bo OS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Bookings" value={stats.total.toString()} change={`${stats.today} today`} />
                <StatCard title="Pending" value={stats.pending.toString()} change="Action needed" color="text-yellow-500" />
                <StatCard title="Vibe Check Stats" value="Spicy" change="Trending today" />
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-800/50 text-zinc-200 uppercase font-medium">
                            <tr>
                                <th className="p-3">Guest</th>
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Guests</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-3">
                                        <div className="font-bold text-white">{booking.name}</div>
                                        <div className="text-xs">{booking.phone}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-white">{booking.date}</div>
                                        <div className="text-xs">{booking.time}</div>
                                    </td>
                                    <td className="p-3">{booking.guests} ppl</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStatus(booking.id, 'confirmed')} className="text-green-500 hover:text-green-400 font-medium text-xs border border-green-500/30 px-2 py-1 rounded">
                                                    Confirm
                                                </button>
                                                <button onClick={() => updateStatus(booking.id, 'cancelled')} className="text-red-500 hover:text-red-400 font-medium text-xs border border-red-500/30 px-2 py-1 rounded">
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">No bookings found.</div>
                    )}
                </div>
            </div>
        </div>
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
