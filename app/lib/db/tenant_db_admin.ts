import { getAdminDb } from '../firebase-admin';

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';

/**
 * Returns the tenant document reference.
 */
export function getTenantDoc(tenantId?: string) {
    const db = getAdminDb();
    const id = tenantId || DEFAULT_TENANT_ID;
    return db.collection('tenants').doc(id);
}

/**
 * Returns a tenant-scoped collection reference for Admin SDK.
 * Pattern: tenants/{tenantId}/{collectionName}
 */
export function getAdminTenantCollection(collectionName: string, tenantId?: string) {
    return getTenantDoc(tenantId).collection(collectionName);
}

/**
 * Returns the raw tenant ID.
 */
export function getTenantId(tenantId?: string): string {
    return tenantId || DEFAULT_TENANT_ID;
}
