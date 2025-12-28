import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        if (!db) throw new Error('DB not initialized')

        // Logic: Find users whose Last Order was > 30 days ago.
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100))
        const snapshot = await getDocs(q)

        // Group by email to find LAST order per user
        const lastOrders = new Map()
        snapshot.forEach(doc => {
            const data = doc.data()
            if (data.email) {
                if (!lastOrders.has(data.email)) {
                    lastOrders.set(data.email, {
                        date: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(),
                        name: data.name || 'Friend'
                    })
                }
            }
        })

        const lostCustomers: string[] = []

        lastOrders.forEach((val, email) => {
            if (val.date < thirtyDaysAgo) {
                lostCustomers.push(email)
            }
        })

        return NextResponse.json({
            success: true,
            message: `Found ${lostCustomers.length} lost customers.`,
            customers: lostCustomers
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
