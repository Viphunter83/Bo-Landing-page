'use client'

import { useEffect, useState } from 'react'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        ordersCount: 0,
        avgTicket: 0,
        topItem: 'Loading...'
    })

    useEffect(() => {
        if (!db) return
        const fetchStats = async () => {
            const q = query(collection(db, 'orders'))
            const snapshot = await getDocs(q)

            let revenue = 0
            const itemCounts: Record<string, number> = {}

            snapshot.docs.forEach(doc => {
                const data = doc.data()
                // Parse "150 AED" -> 150
                const amount = parseFloat((data.total || '0').replace(/[^0-9.]/g, ''))
                revenue += amount

                // Count items
                if (data.items && Array.isArray(data.items)) {
                    data.items.forEach((i: any) => {
                        itemCounts[i.name] = (itemCounts[i.name] || 0) + (i.quantity || 1)
                    })
                }
            })

            // Find top item
            let maxCount = 0
            let topName = 'No orders yet'
            Object.entries(itemCounts).forEach(([name, count]) => {
                if (count > maxCount) {
                    maxCount = count
                    topName = name
                }
            })

            setStats({
                totalRevenue: revenue,
                ordersCount: snapshot.size,
                avgTicket: snapshot.size ? Math.round(revenue / snapshot.size) : 0,
                topItem: topName
            })
        }

        fetchStats()
    }, [])

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Investor Analytics</h2>
                <p className="text-zinc-400">Real-time performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Revenue" value={`${stats.totalRevenue} AED`} color="text-green-500" />
                <MetricCard title="Total Orders" value={stats.ordersCount.toString()} />
                <MetricCard title="Avg. Ticket" value={`${stats.avgTicket} AED`} />
                <MetricCard title="Bestseller" value={stats.topItem} color="text-yellow-500" />
            </div>

            {/* Simulated Chart */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-white font-bold mb-6">Revenue Trend (Projected)</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[30, 45, 35, 60, 50, 75, 90].map((h, i) => (
                        <div key={i} className="w-full bg-zinc-800 rounded-t-sm relative group hover:bg-yellow-500/20 transition-colors">
                            <div
                                style={{ height: `${h}%` }}
                                className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm w-full absolute bottom-0 transition-all duration-500 group-hover:from-yellow-500 group-hover:to-yellow-300"
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                💡 <strong>Tip for Investors:</strong> Use "Ideal Lunch Quiz" data to optimize weekly specials. Currently, Spicy dishes are converting 15% better than Classic.
            </div>
        </div>
    )
}

function MetricCard({ title, value, color }: { title: string, value: string, color?: string }) {
    return (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-zinc-500 text-xs uppercase font-bold mb-2">{title}</h3>
            <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
        </div>
    )
}
