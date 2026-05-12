import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Config (Same as in migrate.ts)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestOrder() {
    console.log("🛵 SIMULATING Delivery Order...");
    try {
        const orderData = {
            type: 'delivery',
            items: [
                { id: 'pho-bo', name: 'Pho Bo (Large)', price: '45', quantity: 1 },
                { id: 'spring-rolls', name: 'Spring Rolls', price: '25', quantity: 2 }
            ],
            total: '95',
            platform: 'Web',
            status: 'new',
            paymentMethod: 'card',
            name: 'Test Setup User',
            address: 'Dubai Marina, Princess Tower',
            apartment: 'Unit 4502',
            createdAt: serverTimestamp(),
            source: 'test_script'
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log(`✅ Success! Created Delivery Order ID: ${docRef.id}`);
        console.log(`   Type: ${orderData.type}`);
        console.log(`   Address: ${orderData.address}`);
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
}

createTestOrder();
