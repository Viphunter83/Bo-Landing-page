import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Root page handles redirection to the default locale.
 * This is a robust alternative to middleware for the root path.
 */
export default function RootPage() {
    const headersList = headers();
    const host = headersList.get('host') || '';
    
    // Simple tenant detection based on hostname
    const isLuna = host.includes('luna') || process.env.NEXT_PUBLIC_TENANT_ID === 'luna_hcmc';
    const defaultLocale = isLuna ? 'vn' : 'en';
    
    redirect(`/${defaultLocale}`);
}
