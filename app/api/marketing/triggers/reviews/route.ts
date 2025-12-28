import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        if (!db) throw new Error('DB not initialized')

        // 1. Find orders completed > 2 hours ago (and < 24h to avoid spamming old history)
        // For MVP, we'll just find *recent* completed orders for demonstration.

        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // 1. Find recent orders (fetching 50 most recent)
        // We removed 'where' clause to avoid Firestore Index requirement errors for this MVP.
        const q = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        const snapshot = await getDocs(q)
        const targets: any[] = []

        snapshot.forEach(doc => {
            const data = doc.data()
            const created = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null

            // Filter locally for status AND time
            // We check data.status === 'completed' here instead of in the query
            if (data.status === 'completed' && created && created < twoHoursAgo && created > twentyFourHoursAgo) {
                // Check if we have email
                if (data.email) {
                    targets.push({ id: doc.id, ...data })
                }
            }
        })

        const count = targets.length

        return NextResponse.json({
            success: true,
            message: `Found ${count} candidates for Review Request.`,
            candidates: targets.map(t => t.email)
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
