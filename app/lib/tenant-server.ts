import { headers } from 'next/headers';

export function getTenantIdFromHeaders(): string {
    const headersList = headers();
    const host = headersList.get('host') || '';
    let tenantId = headersList.get('x-tenant-id');
    
    if (!tenantId) {
        if (host.includes('luna')) {
            tenantId = 'luna_hcmc';
        } else if (host.includes('bo-dubai') || host.includes('bo-landing')) {
            tenantId = 'bo_dubai';
        } else {
            tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'luna_hcmc';
        }
    }
    
    return tenantId;
}
