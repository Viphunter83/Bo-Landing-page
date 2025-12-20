import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
}

export interface OrderData {
    items: OrderItem[];
    total: string;
    platform: 'WhatsApp' | 'Telegram';
    status: 'new' | 'cooking' | 'ready' | 'completed' | 'cancelled';
    customerPhone?: string; // If we start collecting it
}

export const createOrder = async (order: OrderData) => {
    if (!db) {
        console.warn('Firestore is not initialized. Order not saved to DB.');
        return null; // Graceful fallback if no env vars
    }

    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: serverTimestamp(),
            source: 'web_checkout' // To distinguish from future sources
        });
        console.log('Order saved with ID:', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error adding document: ', e);
        // We don't block the user flow if DB fails, just log it
        return null;
    }
}
