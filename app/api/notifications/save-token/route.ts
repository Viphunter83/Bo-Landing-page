import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'

export async function POST(req: Request) {
    try {
        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
        }
        const { userId, token } = await req.json()

        if (!userId || !token) {
            return NextResponse.json({ error: 'Missing userId or token' }, { status: 400 })
        }

        // We use the 'customers' collection based on previous tasks
        const userRef = doc(db, 'customers', userId)

        // Check if user exists, if not create (though usually they should exist)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                id: userId,
                fcmTokens: [token],
                createdAt: new Date().toISOString()
            })
        } else {
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                lastActiveAt: new Date().toISOString()
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error saving FCM token:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
