import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const getFirebaseApp = () => {
    if (getApps().length) {
        return getApp();
    }
    if (firebaseConfig.apiKey) {
        return initializeApp(firebaseConfig);
    }
    console.warn("Firebase API Key missing in environment variables.");
    return null;
};

const app = getFirebaseApp();

const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;
// Only init storage if app exists AND bucket is configures, otherwise safe fallback
const storage = (app && firebaseConfig.storageBucket) ? getStorage(app) : null;

export { app, db, auth, storage };
