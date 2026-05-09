import { MenuItem } from '../data/menuData'
import { TenantConfig } from './config/tenant'

export const getRestaurantSchema = (tenantConfig: TenantConfig, menu: MenuItem[]) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    const menuItems = menu.map(item => ({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.desc,
        "price": item.price.replace(/[^0-9.]/g, ''),
        "priceCurrency": tenantConfig.localization.currency.code,
        "image": item.image,
        "suitableForDiet": [
            item.vegetarian ? "https://schema.org/VegetarianDiet" : null,
            item.glutenFree ? "https://schema.org/GlutenFreeDiet" : null,
            "https://schema.org/HalalDiet" 
        ].filter(Boolean)
    }))

    return {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": tenantConfig.brand.name,
        "image": tenantConfig.brand.ogImage,
        "description": tenantConfig.brand.description.en,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": tenantConfig.contact.address,
            "addressLocality": tenantConfig.contact.city || (tenantConfig.id.includes('hcmc') ? "Ho Chi Minh City" : "Dubai"),
            "addressCountry": tenantConfig.contact.countryCode || (tenantConfig.id.includes('hcmc') ? "VN" : "AE")
        },
        "telephone": tenantConfig.contact.phone,
        "priceRange": "$$",
        "servesCuisine": tenantConfig.brand.cuisines || ["Vietnamese", "International"],
        "hasMenu": {
            "@type": "Menu",
            "name": "Main Menu",
            "hasMenuSection": [
                {
                    "@type": "MenuSection",
                    "name": "Classic",
                    "hasMenuItem": menuItems.filter(i => {
                        const originalItem = menu.find(m => m.name === i.name);
                        return originalItem?.category === 'classic';
                    })
                },
                {
                    "@type": "MenuSection",
                    "name": "Spicy",
                    "hasMenuItem": menuItems.filter(i => {
                        const originalItem = menu.find(m => m.name === i.name);
                        return originalItem?.category === 'spicy';
                    })
                }
            ]
        },
        "potentialAction": {
            "@type": "OrderAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": baseUrl,
                "inLanguage": Array.isArray(tenantConfig.localization.languages) ? tenantConfig.localization.languages[0] : 'en',
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform"
                ]
            }
        }
    }
}

