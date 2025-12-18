import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCJ12etoUPLytv8B8EtdxiXEpMb_SkHpb8",
    authDomain: "bo-restaurant-os.firebaseapp.com",
    projectId: "bo-restaurant-os",
    storageBucket: "bo-restaurant-os.firebasestorage.app",
    messagingSenderId: "174733458826",
    appId: "1:174733458826:web:47840406435a77761f1c73"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
