import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

export interface CustomerPreferences {
    hunger?: string;
    spice?: string;
    mood?: string;
    diet?: string[]; // e.g. ['keto', 'vegan']
}

export interface Customer {
    id: string; // Phone number normalized
    name?: string;
    email?: string;
    phone: string;

    totalOrders: number;
    totalSpent: number; // In AED
    lastOrderDate: any;
    firstSeenDate: any;

    preferences?: CustomerPreferences;
}

/**
 * Creates or updates a customer profile based on their phone number.
 * Designed to be "fire and forget" - doesn't block the UI.
 */
export const upsertCustomer = async (data: {
    phone: string;
    name?: string;
    email?: string;
    orderTotal: number;
    preferences?: CustomerPreferences;
}) => {
    if (!db) return;

    // Normalize phone: remove spaces, dashes. Ensure international format if possible.
    // For MVP, we assume the input is reasonably clean or just strip non-digits.
    const cleanPhone = data.phone.replace(/\D/g, '');

    if (!cleanPhone) return;

    const customerRef = doc(db, 'customers', cleanPhone);

    try {
        const snapshot = await getDoc(customerRef);

        if (snapshot.exists()) {
            // Update existing VIP
            await updateDoc(customerRef, {
                totalOrders: increment(1),
                totalSpent: increment(data.orderTotal),
                lastOrderDate: serverTimestamp(),
                // Update name/email only if provided and new (optional logic, here we overwrite to keep fresh)
                ...(data.name ? { name: data.name } : {}),
                ...(data.email ? { email: data.email } : {}),
                // Merge preferences (new ones overwrite old ones)
                ...(data.preferences ? { preferences: data.preferences } : {})
            });
            console.log(`Customer profile updated: ${cleanPhone}`);
        } else {
            // New Customer
            const newCustomer: Customer = {
                id: cleanPhone,
                phone: data.phone, // Keep original format for display
                name: data.name,
                email: data.email,
                totalOrders: 1,
                totalSpent: data.orderTotal,
                firstSeenDate: serverTimestamp(),
                lastOrderDate: serverTimestamp(),
                preferences: data.preferences
            };

            await setDoc(customerRef, newCustomer);
            console.log(`New Customer profile created: ${cleanPhone}`);
        }
    } catch (e) {
        console.error('Failed to upsert customer profile', e);
        // We do NOT throw here, so order flow is not interrupted
    }
};
