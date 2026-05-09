import { getAdminDb } from '../firebase-admin';
import { TenantConfig } from '../config/tenant';
import { unstable_cache } from 'next/cache';

/**
 * Server-side function to fetch tenant configuration from Firestore.
 * Uses unstable_cache to ensure performance matches static generation.
 */
export const getTenantConfig = unstable_cache(
    async (tenantId: string): Promise<TenantConfig | null> => {
        try {
            const db = getAdminDb();
            const doc = await db.collection('tenants').doc(tenantId).get();
            
            if (!doc.exists) {
                console.error(`Tenant config not found for ID: ${tenantId}`);
                return null;
            }

            return doc.data() as TenantConfig;
        } catch (error) {
            console.error('Error fetching tenant config:', error);
            return null;
        }
    },
    ['tenant-config'],
    { revalidate: 3600, tags: ['tenant-config'] }
);
