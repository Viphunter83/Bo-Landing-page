'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminDataTable from '../components/AdminDataTable'
import { Users, Search, Sparkles, MessageCircle, Send } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import Link from 'next/link'

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
    usedPromoCodes?: string[]
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
                        /* eslint-disable-next-line @next/next/no-img-element */
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
        },
        {
            header: "Promo History",
            cell: (item: Customer) => {
                if (!item.usedPromoCodes || item.usedPromoCodes.length === 0) return <span className="text-zinc-600 text-xs">-</span>
                return (
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {item.usedPromoCodes.map((code, i) => (
                            <span key={i} className="text-[10px] bg-green-900/40 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">
                                {code}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            header: "Actions",
            cell: (item: Customer) => {
                const hasContact = item.email || item.telegramId
                if (!hasContact) return null

                return (
                    <Link
                        href={`/admin/marketing?leadId=${item.email || item.telegramId}`}
                        className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 w-fit"
                    >
                        <Send size={12} />
                        Send Offer
                    </Link>
                )
            }
        }
    ]

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newGuest, setNewGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' })
    const [saving, setSaving] = useState(false)

    const handleSaveGuest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGuest.firstName || !newGuest.email) {
            showToast('First Name and Email are required', 'error')
            return
        }

        if (!db) {
            showToast('Database connection missing', 'error')
            return
        }

        setSaving(true)
        try {
            // Check for existing user with same email to avoid duplicates could be added here
            // For now, allow simplified entry

            await addDoc(collection(db as any, 'users'), {
                firstName: newGuest.firstName,
                lastName: newGuest.lastName,
                email: newGuest.email,
                phone: newGuest.phone,
                role: 'guest',
                vibe: 'Manual Entry',
                lastLogin: new Date(),
                createdAt: new Date(),
                photoUrl: '' // Empty for manual
            })

            showToast('Guest added successfully', 'success')
            setIsAddModalOpen(false)
            setNewGuest({ firstName: '', lastName: '', email: '', phone: '' })
        } catch (e) {
            console.error(e)
            showToast('Failed to add guest', 'error')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                        <Users className="text-purple-500" /> CRM / Guests
                    </h2>
                    <p className="text-zinc-400">Manage customer profiles and AI preferences.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                    <Users size={18} />
                    New Guest
                </button>
            </div>

            <AdminDataTable
                data={customers}
                columns={columns}
                searchKeys={['firstName', 'lastName', 'username', 'phone']}
                searchPlaceholder="Search guests..."
            />

            {/* Add Guest Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
                        <h3 className="text-xl font-bold text-white mb-4">Add Manual Guest</h3>
                        <form onSubmit={handleSaveGuest} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white text-sm"
                                        value={newGuest.firstName}
                                        onChange={e => setNewGuest({ ...newGuest, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white text-sm"
                                        value={newGuest.lastName}
                                        onChange={e => setNewGuest({ ...newGuest, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Email (for Offers) *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white text-sm"
                                    value={newGuest.email}
                                    onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white text-sm"
                                    value={newGuest.phone}
                                    onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-zinc-800 text-white font-medium py-2 rounded-lg hover:bg-zinc-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-white text-black font-bold py-2 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Add Guest'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
