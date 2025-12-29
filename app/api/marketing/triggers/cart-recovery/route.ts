import { NextResponse } from 'next/server'
import { getAdminDb, getAdminMessaging } from '@/app/lib/firebase-admin'

export const dynamic = 'force-dynamic' // Ensure it runs every time (cron)

export async function GET(req: Request) {
    try {
        const db = getAdminDb()
        const messaging = getAdminMessaging()

        // 1. Find potential abandonments
        // Logic: cart not empty, updated > 30 mins ago, no recovery sent recently.
        // Firestore query limitations: can't do complex filters with arrays easily.
        // Better: Query all users with 'cart' field? Or fetch recent active users?
        // Since we don't have a dedicated "carts" collection, we query customers.
        // We rely on 'cartUpdatedAt' field we added.

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const usersSnap = await db.collection('customers')
            .where('cartUpdatedAt', '<', thirtyMinsAgo)
            .where('cartUpdatedAt', '>', twentyFourHoursAgo)
            .get()

        let sentCount = 0

        const batch = db.batch()
        let batchCount = 0

        for (const doc of usersSnap.docs) {
            const data = doc.data()

            // Filter locally for simplicity
            if (!data.cart || data.cart.length === 0) continue
            if (data.lastRecoverySentAt && new Date(data.lastRecoverySentAt) > new Date(data.cartUpdatedAt)) continue
            if (!data.fcmTokens || data.fcmTokens.length === 0) continue

            // Send Push
            const tokens = data.fcmTokens // Array of tokens

            // Multicast
            try {
                const message = {
                    notification: {
                        title: '🍜 Forgotten cravings?',
                        body: 'Your Bun Bo Hue is waiting! Order now for 10% off with code SAVE10.'
                    },
                    data: {
                        url: '/cart?promo=SAVE10' // We handle this URL in SW
                    },
                    tokens: tokens
                }

                const response = await messaging.sendEachForMulticast(message)

                if (response.successCount > 0) {
                    sentCount++
                    // Update user
                    batch.update(doc.ref, {
                        lastRecoverySentAt: new Date().toISOString()
                    })
                    batchCount++
                }
            } catch (e) {
                console.error(`Failed to send to user ${doc.id}`, e)
            }
        }

        if (batchCount > 0) {
            await batch.commit()
        }

        return NextResponse.json({
            success: true,
            scanned: usersSnap.size,
            sent: sentCount
        })

    } catch (error: any) {
        console.error('Cart Recovery Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
