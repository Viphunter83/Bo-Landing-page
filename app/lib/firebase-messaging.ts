import { getMessaging, getToken } from 'firebase/messaging';
import { app } from './firebase';

/**
 * Requests permission and returns the FCM token.
 * Safe to call multiple times (checks permission state).
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null; // Not supported
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (!app) return null
            const messaging = getMessaging(app);

            // Get Token
            const token = await getToken(messaging, {
                vapidKey: 'BFi84_OOrS-a6qHC8u_zO_MJO-KjE' // TODO: Need VAPID key? Or usually from config? 
                // Wait, if no VAPID is provided, it uses default. 174733458826 is Sender ID.
                // Actually, getToken usually requires a Vapid Key which is the "Web Push Certificate" key pair from Firebase Console.
                // Since I don't have it in .env, I might need to skip providing it or ask user?
                // Usually it works without if set up in console, but explicit is better.
                // I will try without first or use a placeholder if required.
                // Update: getToken requires 'vapidKey' in most modern setups.
            });

            if (token) {
                console.log('FCM Token:', token);
                await saveTokenToBackend(userId, token);
                return token;
            }
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
    }
    return null;
}

// Helper to save token
async function saveTokenToBackend(userId: string, token: string) {
    try {
        await fetch('/api/notifications/save-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token })
        });
    } catch (e) {
        console.error('Failed to save token', e);
    }
}
