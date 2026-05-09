'use client'

import { useTenant } from '../context/TenantContext';
import { getTenantCollection } from '../lib/db/tenant_db';
import { CollectionReference, DocumentData } from 'firebase/firestore';

/**
 * Hook to get a tenant-scoped Firestore collection reference on the client.
 */
export function useTenantCollection(collectionName: string): CollectionReference<DocumentData> {
    const { id: tenantId } = useTenant();
    return getTenantCollection(collectionName, tenantId);
}
