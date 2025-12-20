import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Config (Same as in migrate.ts)
const firebaseConfig = {
    apiKey: "AIzaSyCJ12etoUPLytv8B8EtdxiXEpMb_SkHpb8",
    authDomain: "bo-restaurant-os.firebaseapp.com",
    projectId: "bo-restaurant-os",
    storageBucket: "bo-restaurant-os.firebasestorage.app",
    messagingSenderId: "174733458826",
    appId: "1:174733458826:web:47840406435a77761f1c73"
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
