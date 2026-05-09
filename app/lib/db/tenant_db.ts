import { db } from '../firebase';
import { collection, CollectionReference, DocumentData } from 'firebase/firestore';

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';

/**
 * Returns a tenant-scoped collection reference.
 * Pattern: tenants/{tenantId}/{collectionName}
 */
export function getTenantCollection(collectionName: string, tenantId?: string): CollectionReference<DocumentData> {
    if (!db) throw new Error('Firestore is not initialized');
    const id = tenantId || DEFAULT_TENANT_ID;
    return collection(db, 'tenants', id, collectionName);
}

/**
 * Returns the raw tenant ID.
 */
export function getTenantId(tenantId?: string): string {
    return tenantId || DEFAULT_TENANT_ID;
}
