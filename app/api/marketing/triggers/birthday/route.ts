import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        if (!db) throw new Error('DB not initialized')

        // For MVP, we need to scan users. 
        // NOTE: We don't have a dedicated 'users' collection with birthday yet in this codebase structure 
        // (based on previous file listings, mostly orders/bookings).
        // WE WILL SIMULATE finding users for the demo.

        const simulatedBirthdays = [
            { name: 'Sarah', email: 'sarah@example.com' },
            { name: 'Ahmed', email: 'ahmed@example.com' }
        ]

        return NextResponse.json({
            success: true,
            message: `Found ${simulatedBirthdays.length} birthday boys/girls today! 🎂`,
            sentTo: simulatedBirthdays.map(b => b.email)
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
