'use client'

import { CONTACT_INFO } from '../data/contact'

const SchemaScript = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Bo Restaurant Dubai",
        "image": [
            "https://bo-restaurant-dubai.vercel.app/images/hero-bg.jpg",
            "https://bo-restaurant-dubai.vercel.app/images/og-image.jpg"
        ],
        "@id": "https://bo-restaurant-dubai.vercel.app",
        "url": "https://bo-restaurant-dubai.vercel.app",
        "telephone": `+${CONTACT_INFO.whatsapp}`, // Using WhatsApp as primary contact for now
        "menu": "https://bo-restaurant-dubai.vercel.app",
        "servesCuisine": ["Vietnamese", "Healthy", "Fusion", "Asian"],
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dubai Festival City",
            "addressLocality": "Dubai",
            "addressRegion": "Dubai",
            "addressCountry": "AE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 25.2216, // Approx DFC coordinates
            "longitude": 55.3512
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                "opens": "12:00",
                "closes": "23:00"
            }
        ],
        "sameAs": [
            "https://instagram.com/bo.restaurant.dubai",
            `https://t.me/${CONTACT_INFO.telegram}`
        ],
        "potentialAction": {
            "@type": "OrderAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://bo-restaurant-dubai.vercel.app",
                "inLanguage": "en-US",
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
