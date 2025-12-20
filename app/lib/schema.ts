import { fullMenu } from '../data/menuData'

export const getRestaurantSchema = () => {
    const menuItems = fullMenu.map(item => ({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.desc,
        "price": item.price.replace(' AED', ''),
        "priceCurrency": "AED",
        "image": item.image,
        "suitableForDiet": [
            item.vegetarian ? "https://schema.org/VegetarianDiet" : null,
            item.glutenFree ? "https://schema.org/GlutenFreeDiet" : null,
            "https://schema.org/HalalDiet" // All items are Halal based on new concept
        ].filter(Boolean)
    }))

    return {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Bo",
        "image": "https://bo-landing-page.vercel.app/og-image.jpg", // Placeholder
        "description": "Authentic Vietnamese Cuisine in Dubai Festival City. Halal, Fresh, and Fusion.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Market Island, Dubai Festival City Mall",
            "addressLocality": "Dubai",
            "addressCountry": "AE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "25.2212",
            "longitude": "55.3521"
        },
        "telephone": "+971500000000",
        "priceRange": "$$",
        "servesCuisine": "Vietnamese",
        "hasMenu": {
            "@type": "Menu",
            "name": "Main Menu",
            "hasMenuSection": [
                {
                    "@type": "MenuSection",
                    "name": "Classic",
                    "hasMenuItem": menuItems.filter(i => fullMenu.find(m => m.name === i.name)?.category === 'classic')
                },
                {
                    "@type": "MenuSection",
                    "name": "Spicy",
                    "hasMenuItem": menuItems.filter(i => fullMenu.find(m => m.name === i.name)?.category === 'spicy')
                }
            ]
        },
        "potentialAction": {
            "@type": "OrderAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://bo-landing-page.vercel.app",
                "inLanguage": ["en", "ru", "ar"],
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform"
                ]
            }
        }
    }
}
