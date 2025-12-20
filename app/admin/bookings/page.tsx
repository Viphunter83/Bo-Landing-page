
'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { Booking } from '../../lib/types/booking'
import { Clock, Calendar, Users, Phone, Trash2, Check, X, Mail } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import AdminDataTable from '../components/AdminDataTable'

// Enforce ID presence for Admin Table
type BookingWithId = Booking & { id: string; bookingDateTime?: any }

export default function BookingAdminPage() {
    const [bookings, setBookings] = useState<BookingWithId[]>([])
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()

    useEffect(() => {
        if (!db) {
            setLoading(false)
            return
        }

        const q = query(collection(db, 'bookings'), orderBy('bookingDateTime', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingWithId))
            setBookings(data)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
        if (!db) return
        try {
            await updateDoc(doc(db, 'bookings', id), { status })
            showToast(`Booking ${status}`, 'success')
        } catch (e) {
            console.error(e)
            showToast('Failed to update status', 'error')
        }
    }

    const deleteBooking = async (id: string) => {
        if (!db) return
        if (!confirm('Permanently delete this booking?')) return
        try {
            await deleteDoc(doc(db, 'bookings', id))
            showToast('Booking deleted', 'success')
        } catch (e) {
            console.error(e)
            showToast('Failed to delete booking', 'error')
        }
    }

    const columns = [
        {
            header: "Date & Time",
            accessorKey: "date" as keyof BookingWithId, // Use 'date' for sorting if bookingDateTime isn't consistent string
            sortable: true,
            cell: (item: BookingWithId) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium text-white">
                        <Calendar size={14} className="text-zinc-500" />
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock size={12} />
                        {item.time}
                    </div>
                </div>
            )
        },
        {
            header: "Customer",
            accessorKey: "name" as keyof BookingWithId,
            sortable: true,
            cell: (item: BookingWithId) => (
                <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users size={12} /> {item.guests} Guests
                    </div>
                    {item.specialRequests && (
                        <div className="text-xs text-yellow-500/80 italic mt-1 max-w-[200px] truncate">
                            "{item.specialRequests}"
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Contact",
            cell: (item: BookingWithId) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone size={12} /> {item.phone}
                    </div>
                    {item.email && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Mail size={12} /> {item.email}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as keyof BookingWithId,
            sortable: true,
            cell: (item: BookingWithId) => (
                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${item.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    item.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                    {item.status}
                </span>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-white mb-6">Table Reservations 🗓️</h1>

            <AdminDataTable
                columns={columns}
                data={bookings}
                searchKeys={['name', 'phone', 'email']}
                searchPlaceholder="Search bookings..."
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ]
                    }
                ]}
                actions={(item) => (
                    <div className="flex items-center justify-end gap-2">
                        {item.status === 'pending' && (
                            <button
                                onClick={() => updateStatus(item.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition"
                                title="Confirm"
                            >
                                <Check size={16} />
                            </button>
                        )}
                        {item.status !== 'cancelled' && (
                            <button
                                onClick={() => updateStatus(item.id, 'cancelled')}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-2 rounded-lg transition"
                                title="Cancel"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => deleteBooking(item.id)}
                            className="bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-500 p-2 rounded-lg transition"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />
        </div>
    )
}
