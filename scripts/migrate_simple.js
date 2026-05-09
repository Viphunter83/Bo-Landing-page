const admin = require('firebase-admin');
const { boConfig, lunaConfig } = require('../app/lib/config/tenant');

admin.initializeApp({
  projectId: 'sjk-smartview'
});

const db = admin.firestore();

async function migrate() {
  console.log('Starting migration...');
  const tenants = [boConfig, lunaConfig];
  for (const tenant of tenants) {
    console.log(`Setting ${tenant.id}...`);
    await db.collection('tenants').doc(tenant.id).set({
      ...tenant,
      updatedAt: new Date().toISOString()
    });
  }
  console.log('Done!');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
