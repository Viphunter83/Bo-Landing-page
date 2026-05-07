import { db } from '../firebase';
import { collection, CollectionReference, DocumentData } from 'firebase/firestore';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';

/**
 * Returns a tenant-scoped collection reference.
 * Pattern: tenants/{tenantId}/{collectionName}
 */
export function getTenantCollection(collectionName: string): CollectionReference<DocumentData> {
    if (!db) throw new Error('Firestore is not initialized');
    return collection(db, 'tenants', TENANT_ID, collectionName);
}

/**
 * Returns the raw tenant ID.
 */
export function getTenantId(): string {
    return TENANT_ID;
}
