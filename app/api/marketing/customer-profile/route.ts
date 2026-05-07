import { NextResponse } from 'next/server'
import { getTenantCollection } from '@/app/lib/db/tenant_db'
import { query, where, getDocs, limit } from 'firebase/firestore'
import { logger } from '@/app/lib/logger'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!email && !phone) {
        return NextResponse.json({ error: 'Email or Phone required' }, { status: 400 })
    }

    try {
        const profile = {
            email,
            phone,
            segments: [] as string[],
            stats: {
                totalOrders: 0,
                totalSpent: 0,
                lastVisit: null as string | null,
                favoriteCategory: 'Unknown'
            },
            history: {
                orders: [] as any[],
                bookings: [] as any[],
                quiz: null as any
            }
        }

        // 1. Fetch Quiz Results
        if (email) {
            const qQuiz = query(getTenantCollection('quiz_results'), where('email', '==', email), limit(1))
            const snapQuiz = await getDocs(qQuiz)
            if (!snapQuiz.empty) {
                profile.history.quiz = snapQuiz.docs[0].data()
                // Add segments from quiz
                if (profile.history.quiz.marketing_segments) {
                    profile.segments.push(...profile.history.quiz.marketing_segments)
                }
            }
        }

        // 2. Fetch Orders
        // Note: Orders might not always have email, we assume basic matching
        const ordersRef = getTenantCollection('orders')
        const orderQueries = []
        if (email) orderQueries.push(query(ordersRef, where('email', '==', email)))
        if (phone) orderQueries.push(query(ordersRef, where('phone', '==', phone)))

        // Execute parallel
        const orderSnaps = await Promise.all(orderQueries.map(q => getDocs(q)))
        const uniqueOrders = new Map()

        orderSnaps.forEach(snap => {
            snap.forEach(doc => {
                uniqueOrders.set(doc.id, { id: doc.id, ...doc.data() })
            })
        })

        profile.history.orders = Array.from(uniqueOrders.values())
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))

        // 3. Fetch Bookings
        const bookingsRef = getTenantCollection('bookings')
        const bookingQueries = []
        if (email) bookingQueries.push(query(bookingsRef, where('email', '==', email)))
        if (phone) bookingQueries.push(query(bookingsRef, where('phone', '==', phone)))

        const bookingSnaps = await Promise.all(bookingQueries.map(q => getDocs(q)))
        const uniqueBookings = new Map()
        bookingSnaps.forEach(snap => {
            snap.forEach(doc => {
                uniqueBookings.set(doc.id, { id: doc.id, ...doc.data() })
            })
        })

        profile.history.bookings = Array.from(uniqueBookings.values())
            .sort((a, b) => (b.bookingDateTime || '').localeCompare(a.bookingDateTime || ''))

        // 4. Calculate Stats
        profile.stats.totalOrders = profile.history.orders.length
        profile.stats.totalSpent = profile.history.orders.reduce((acc, order) => acc + (order.total || 0), 0)

        const lastOrder = profile.history.orders[0]
        const lastBooking = profile.history.bookings[0]

        // Determine last visit
        if (lastOrder && lastBooking) {
            // Compare dates roughly
            const orderTime = lastOrder.createdAt?.seconds * 1000 || 0
            // Booking dateTime is string "YYYY-MM-DD HH:mm" usually
            const bookingTime = new Date(lastBooking.bookingDateTime || 0).getTime()
            profile.stats.lastVisit = orderTime > bookingTime
                ? new Date(orderTime).toISOString()
                : lastBooking.bookingDateTime
        } else if (lastOrder) {
            profile.stats.lastVisit = new Date(lastOrder.createdAt?.seconds * 1000).toISOString()
        } else if (lastBooking) {
            profile.stats.lastVisit = lastBooking.bookingDateTime
        }

        // Simple Segmentation logic
        if (profile.stats.totalSpent > 500) profile.segments.push('Big Spender')
        if (profile.history.bookings.length > 3) profile.segments.push('Regular Diner')

        return NextResponse.json({ success: true, profile })
    } catch (error: any) {
        logger.error('Failed to fetch customer profile', { error: error.message })
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

