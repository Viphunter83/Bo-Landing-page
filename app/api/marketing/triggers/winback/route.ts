
import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase'
import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc } from 'firebase/firestore'
import { createCoupon } from '@/app/lib/coupons'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        if (!db) throw new Error('DB not initialized')

        // 1. Logic: Find users whose Last Order was > 30 days ago.
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        // Safety: Only check last 500 recent orders to avoid massive reads, or query properly by user
        // Optimally we should query users collection "lastOrderAt" if it existed.
        // For MVP: Scan recent orders.

        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200))
        const snapshot = await getDocs(q)

        const userLastOrders = new Map<string, { date: Date, name: string, userId?: string, email?: string }>()

        snapshot.forEach(doc => {
            const data = doc.data()
            const email = data.email
            // We prioritize Telegram ID "userId" if available for sending
            const userId = data.userId

            // Key by email or userId to find unique customers
            const key = userId || email

            if (key) {
                if (!userLastOrders.has(key)) {
                    userLastOrders.set(key, {
                        date: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(),
                        name: data.name || 'Friend',
                        userId: userId, // "telegram:12345" or similar
                        email: email
                    })
                }
            }
        })

        const lostCustomers: any[] = []

        // 2. Identify Lost
        userLastOrders.forEach((val, key) => {
            if (val.date < thirtyDaysAgo) {
                lostCustomers.push(val)
            }
        })

        // 3. Send Campaigns (with Safety Check)
        const sentList: string[] = []

        for (const customer of lostCustomers) {
            // Find User Doc to check 'lastWinbackSentAt'
            // We need to query users collection by TelegramId or Email
            let userRef = null

            try {
                let userQ
                if (customer.userId) {
                    // Extract numeric ID if prefixed
                    const numericId = customer.userId.includes(':') ? Number(customer.userId.split(':')[1]) : Number(customer.userId)
                    userQ = query(collection(db, 'users'), where('telegramId', '==', numericId))
                } else if (customer.email) {
                    userQ = query(collection(db, 'users'), where('email', '==', customer.email))
                }

                if (userQ) {
                    const userSnap = await getDocs(userQ)
                    if (!userSnap.empty) {
                        const userDoc = userSnap.docs[0]
                        const userData = userDoc.data()

                        // CHECK SPAM PREVENTION
                        if (userData.lastWinbackSentAt) {
                            const lastSent = userData.lastWinbackSentAt.toDate()
                            const daysSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
                            if (daysSince < 30) {
                                console.log(`Skipping ${customer.name}, winback sent ${Math.floor(daysSince)} days ago.`)
                                continue // SKIP
                            }
                        }
                        userRef = userDoc.ref
                    }
                }
            } catch (err) {
                console.error("Error finding user doc:", err)
            }

            // 4. Generate Coupon
            const coupon = await createCoupon({
                type: 'discount_percentage',
                value: 20,
                userId: customer.userId || customer.email, // Bind to them
                expiryDays: 2, // 48 Hours
                source: 'winback_auto',
                minOrder: 50
            })

            const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bo-landing-page.vercel.app'}/offer/${coupon.code}`
            const message = `👋 Hey ${customer.name || 'Foodie'}! It's been a while.\n\nWe miss you at Bo! 🍜\nHere is a special **20% OFF** your next order to welcome you back.\n\nCode: \`${coupon.code}\`\n(Valid for 48 hours)\n\n[Activate Coupon](${magicLink})`

            // 5. Send Telegram (if ID available) or Email (TODO)
            if (customer.userId) {
                const chatId = customer.userId.includes(':') ? customer.userId.split(':')[1] : customer.userId

                // Call our internal API to send
                // Hack: In server action we can just call helper, but here we reuse the API route logic via fetch or duplicate?
                // Better: Just fetch the API endpoint (loopback) to reuse logic
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/marketing/send/telegram`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatId, message })
                })

                if (response.ok) {
                    sentList.push(customer.name)
                    // Update user doc
                    if (userRef) {
                        await updateDoc(userRef, { lastWinbackSentAt: new Date() })
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            foundLost: lostCustomers.length,
            sentCount: sentList.length,
            sentTo: sentList
        })

    } catch (e: any) {
        console.error("Winback Trigger Error:", e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
