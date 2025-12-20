export interface TrendActivity {
    id: string
    type: 'order' | 'booking' | 'review'
    message: {
        en: string
        ru: string
        ar: string
    }
    timestamp: number
}

// Mock Data Generators
const NAMES = ['Ali', 'Sarah', 'Dmitry', 'Elena', 'Mohammed', 'Jessica', 'Ivan', 'Zara']
const DISHES = [
    { id: 'pho-bo-special', name: { en: 'Pho Bo Special', ru: 'Фо Бо Спешл', ar: 'فو بو خاص' } },
    { id: 'nem-ran', name: { en: 'Nem Ran', ru: 'Нем Ран', ar: 'نيم ران' } },
    { id: 'mango-shake', name: { en: 'Mango Shake', ru: 'Манго Шейк', ar: 'مانجو شيك' } },
    { id: 'tom-yum', name: { en: 'Tom Yum', ru: 'Том Ям', ar: 'توم يام' } }
]

const LOCATIONS = ['JVC', 'Marina', 'Downtown', 'Business Bay', 'Palm Jumeirah']

export function generateMockActivity(): TrendActivity {
    const type = Math.random() > 0.3 ? 'order' : (Math.random() > 0.5 ? 'booking' : 'review')
    const name = NAMES[Math.floor(Math.random() * NAMES.length)]
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]

    // Generate Messages based on type
    if (type === 'order') {
        const dish = DISHES[Math.floor(Math.random() * DISHES.length)]
        return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            message: {
                en: `🔥 ${name} from ${location} just ordered ${dish.name.en}`,
                ru: `🔥 ${name} из ${location} заказал(а) ${dish.name.ru}`,
                ar: `🔥 ${name} من ${location} طلب للتو ${dish.name.ar}`
            },
            timestamp: Date.now()
        }
    }

    if (type === 'booking') {
        return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            message: {
                en: `📅 New table booking for tonight! (${Math.floor(Math.random() * 4) + 2} guests)`,
                ru: `📅 Новая бронь столика на сегодня! (${Math.floor(Math.random() * 4) + 2} чел.)`,
                ar: `📅 حجز طاولة جديد الليلة! (${Math.floor(Math.random() * 4) + 2} ضيوف)`
            },
            timestamp: Date.now()
        }
    }

    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message: {
            en: `⭐️ An amazing 5-star review just came in from Google Maps!`,
            ru: `⭐️ Получен новый отзыв 5 звезд на Google Maps!`,
            ar: `⭐️ تقييم 5 نجوم مذهل وصل للتو من خرائط جوجل!`
        },
        timestamp: Date.now()
    }
}

export function getInitialTrends(): TrendActivity[] {
    return Array.from({ length: 5 }).map(generateMockActivity)
}
