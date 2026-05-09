'use client'

import { useTenant } from '../context/TenantContext'
import { useEffect, useState } from 'react'

const SchemaScript = () => {
    const tenantConfig = useTenant()
    const [baseUrl, setBaseUrl] = useState('https://luna-co-hcmc.vercel.app')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin)
        }
    }, [])

    if (!tenantConfig) return null

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": tenantConfig.brand.name,
        "image": [
            tenantConfig.brand.ogImage.startsWith('http') ? tenantConfig.brand.ogImage : `${baseUrl}${tenantConfig.brand.ogImage}`,
        ],
        "@id": baseUrl,
        "url": baseUrl,
        "telephone": tenantConfig.contact.phone,
        "menu": baseUrl,
        "servesCuisine": tenantConfig.brand.cuisines || ["Vietnamese", "Cocktails", "Asian"],
        "priceRange": tenantConfig.localization.currency.code === 'VND' ? "50000-500000 VND" : "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": tenantConfig.contact.address,
            "addressLocality": tenantConfig.contact.city || (tenantConfig.id === 'luna_hcmc' ? "Ho Chi Minh City" : "Dubai"),
            "addressRegion": tenantConfig.contact.city || (tenantConfig.id === 'luna_hcmc' ? "Ho Chi Minh City" : "Dubai"),
            "addressCountry": tenantConfig.contact.countryCode || (tenantConfig.id === 'luna_hcmc' ? "VN" : "AE")
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ],
                "opens": "12:00",
                "closes": "23:00"
            }
        ],
        "sameAs": Object.values(tenantConfig.contact.socials).filter(Boolean),
        "potentialAction": {
            "@type": "OrderAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": baseUrl,
                "inLanguage": tenantConfig.localization.defaultLang,
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform"
                ]
            }
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

export default SchemaScript

