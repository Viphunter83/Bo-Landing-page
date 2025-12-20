
'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { Booking } from '../../lib/types/booking'
import { Clock, Calendar, Users, Phone, Trash2, Check, X, Mail } from 'lucide-react'

export default function BookingAdminPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, 'bookings'), orderBy('bookingDateTime', 'asc')) // Sort by date

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
            // Filter out past bookings if needed, or keep history
            setBookings(data)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return
        try {
            await updateDoc(doc(db, 'bookings', id), { status })
        } catch (e) {
            console.error(e)
            alert('Failed to update status')
        }
    }

    const deleteBooking = async (id: string) => {
        if (!confirm('Permanently delete this booking?')) return
        try {
            await deleteDoc(doc(db, 'bookings', id))
        } catch (e) {
            console.error(e)
            alert('Failed to delete')
        }
    }

    if (loading) return <div className="p-8 text-white">Loading bookings...</div>

    // Group by Date for better UI
    const groupedBookings = bookings.reduce((acc, booking) => {
        const date = booking.date
        if (!acc[date]) acc[date] = []
        acc[date].push(booking)
        return acc
    }, {} as Record<string, Booking[]>)

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-white mb-6">Table Reservations 🗓️</h1>

            {Object.keys(groupedBookings).length === 0 && (
                <div className="text-zinc-500">No bookings found.</div>
            )}

            {Object.entries(groupedBookings).map(([date, items]) => (
                <div key={date} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6">
                    <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>

                    <div className="grid gap-4">
                        {items.map(booking => (
                            <div key={booking.id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4 items-start md:items-center ${booking.status === 'confirmed' ? 'bg-green-900/10 border-green-900/30' :
                                    booking.status === 'cancelled' ? 'bg-red-900/10 border-red-900/30 opacity-50' :
                                        'bg-zinc-800 border-zinc-700'
                                }`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-bold px-2 py-1 rounded ${booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                                                booking.status === 'cancelled' ? 'bg-red-600 text-white' :
                                                    'bg-yellow-600 text-white'
                                            }`}>
                                            {booking.time}
                                        </span>
                                        <h3 className="font-bold text-white text-lg">{booking.name}</h3>
                                        <span className="text-zinc-400 text-sm flex items-center gap-1">
                                            <Users size={14} /> {booking.guests} Guests
                                        </span>
                                    </div>
                                    <div className="text-zinc-400 text-sm flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <span className="flex items-center gap-1"><Phone size={14} /> {booking.phone}</span>
                                        {booking.email && <span className="flex items-center gap-1"><Mail size={14} /> {booking.email}</span>}
                                    </div>
                                    {booking.specialRequests && (
                                        <p className="text-yellow-500/80 text-xs mt-1 italic">"{booking.specialRequests}"</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {booking.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(booking.id!, 'confirmed')}
                                            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition"
                                            title="Confirm"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    {booking.status !== 'cancelled' && (
                                        <button
                                            onClick={() => updateStatus(booking.id!, 'cancelled')}
                                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition"
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteBooking(booking.id!)}
                                        className="text-zinc-600 hover:text-red-500 p-2 transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
