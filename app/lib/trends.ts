import { db } from './firebase'
import { query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { tenantConfig } from './config/tenant'
import { getTenantCollection } from './db/tenant_db'

export interface TrendActivity {
    id: string
    tenantId: string
    type: 'order' | 'booking' | 'review'
    message: {
        en: string
        ru: string
        vn: string
        ar?: string
    }
    timestamp: number
}

// Fallback Mock Data Generators using tenantConfig
export function generateMockActivity(): TrendActivity {
    const { ticker } = tenantConfig.content
    const type = Math.random() > 0.3 ? 'order' : (Math.random() > 0.5 ? 'booking' : 'review')
    const name = ticker.names[Math.floor(Math.random() * ticker.names.length)]
    const location = ticker.locations[Math.floor(Math.random() * ticker.locations.length)]

    if (type === 'order') {
        const dish = ticker.dishes[Math.floor(Math.random() * ticker.dishes.length)]
        return {
            id: Math.random().toString(36).substr(2, 9),
            tenantId: tenantConfig.id,
            type,
            message: {
                en: `🔥 ${name} from ${location} just ordered ${dish.name.en}`,
                ru: `🔥 ${name} из ${location} заказал(а) ${dish.name.ru}`,
                vn: `🔥 ${name} từ ${location} vừa gọi ${dish.name.vn}`,
                ar: `🔥 ${name} من ${location} طلب للتو ${dish.name.ar || dish.name.en}`
            },
            timestamp: Date.now()
        }
    }

    if (type === 'booking') {
        return {
            id: Math.random().toString(36).substr(2, 9),
            tenantId: tenantConfig.id,
            type,
            message: {
                en: `📅 New table booking for tonight! (${Math.floor(Math.random() * 4) + 2} guests)`,
                ru: `📅 Новая бронь столика на сегодня! (${Math.floor(Math.random() * 4) + 2} чел.)`,
                vn: `📅 Đặt bàn mới cho tối nay! (${Math.floor(Math.random() * 4) + 2} khách)`,
                ar: `📅 حجز طاولة جديد الليلة! (${Math.floor(Math.random() * 4) + 2} ضيوف)`
            },
            timestamp: Date.now()
        }
    }

    return {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: tenantConfig.id,
        type,
        message: {
            en: `⭐️ An amazing 5-star review just came in from Google Maps!`,
            ru: `⭐️ Получен новый отзыв 5 звезд на Google Maps!`,
            vn: `⭐️ Một đánh giá 5 sao tuyệt vời vừa đến từ Google Maps!`,
            ar: `⭐️ تقييم 5 نجوم مذهل وصل للتو من خرائط جوجل!`
        },
        timestamp: Date.now()
    }
}

export function getInitialTrends(): TrendActivity[] {
    return Array.from({ length: 5 }).map(generateMockActivity)
}

// Realtime Listener filtered by Tenant
export function subscribeToRealtimeTrends(callback: (activity: TrendActivity) => void) {
    if (!db) return () => { }

    // Listen to recent orders for this tenant
    const qOrders = query(
        getTenantCollection('orders'),
        orderBy('createdAt', 'desc'),
        limit(1)
    )

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data()
                if (Date.now() - (data.createdAt?.toMillis?.() || 0) > 3600000) return

                const name = data.name || data.userId || 'Guest'
                const itemsCount = Array.isArray(data.items) ? data.items.length : 1

                callback({
                    id: change.doc.id,
                    tenantId: tenantConfig.id,
                    type: 'order',
                    message: {
                        en: `🔥 New Order! ${name} ordered ${itemsCount} items.`,
                        ru: `🔥 Новый заказ! ${name} заказал(а) ${itemsCount} блюд.`,
                        vn: `🔥 Đơn hàng mới! ${name} đã gọi ${itemsCount} món.`,
                        ar: `🔥 طلب جديد! ${name} طلب ${itemsCount} عناصر.`
                    },
                    timestamp: Date.now()
                })
            }
        })
    })

    // Listen to recent bookings for this tenant
    const qBookings = query(
        getTenantCollection('bookings'),
        orderBy('createdAt', 'desc'),
        limit(1)
    )

    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data()
                const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
                if (Date.now() - createdAt > 3600000) return

                const guests = data.guests || 2
                callback({
                    id: change.doc.id,
                    tenantId: tenantConfig.id,
                    type: 'booking',
                    message: {
                        en: `📅 New Booking! Table for ${guests}.`,
                        ru: `📅 Новая бронь! Столик на ${guests} персон.`,
                        vn: `📅 Đặt chỗ mới! Bàn cho ${guests} người.`,
                        ar: `📅 حجز جديد! طاولة لـ ${guests}.`
                    },
                    timestamp: Date.now()
                })
            }
        })
    })

    return () => {
        unsubOrders()
        unsubBookings()
    }
}
