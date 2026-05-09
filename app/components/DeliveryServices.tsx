'use client'

import { ExternalLink, ShoppingBag } from 'lucide-react'
import { useTenant } from '../context/TenantContext'

interface DeliveryServicesProps {
    lang: string
}

export default function DeliveryServices({ lang }: DeliveryServicesProps) {
    const tenantConfig = useTenant()
    if (!tenantConfig.features.enableDelivery || !tenantConfig.content.deliveryLinks) {
        return null
    }

    const isRTL = lang === 'ar'
    const deliveryLinks = tenantConfig.content.deliveryLinks

    const titles = {
        en: 'Order Online',
        ru: 'Заказать онлайн',
        vn: 'Đặt hàng trực tuyến',
        ar: 'اطلب عبر الإنترنت'
    }

    const subtitles = {
        en: 'Fast delivery to your door',
        ru: 'Быстрая доставка до двери',
        vn: 'Giao hàng nhanh tận nơi',
        ar: 'توصيل سريع لبابك'
    }

    // Platform styles mapping
    const platformStyles: Record<string, string> = {
        Talabat: 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white',
        Deliveroo: 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white',
        Noon: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black',
        Grab: 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white',
        Shopee: 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white',
        Gojek: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white',
    }

    const defaultStyle = 'bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white'

    return (
        <div className={`relative overflow-hidden bg-card/50 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg border border-primary/10">
                    <ShoppingBag className="text-primary" size={20} />
                </div>
                <div>
                    {/* @ts-ignore */}
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{titles[lang] || titles.en}</h3>
                    <p className="text-muted-foreground text-xs">
                        {/* @ts-ignore */}
                        {subtitles[lang] || subtitles.en}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                {deliveryLinks.map((service) => (
                    <a
                        key={service.platform}
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            group relative flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300
                            ${platformStyles[service.platform] || defaultStyle}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                {service.icon || '📦'}
                            </span>
                            <span className="text-sm font-bold tracking-wide">
                                {service.platform}
                            </span>
                        </div>
                        <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </a>
                ))}
            </div>
        </div>
    )
}


