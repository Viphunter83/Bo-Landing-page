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
    platform?: 'WhatsApp' | 'Telegram' | 'Web'; // Made optional/broader
    status: 'new' | 'cooking' | 'ready' | 'completed' | 'cancelled';
    customerPhone?: string;
    // New Fields for Phase 9.5 & 12
    type?: 'dine_in' | 'delivery' | 'pickup' | 'online_order';
    address?: string;
    apartment?: string;
    paymentMethod?: 'cash' | 'card' | 'online';
    name?: string;
    email?: string;

    // Phase 12 Delivery Fields
    deliveryZoneId?: string;
    deliveryFee?: number;
    deliveryStatus?: 'pending' | 'assigned' | 'out_for_delivery' | 'delivered';
    driverId?: string;
}

export const createOrder = async (order: OrderData) => {
    if (!db) {
        console.warn('Firestore is not initialized. Order not saved to DB.');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            type: order.type || 'dine_in', // Default
            createdAt: serverTimestamp(),
            source: 'web_checkout'
        });
        console.log('Order saved with ID:', docRef.id);

        // --- Strategic Phase 2: Hyper-personalization ---
        // Fire-and-forget customer profile update
        const identifier = order.customerPhone || order.email;
        if (identifier) {
            import('./customers').then(({ upsertCustomer }) => {
                const totalVal = parseFloat(order.total.replace(/[^0-9.]/g, '')) || 0;
                upsertCustomer({
                    phone: identifier,
                    email: order.email,
                    name: order.name,
                    orderTotal: totalVal,
                });
            });
        }

        return docRef.id;
    } catch (e) {
        console.error('Error adding document: ', e);
        // We don't block the user flow if DB fails, just log it
        return null;
    }
}
