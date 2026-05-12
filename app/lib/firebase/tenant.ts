import { getAdminDb } from '../firebase-admin';
import { TenantConfig, boConfig, lunaConfig } from '../config/tenant';
import { unstable_cache } from 'next/cache';

/**
 * Server-side function to fetch tenant configuration from Firestore.
 * Uses unstable_cache to ensure performance matches static generation.
 */
export const getTenantConfig = unstable_cache(
    async (tenantId: string): Promise<TenantConfig | null> => {
        try {
            const db = getAdminDb();
            if (!db) {
                console.warn(`[Tenant] Firebase Admin DB not initialized for tenant: ${tenantId}. Using static fallback.`);
                return tenantId === 'luna_hcmc' ? lunaConfig : boConfig;
            }
            const doc = await db.collection('tenants').doc(tenantId).get();
            
            if (!doc.exists) {
                console.warn(`[Tenant] Config not found in Firestore for: ${tenantId}. Using static fallback.`);
                return tenantId === 'luna_hcmc' ? lunaConfig : boConfig;
            }

            return doc.data() as TenantConfig;
        } catch (error) {
            console.error('[Tenant] Firestore fetch failed. Using static fallback. Error:', error);
            // Return static fallback even on error to keep the site running
            return tenantId === 'luna_hcmc' ? lunaConfig : boConfig;
        }
    },
    ['tenant-config'],
    { revalidate: 3600, tags: ['tenant-config'] }
);
