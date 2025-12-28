import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const isRu = params.lang === 'ru'

    return {
        title: isRu
            ? 'Bo Restaurant Dubai - Вьетнамская Кухня'
            : 'Bo Restaurant Dubai - Vietnamese Cuisine',
        description: isRu
            ? 'Попробуйте душу Вьетнама в Dubai Festival City. Настоящий Фо, Бань Ми и многое другое. Доставка по всему Дубаю.'
            : 'Taste the Soul of Vietnam in Dubai Festival City. Authentic Pho, Banh Mi, and more. Delivery across Dubai.',
        openGraph: {
            locale: isRu ? 'ru_RU' : 'en_US',
        }
    }
}

export default function LangLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { lang: string }
}) {
    return (
        <div lang={params.lang} dir={params.lang === 'ar' ? 'rtl' : 'ltr'}>
            {children}
        </div>
    )
}
