import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTenantConfig } from '../lib/firebase/tenant'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const headersList = headers();
    const tenantId = headersList.get('x-tenant-id') || process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc';
    const tenantConfig = await getTenantConfig(tenantId);
    
    if (!tenantConfig) {
        return {
            title: 'Restaurant',
        };
    }

    // Type-safe locale checking - support all locales from middleware
    const lang = params.lang as 'en' | 'ru' | 'vn' | 'ar';
    const description = (tenantConfig.brand.description as any)[lang] || tenantConfig.brand.description.en;

    return {
        title: `${tenantConfig.brand.name} - ${description.split('.')[0]}`,
        description: description,
        openGraph: {
            locale: params.lang === 'ru' ? 'ru_RU' : params.lang === 'vn' ? 'vi_VN' : params.lang === 'ar' ? 'ar_AR' : 'en_US',
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
