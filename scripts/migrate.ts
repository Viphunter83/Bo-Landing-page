import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import { getMenu } from "../app/data/menuData";
import { getContent } from "../app/data/content";
import { boConfig, lunaConfig } from "../app/lib/config/tenant";

// Use environment variables for Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'bo_dubai';

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Missing Firebase environment variables. Please check .env.local");
    process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log(`🚀 Starting Multi-Tenant Migration for: ${tenantId}...`);
    console.log(`📍 Targeting Project: ${firebaseConfig.projectId}`);

    try {
        // 1. Migrate Site Settings
        console.log("⚙️ Migrating Site Settings...");
        const currentConfig = tenantId === 'luna_hcmc' ? lunaConfig : boConfig;
        const settingsRef = doc(db, 'site_settings', tenantId);
        await writeBatch(db).set(settingsRef, {
            ...currentConfig,
            updatedAt: new Date().toISOString()
        }).commit();
        console.log(`✅ Site settings migrated for ${tenantId}`);

        const fullMenu = getMenu(tenantId);
        const content = getContent(currentConfig);


        // 2. Migrate Menu
        console.log("📦 Migrating Menu...");
        const menuBatch = writeBatch(db);
        fullMenu.forEach((item: any) => {
            const ref = doc(db, 'menu_items', `${tenantId}_${item.id}`);
            menuBatch.set(ref, {
                ...item,
                tenantId,
                updatedAt: new Date().toISOString()
            });
        });
        await menuBatch.commit();
        console.log(`✅ Menu migrated: ${fullMenu.length} items`);

        // 3. Migrate Content
        console.log("📝 Migrating Content...");
        const contentBatch = writeBatch(db);
        Object.entries(content).forEach(([lang, data]: [string, any]) => {
            const ref = doc(db, 'site_content', `${tenantId}_${lang}`);
            contentBatch.set(ref, {
                ...data,
                tenantId,
                lang,
                updatedAt: new Date().toISOString()
            });
        });
        await contentBatch.commit();
        console.log(`✅ Content migrated: ${Object.keys(content).join(', ')}`);

        console.log("🎉 Migration Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
}

migrate();
