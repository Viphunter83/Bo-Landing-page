'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import AdminOrderModal from '../components/AdminOrderModal'
import AdminDataTable from './components/AdminDataTable'
import { BadgeCheck, Clock, Check, X, MapPin, Phone, ShoppingBag, Utensils, AlertCircle } from 'lucide-react'
import { useToast } from './context/ToastContext'
import { UnifiedOrder } from '../lib/types/core'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
    const [unifiedData, setUnifiedData] = useState<UnifiedOrder[]>([])
    const [stats, setStats] = useState({ total: 0, actions_needed: 0, today: 0 })
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const { showToast } = useToast()

    // Separate states for raw data to facilitate merging
    const [rawBookings, setRawBookings] = useState<UnifiedOrder[]>([])
    const [rawOrders, setRawOrders] = useState<UnifiedOrder[]>([])

    useEffect(() => {
        if (!db) return

        // 1. Subscribe to Bookings
        const qBookings = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50))
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data()
                return {
                    id: doc.id,
                    dataSource: 'booking',
                    type: d.type || 'dine_in',
                    status: d.status || 'pending',
                    name: d.name || 'Unknown',
                    phone: d.phone || '',
                    date: d.date || '',
                    time: d.time || '',
                    guests: d.guests,
                    specialRequests: d.specialRequests,
                    items: d.items, // might be string or array
                    createdAt: d.createdAt
                } as UnifiedOrder
            })
            setRawBookings(data)
        })

        // 2. Subscribe to Orders
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data()
                const dateObj = d.createdAt?.toDate ? d.createdAt.toDate() : new Date()
                return {
                    id: doc.id,
                    dataSource: 'order',
                    type: d.type || 'online_order',
                    status: d.status || 'new',
                    name: d.name || 'Guest',
                    phone: d.phone || '',
                    address: d.address ? `${d.address}${d.apartment ? ', ' + d.apartment : ''}` : undefined,
                    date: dateObj.toLocaleDateString(),
                    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    items: d.items,
                    notes: d.notes,
                    total: d.total,
                    createdAt: d.createdAt
                } as UnifiedOrder
            })
            setRawOrders(data)
        })

        return () => {
            unsubBookings()
            unsubOrders()
        }
    }, [])

    // Merge & Calc Stats whenever raw data changes
    useEffect(() => {
        const merged = [...rawBookings, ...rawOrders].sort((a, b) => {
            const tA = a.createdAt?.seconds || 0
            const tB = b.createdAt?.seconds || 0
            return tB - tA
        })
        setUnifiedData(merged)

        const todayStr = new Date().toISOString().split('T')[0]
        // Approx check for "today" in YYYY-MM-DD or localised string match if needed. 
        // For robustness, we just check list length changes for now or simple string match if strictly formatted.
        // Assuming 'date' field in bookings is YYYY-MM-DD. Orders is toLocaleDateString (might vary).
        // Let's rely on simple counters for MVP.

        setStats({
            total: merged.length,
            actions_needed: merged.filter(x => ['pending', 'new'].includes(x.status)).length,
            today: merged.filter(x => x.dataSource === 'booking' ? x.date === todayStr : true).length // Placeholder logic
        })
    }, [rawBookings, rawOrders])

    const updateStatus = async (id: string, status: string, dataSource: string) => {
        if (!db) return
        const collectionName = dataSource === 'order' ? 'orders' : 'bookings'
        try {
            await updateDoc(doc(db, collectionName, id), { status })
            showToast(`Status updated to ${status}`, 'success')
        } catch (e) {
            console.error(e)
            showToast('Failed to update status', 'error')
        }
    }

    const columns = [
        {
            header: "Type",
            accessorKey: "type" as keyof UnifiedOrder,
            sortable: true,
            cell: (item: UnifiedOrder) => <Badge type={item.type} />
        },
        {
            header: "Customer",
            accessorKey: "name" as keyof UnifiedOrder,
            sortable: true,
            cell: (item: UnifiedOrder) => (
                <div className="flex flex-col">
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Phone size={10} /> {item.phone}
                    </span>
                    {item.address && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 max-w-[150px] truncate" title={item.address}>
                            <MapPin size={10} /> {item.address}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "Details",
            accessorKey: "date" as keyof UnifiedOrder, // Sort by date string roughly
            cell: (item: UnifiedOrder) => (
                <div className="text-xs">
                    <div className="font-medium text-zinc-300">{item.date}</div>
                    <div className="text-zinc-500">{item.time}</div>
                    {item.guests && (
                        <div className="mt-1 text-zinc-400">{item.guests} Guests</div>
                    )}
                </div>
            )
        },
        {
            header: "Items / Notes",
            cell: (item: UnifiedOrder) => (
                <div className="max-w-[200px] text-xs">
                    {Array.isArray(item.items) ? (
                        <div className="space-y-0.5">
                            {item.items.map((i: any, idx: number) => (
                                <div key={idx} className="text-zinc-300">
                                    <span className="text-red-400 font-bold">{i.quantity}x</span> {i.name}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-400 italic">{item.items || item.notes || '-'}</div>
                    )}
                    {(item.specialRequests || item.notes) && (
                        <div className="mt-1 text-yellow-500/80 truncate">
                            &quot;{item.specialRequests || item.notes}&quot;
                        </div>
                    )}
                    {item.total && (
                        <div className="mt-1 font-bold text-white border-t border-zinc-800 pt-1">
                            Total: {item.total} AED
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as keyof UnifiedOrder,
            sortable: true,
            cell: (item: UnifiedOrder) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${['confirmed', 'ready', 'delivered', 'completed'].includes(item.status) ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    ['cancelled', 'rejected'].includes(item.status) ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                    {item.status}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                        <BadgeCheck className="text-blue-500" /> Unified Command
                    </h2>
                    <p className="text-zinc-400">All bookings and orders in one place.</p>
                </div>
                <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    + New Order
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Activity" value={stats.total.toString()} icon={<Clock size={20} className="text-zinc-500" />} />
                <StatCard
                    title="Action Needed"
                    value={stats.actions_needed.toString()}
                    color="text-yellow-500"
                    alert={stats.actions_needed > 0}
                    icon={<AlertCircle size={20} className={stats.actions_needed > 0 ? "text-yellow-500" : "text-zinc-500"} />}
                />
                {/* Third card placeholder or another stat */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium mb-1">System Status</h3>
                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Updates
                        </div>
                    </div>
                </div>
            </div>

            <AdminDataTable
                data={unifiedData}
                columns={columns}
                searchKeys={['name', 'phone', 'id']}
                searchPlaceholder="Search by guest name, phone, or ID..."
                filters={[
                    {
                        key: 'type',
                        label: 'Type',
                        options: [
                            { value: 'dine_in', label: 'Dine In' },
                            { value: 'delivery', label: 'Delivery' },
                            { value: 'pickup', label: 'Pickup' },
                            { value: 'online_order', label: 'Online Order' }
                        ]
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'new', label: 'New' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'ready', label: 'Ready' },
                            { value: 'out_for_delivery', label: 'Delivering' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ]
                    }
                ]}
                actions={(item) => (
                    <div className="flex items-center justify-end gap-2">
                        {(item.status === 'pending' || item.status === 'new') && (
                            <>
                                <button
                                    onClick={() => updateStatus(item.id, 'confirmed', item.dataSource)}
                                    className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-lg transition"
                                    title="Accept"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={() => updateStatus(item.id, 'cancelled', item.dataSource)}
                                    className="bg-zinc-800 hover:bg-red-900/50 text-red-500 p-1.5 rounded-lg transition"
                                    title="Reject"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        )}
                        {/* Fallback delete or view can go here if needed */}
                    </div>
                )}
            />

            <AdminOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </div>
    )
}

function Badge({ type }: { type: string }) {
    const config = {
        dine_in: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Utensils, label: 'Dine In' },
        delivery: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ShoppingBag, label: 'Delivery' },
        pickup: { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: ShoppingBag, label: 'Pickup' },
        online_order: { color: 'text-teal-400', bg: 'bg-teal-500/10', icon: ShoppingBag, label: 'Online' }
    }
    // @ts-ignore
    const c = config[type] || config.dine_in
    const Icon = c.icon
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${c.color} ${c.bg} border border-${c.color.split('-')[1]}-500/20`}>
            {Icon && <Icon size={10} />}
            {c.label}
        </span>
    )
}

function StatCard({ title, value, color = "text-white", alert = false, icon }: { title: string; value: string; color?: string, alert?: boolean, icon?: any }) {
    return (
        <div className={`bg-zinc-900/50 p-6 rounded-xl border ${alert ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-zinc-800'} transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
                {icon}
            </div>
            <div className={`text-4xl font-black ${color}`}>{value}</div>
        </div>
    )
}
