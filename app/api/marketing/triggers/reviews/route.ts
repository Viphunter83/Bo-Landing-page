import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { EmailTemplates } from '@/app/lib/email/templates'
// import { Resend } from 'resend' 

// const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        if (!db) throw new Error('DB not initialized')

        // 1. Find orders completed > 2 hours ago (and < 24h to avoid spamming old history)
        // For MVP, we'll just find *recent* completed orders for demonstration.

        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // In a real scenario you would have a 'reviewRequestSent' flag
        const q = query(
            collection(db, 'orders'),
            where('status', '==', 'completed'),
            // Compound queries can be tricky without indexes, so we might filter in JS for MVP
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        const snapshot = await getDocs(q)
        const targets: any[] = []

        snapshot.forEach(doc => {
            const data = doc.data()
            const created = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null

            // Filter locally
            if (created && created < twoHoursAgo && created > twentyFourHoursAgo) {
                // Check if we have email
                if (data.email /* && !data.reviewRequestSent */) {
                    targets.push({ id: doc.id, ...data })
                }
            }
        })

        // 2. Send Emails (Simulated)
        // await Promise.all(targets.map(target => ...))

        const count = targets.length

        return NextResponse.json({
            success: true,
            message: `Found ${count} candidates for Review Request.`,
            candidates: targets.map(t => t.email) // Return list for verification
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
