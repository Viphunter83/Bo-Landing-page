'use client'

import { useState, useEffect } from 'react'
import { getTenantCollection } from '../../../lib/db/tenant_db'
import { query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { Customer } from '../../../lib/db/customers'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, Coins } from 'lucide-react'

export default function ReferralAdminPage() {
    const [referrers, setReferrers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Fetch customers with > 0 referrals
            // Note: Requires compound index on totalReferrals probably. 
            // Or just fetch all customers logic if small enough? No, bad practice.
            // Using a simple query for now.

            const q = query(
                getTenantCollection('customers'),
                where('totalReferrals', '>', 0),
                orderBy('totalReferrals', 'desc'),
                limit(50)
            )

            const snapshot = await getDocs(q)
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer))
            setReferrers(data)
        } catch (e) {
            console.error("Failed to load referrers", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto text-white">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/marketing" className="p-2 hover:bg-zinc-800 rounded-lg transition">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="text-blue-500" />
                        Referral Program
                    </h1>
                    <p className="text-zinc-400">Track top invites and payouts</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-zinc-400 font-medium">Total Referees</h3>
                        <Users className="text-blue-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold">{referrers.reduce((acc, curr) => acc + (curr.totalReferrals || 0), 0)}</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-zinc-400 font-medium">Total Payouts</h3>
                        <Coins className="text-yellow-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold">{referrers.reduce((acc, curr) => acc + (curr.totalReferralEarnings || 0), 0)} AED</p>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Top Referrers
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Code</th>
                                    <th className="p-4 text-center">Invited</th>
                                    <th className="p-4 text-right">Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {referrers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">No referrals yet</td>
                                    </tr>
                                ) : referrers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                                        <td className="p-4">
                                            <div className="font-bold">{user.name || 'Anonymous'}</div>
                                            <div className="text-xs text-zinc-500">{user.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-mono">
                                                {user.referralCode}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-bold">
                                            {user.totalReferrals || 0}
                                        </td>
                                        <td className="p-4 text-right font-bold text-green-500">
                                            {user.totalReferralEarnings || 0} AED
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
