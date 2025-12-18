import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import { fullMenu } from "../app/data/menuData";
import { content } from "../app/data/content";

const firebaseConfig = {
    apiKey: "AIzaSyCJ12etoUPLytv8B8EtdxiXEpMb_SkHpb8",
    authDomain: "bo-restaurant-os.firebaseapp.com",
    projectId: "bo-restaurant-os",
    storageBucket: "bo-restaurant-os.firebasestorage.app",
    messagingSenderId: "174733458826",
    appId: "1:174733458826:web:47840406435a77761f1c73"
};

// Initialize Firebase (Client SDK works in Node env too)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("🚀 Starting Server-Side Migration...");

    try {
        // 1. Migrate Menu
        console.log("📦 Migrating Menu...");
        const menuBatch = writeBatch(db);
        fullMenu.forEach((item) => {
            const ref = doc(db, 'menu_items', item.id);
            menuBatch.set(ref, item);
        });
        await menuBatch.commit();
        console.log(`✅ Menu migrated: ${fullMenu.length} items`);

        // 2. Migrate Content
        console.log("📝 Migrating Content...");
        const contentBatch = writeBatch(db);
        Object.entries(content).forEach(([lang, data]) => {
            const ref = doc(db, 'site_content', lang);
            contentBatch.set(ref, data);
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
