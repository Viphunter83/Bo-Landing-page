import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { boConfig, lunaConfig } from '../app/lib/config/tenant';

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function migrate() {
    console.log('Starting migration of tenant configs...');

    const tenants = [boConfig, lunaConfig];

    for (const tenant of tenants) {
        console.log(`Migrating tenant: ${tenant.id}...`);
        await db.collection('tenants').doc(tenant.id).set({
            ...tenant,
            updatedAt: new Date().toISOString()
        });
    }

    console.log('Migration completed successfully!');
}

migrate().catch(console.error);
