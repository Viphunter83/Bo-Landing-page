import HomePage from './components/HomePage'

export default function RootPage({
    searchParams
}: {
    searchParams: { vibe?: string, promoCode?: string }
}) {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const defaultLang = tenantId === 'luna_hcmc' ? 'vn' : 'en';

    return <HomePage lang={defaultLang as any} searchParams={searchParams} />
}
