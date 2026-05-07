import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getAdminDb } from '../app/lib/firebase-admin';

async function migrateCollection(collectionName: string, tenantId: string) {
    console.log(`Migrating ${collectionName} to tenants/${tenantId}/${collectionName}...`);
    const db = getAdminDb();
    const sourceRef = db.collection(collectionName);
    const targetRef = db.collection('tenants').doc(tenantId).collection(collectionName);

    const snapshot = await sourceRef.get();
    console.log(`Found ${snapshot.size} documents in ${collectionName}`);

    const batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
        batch.set(targetRef.doc(doc.id), doc.data());
        count++;
        if (count % 400 === 0) {
            await batch.commit();
            console.log(`Committed ${count} documents...`);
        }
    }

    if (count % 400 !== 0) {
        await batch.commit();
    }
    console.log(`Finished migrating ${collectionName}. Total: ${count}`);
}

async function runMigration() {
    const tenantId = 'bo_dubai';
    const collections = [
        'menu_items',
        'ingredients',
        'orders',
        'bookings',
        'coupons',
        'inventory_transactions',
        'site_settings'
    ];

    for (const col of collections) {
        try {
            await migrateCollection(col, tenantId);
        } catch (error) {
            console.error(`Failed to migrate ${col}:`, error);
        }
    }
}

runMigration().then(() => {
    console.log('Migration complete!');
    process.exit(0);
}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
