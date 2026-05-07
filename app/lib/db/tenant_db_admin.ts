import { getAdminDb } from '../firebase-admin';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';

/**
 * Returns the tenant document reference.
 */
export function getTenantDoc() {
    const db = getAdminDb();
    return db.collection('tenants').doc(TENANT_ID);
}

/**
 * Returns a tenant-scoped collection reference for Admin SDK.
 * Pattern: tenants/{tenantId}/{collectionName}
 */
export function getAdminTenantCollection(collectionName: string) {
    return getTenantDoc().collection(collectionName);
}

/**
 * Returns the raw tenant ID.
 */
export function getTenantId(): string {
    return TENANT_ID;
}
