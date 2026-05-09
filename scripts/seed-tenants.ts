import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function formatPrivateKey(key: string | undefined) {
    if (!key) return undefined;
    return key.replace(/\\n/g, '\n');
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials in .env.local');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const db = admin.firestore();

const boConfig = {
    id: 'bo_dubai',
    brand: {
        name: 'Bo Restaurant',
        legalName: 'Bo Restaurant Dubai',
        description: {
            en: 'Experience the soul of Vietnam in Dubai Festival City. Authentic Pho, Banh Mi, and more.',
            ru: 'Попробуйте душу Вьетнама в Dubai Festival City. Аутентичный Фо, Бан Ми и многое другое.',
            vn: 'Trải nghiệm linh hồn của Việt Nam tại Dubai Festival City. Phở, Bánh Mì chính hiệu và hơn thế nữa.'
        },
        logo: '/logo.png',
        ogImage: '/images/og-image.jpg',
        keywords: ['Vietnamese Food Dubai', 'Best Pho Dubai', 'Asian Delivery Dubai', 'Dubai Festival City Restaurants', 'Bo Dubai']
    },
    localization: {
        defaultLang: 'en',
        languages: ['en', 'ru', 'vn'],
        currency: {
            code: 'AED',
            symbol: 'AED',
            precision: 2
        },
        timezone: 'Asia/Dubai'
    },
    features: {
        enableDelivery: true,
        enablePickup: true,
        enableTableQR: true,
        enableBooking: true,
        enableShakeToWin: true,
        enableAIWaiter: true,
        enableReferral: true
    },
    contact: {
        email: 'hello@bo-restaurant.com',
        phone: '+971 50 123 4567',
        whatsapp: '971501234567',
        address: 'Dubai Festival City Mall, Waterfront, Dubai, UAE',
        googleMapsLink: 'https://maps.app.goo.gl/example',
        socials: {
            instagram: 'https://instagram.com/bo.dubai',
            telegram: 'https://t.me/bo_dubai'
        }
    },
    theme: {
        mode: 'dark',
        primaryColor: '#e11d48',
        tokens: {
            background: '0 0% 3.9%',
            foreground: '0 0% 98%',
            card: '0 0% 3.9%',
            cardForeground: '0 0% 98%',
            popover: '0 0% 3.9%',
            popoverForeground: '0 0% 98%',
            primary: '346.8 77.2% 49.8%',
            primaryForeground: '355.7 100% 97.3%',
            secondary: '0 0% 14.9%',
            secondaryForeground: '0 0% 98%',
            muted: '0 0% 14.9%',
            mutedForeground: '0 0% 63.9%',
            accent: '0 0% 14.9%',
            accentForeground: '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            destructiveForeground: '0 0% 98%',
            border: '0 0% 14.9%',
            input: '0 0% 14.9%',
            ring: '346.8 77.2% 49.8%',
            radius: '0.5rem'
        }
    },
    content: {
        ticker: {
            names: ['Ali', 'Sarah', 'Dmitry', 'Elena', 'Mohammed', 'Jessica', 'Ivan', 'Zara'],
            locations: ['JVC', 'Marina', 'Downtown', 'Business Bay', 'Palm Jumeirah'],
            dishes: [
                { id: 'pho-bo-special', name: { en: 'Pho Bo Special', ru: 'Фо Бо Спешл', vn: 'Phở Bò Đặc Biệt' } },
                { id: 'nem-ran', name: { en: 'Nem Ran', ru: 'Нем Ран', vn: 'Nem Rán' } },
                { id: 'mango-shake', name: { en: 'Mango Shake', ru: 'Манго Шейк', vn: 'Sinh Tố Xoài' } }
            ]
        },
        faq: [
            {
                question: { en: 'Where are you located?', ru: 'Где вы находитесь?', vn: 'Bạn ở đâu?' },
                answer: { en: 'We are in Dubai Festival City Mall, Waterfront.', ru: 'Мы находимся в Dubai Festival City Mall, на набережной.', vn: 'Chúng tôi ở Dubai Festival City Mall, Waterfront.' }
            },
            {
                question: { en: 'Do you deliver?', ru: 'Есть ли у вас доставка?', vn: 'Bạn có giao hàng không?' },
                answer: { en: 'Yes, we deliver via Talabat, Deliveroo, and Noon.', ru: 'Да, мы доставляем через Talabat, Deliveroo и Noon.', vn: 'Có, chúng tôi giao hàng qua Talabat, Deliveroo và Noon.' }
            }
        ],
        deliveryLinks: [
            { platform: 'Talabat', url: 'https://talabat.com/bo-dubai' },
            { platform: 'Deliveroo', url: 'https://deliveroo.ae/bo-dubai' }
        ]
    }
};

const lunaConfig = {
    id: 'luna_hcmc',
    brand: {
        name: 'Luna & Co.',
        legalName: 'Luna & Co. Rooftop Bar',
        description: {
            en: 'Atmospheric rooftop space in Ho Chi Minh City. Cocktails, music, and privacy.',
            ru: 'Атмосферное пространство на крыше в Хошимине. Коктейли, музыка и уединение.',
            vn: 'Không gian rooftop đầy ấn tượng tại Thành phố Hồ Chí Minh. Cocktail, âm nhạc và sự riêng tư.'
        },
        logo: '/luna-logo.png',
        ogImage: '/images/luna-og.jpg',
        keywords: ['Rooftop Bar HCMC', 'Best Cocktails Ho Chi Minh', 'Expats Lounge Vietnam', 'Luna and Co']
    },
    localization: {
        defaultLang: 'vn',
        languages: ['en', 'vn'],
        currency: {
            code: 'VND',
            symbol: '₫',
            precision: 0
        },
        timezone: 'Asia/Ho_Chi_Minh'
    },
    features: {
        enableDelivery: false,
        enablePickup: false,
        enableTableQR: true,
        enableBooking: true,
        enableShakeToWin: true,
        enableAIWaiter: true,
        enableReferral: true
    },
    contact: {
        email: 'hello@luna-hcmc.com',
        phone: '+84 123 456 789',
        whatsapp: '84123456789',
        address: 'District 1, Ho Chi Minh City, Vietnam',
        googleMapsLink: 'https://maps.app.goo.gl/luna-example',
        socials: {
            instagram: 'https://instagram.com/luna.hcmc',
            zalo: 'https://zalo.me/luna-hcmc'
        }
    },
    theme: {
        mode: 'dark',
        primaryColor: '#8b5cf6',
        tokens: {
            background: '260 25% 4%',
            foreground: '260 10% 98%',
            card: '260 25% 6%',
            cardForeground: '260 10% 98%',
            popover: '260 25% 6%',
            popoverForeground: '260 10% 98%',
            primary: '263.4 70% 50.4%',
            primaryForeground: '210 40% 98%',
            secondary: '260 20% 15%',
            secondaryForeground: '260 10% 98%',
            muted: '260 20% 15%',
            mutedForeground: '260 10% 65%',
            accent: '320 70% 60%',
            accentForeground: '0 0% 100%',
            destructive: '0 62.8% 30.6%',
            destructiveForeground: '0 0% 98%',
            border: '260 20% 20%',
            input: '260 20% 20%',
            ring: '263.4 70% 50.4%',
            radius: '1rem'
        }
    },
    content: {
        ticker: {
            names: ['Minh', 'Linh', 'Anh', 'Kevin', 'Trang', 'Vinh', 'Hien'],
            locations: ['District 1', 'District 2', 'District 7', 'Thao Dien', 'Binh Thanh'],
            dishes: [
                { id: 'signature-cocktail', name: { en: 'Signature Cocktail', ru: 'Авторский коктейль', vn: 'Cocktail đặc trưng' } },
                { id: 'premium-cheese-platter', name: { en: 'Premium Cheese Platter', ru: 'Сырная тарелка Премиум', vn: 'Khay phô mai cao cấp' } },
                { id: 'sunset-sparkling', name: { en: 'Sunset Sparkling', ru: 'Игристое Сансет', vn: 'Vang nổ Sunset' } }
            ]
        },
        faq: [
            {
                question: { en: 'Do I need a reservation?', ru: 'Нужно ли бронировать?', vn: 'Tôi có cần đặt chỗ trước không?' },
                answer: { en: 'Yes, we recommend booking in advance for the best view.', ru: 'Да, мы рекомендуем бронировать заранее для лучшего вида.', vn: 'Có, chúng tôi khuyên bạn nên đặt chỗ trước để có tầm nhìn tốt nhất.' }
            },
            {
                question: { en: 'Is there a dress code?', ru: 'Есть ли дресс-код?', vn: 'Có quy định về trang phục không?' },
                answer: { en: 'Smart casual is preferred.', ru: 'Предпочтителен стиль Smart Casual.', vn: 'Ưu tiên trang phục lịch sự (Smart Casual).' }
            }
        ]
    }
};

async function seed() {
    console.log('Seeding bo_dubai...');
    await db.collection('tenants').doc('bo_dubai').set(boConfig);
    console.log('Seeding luna_hcmc...');
    await db.collection('tenants').doc('luna_hcmc').set(lunaConfig);
    console.log('Seed completed successfully!');
}

seed().catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
});
