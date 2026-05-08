import { tenantConfig } from '@/app/lib/config/tenant';

export const CONTACT_INFO = {
    // Format: International format without '+' (e.g. 971500000000)
    whatsapp: tenantConfig.contact.whatsapp,

    // Telegram Username (without @)
    telegram: tenantConfig.contact.socials.telegram || ''
}

