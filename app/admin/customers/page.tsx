'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminDataTable from '../components/AdminDataTable'
import { Users, Search, Sparkles, MessageCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export const dynamic = 'force-dynamic'

interface Customer {
    id: string
    firstName?: string
    lastName?: string
    username?: string
    photoUrl?: string
    telegramId?: number
    phone?: string
    email?: string
    lastLogin?: any
    createdAt?: any
    vibe?: string // AI Preference
    spice?: string // AI Preference
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const { showToast } = useToast()

    useEffect(() => {
        if (!db) return

        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(50))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data()
                return {
                    id: doc.id,
                    ...d
                } as Customer
            })
            setCustomers(data)
        })

        return () => unsubscribe()
    }, [])

    const columns = [
        {
            header: "User",
            accessorKey: "firstName" as keyof Customer,
            cell: (item: Customer) => (
                <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                        <img src={item.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-700" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                            {(item.firstName?.[0] || 'U')}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-white flex items-center gap-2">
                            {item.firstName} {item.lastName}
                            {item.username && (
                                <a
                                    href={`https://t.me/${item.username}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-xs font-normal bg-blue-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    <MessageCircle size={10} />
                                    @{item.username}
                                </a>
                            )}
                        </div>
                        <div className="text-xs text-zinc-500">ID: {item.telegramId || item.id}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Contact",
            cell: (item: Customer) => (
                <div className="text-xs text-zinc-400 space-y-1">
                    {item.phone && <div>📞 {item.phone}</div>}
                    {item.email && <div>📧 {item.email}</div>}
                    {!item.phone && !item.email && <span className="text-zinc-600 italic">No contact info</span>}
                </div>
            )
        },
        {
            header: "AI Vibe Profile",
            cell: (item: Customer) => {
                if (!item.vibe && !item.spice) return <span className="text-zinc-600 italic text-xs">No data yet</span>
                return (
                    <div className="flex flex-col gap-1">
                        {item.vibe && (
                            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded w-fit flex items-center gap-1">
                                <Sparkles size={10} /> {item.vibe}
                            </span>
                        )}
                        {item.spice && (
                            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded w-fit">
                                Spice: {item.spice}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            header: "Last Seen",
            accessorKey: "lastLogin" as keyof Customer,
            cell: (item: Customer) => {
                const date = item.lastLogin?.toDate ? item.lastLogin.toDate() : new Date(item.lastLogin)
                return (
                    <div className="text-xs text-zinc-400">
                        {date.toLocaleDateString()} <br />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                        <Users className="text-purple-500" /> CRM / Guests
                    </h2>
                    <p className="text-zinc-400">Manage customer profiles and AI preferences.</p>
                </div>
            </div>

            <AdminDataTable
                data={customers}
                columns={columns}
                searchKeys={['firstName', 'lastName', 'username', 'phone']}
                searchPlaceholder="Search guests..."
            />
        </div>
    )
}
