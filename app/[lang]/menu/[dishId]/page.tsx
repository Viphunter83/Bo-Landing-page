import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Flame, Leaf, Share2 } from 'lucide-react'
import { getMenuItemById, fullMenu } from '../../../data/menuData'
import { content } from '../../../data/content'
import JsonLd from '../../../components/JsonLd'
import Navbar from '../../../components/Navbar' // Reusing Navbar for consistency
import Footer from '../../../components/Footer' // Reusing Footer

interface PageProps {
    params: {
        lang: string
        dishId: string
    }
}

// 1. Generate Metadata for SEO (Title, Description, OpenGraph)
export async function generateMetadata({ params: { lang, dishId } }: PageProps) {
    const dish = getMenuItemById(dishId)
    if (!dish) return {}

    const t = content[lang as keyof typeof content]
    const name = lang === 'ru' ? dish.nameRu : lang === 'ar' ? dish.nameAr : dish.name
    const desc = lang === 'ru' ? dish.descRu : lang === 'ar' ? dish.descAr : dish.desc

    return {
        title: `${name} | Bo Restaurant Dubai`,
        description: desc,
        openGraph: {
            title: name,
            description: desc,
            images: [dish.image],
        },
    }
}

// 2. Main Page Component
export default function DishPage({ params: { lang, dishId } }: PageProps) {
    const dish = getMenuItemById(dishId)

    if (!dish) {
        notFound()
    }

    const t = content[lang as keyof typeof content]
    const name = lang === 'ru' ? dish.nameRu : lang === 'ar' ? dish.nameAr : dish.name
    const desc = lang === 'ru' ? dish.descRu : lang === 'ar' ? dish.descAr : dish.desc
    const currency = lang === 'en' ? 'AED' : lang === 'ru' ? 'AED' : 'د.إ'
    const dir = lang === 'ar' ? 'rtl' : 'ltr'

    // 3. Schema.org Data (Product/MenuItem)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product", // Google prefers Product for rich snippets with price
        "name": name,
        "image": dish.image,
        "description": desc,
        "offers": {
            "@type": "Offer",
            "price": dish.price,
            "priceCurrency": "AED",
            "availability": "https://schema.org/InStock"
        }
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white" dir={dir}>
            <JsonLd data={jsonLd} />

            {/* Reduced Navbar for Dish Page */}
            <nav className="absolute top-0 w-full z-50 p-6">
                <Link href={`/${lang}/#menu`} className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full hover:bg-red-600 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">{t.nav.menu}</span>
                </Link>
            </nav>

            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

                    {/* Image Section */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-red-900/20">
                        <Image
                            src={dish.image}
                            alt={name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                            priority
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            {dish.category === 'spicy' && (
                                <span className="bg-red-600/90 text-white p-3 rounded-full backdrop-blur-md animate-pulse">
                                    <Flame size={24} />
                                </span>
                            )}
                            {dish.category === 'fresh' && (
                                <span className="bg-green-600/90 text-white p-3 rounded-full backdrop-blur-md">
                                    <Leaf size={24} />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8 pt-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                {name}
                            </h1>
                            <div className="text-3xl font-medium text-yellow-500 flex items-center gap-2">
                                {dish.price} <span className="text-sm text-zinc-500">{currency}</span>
                            </div>
                        </div>

                        <p className="text-xl text-zinc-300 leading-relaxed font-light">
                            {desc}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            {/* Ingredients / Tags could go here if we had them in data */}
                            <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2 text-zinc-400">
                                <Clock size={16} />
                                <span>15-20 min</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-zinc-800 flex gap-4">
                            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-red-900/20">
                                {t.nav.book}
                            </button>
                            <button className="px-6 py-4 rounded-xl border border-zinc-700 hover:border-white hover:bg-white/10 transition-colors">
                                <Share2 size={24} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            <Footer lang={lang} t={t} />
        </div>
    )
}
