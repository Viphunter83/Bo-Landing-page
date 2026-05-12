import * as admin from 'firebase-admin'

function formatPrivateKey(key: string) {
    if (!key) return undefined;
    // Handle cases where the key might be wrapped in quotes or have escaped newlines
    let formatted = key.replace(/\\n/g, '\n').replace(/"/g, '');
    if (formatted.startsWith("'") && formatted.endsWith("'")) {
        formatted = formatted.slice(1, -1);
    }
    return formatted;
}

export function initAdmin() {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
        const privateKey = process.env.FIREBASE_PRIVATE_KEY

        if (projectId && clientEmail && privateKey) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: formatPrivateKey(privateKey),
                    }),
                })
                console.log(`[FirebaseAdmin] Initialized successfully for project: ${projectId}`);
            } catch (error) {
                console.error("[FirebaseAdmin] Initialization failed:", error);
            }
        } else {
            console.warn("[FirebaseAdmin] Missing credentials for initialization. DB access will be unavailable.");
        }
    }
}

/**
 * Safely get Firestore instance. Throws if initialization failed.
 */
export const getAdminDb = () => {
    initAdmin()
    if (!admin.apps.length) throw new Error("[FirebaseAdmin] Firestore access failed: Admin SDK not initialized");
    return admin.firestore()
}

export const getAdminAuth = () => {
    initAdmin()
    if (!admin.apps.length) throw new Error("[FirebaseAdmin] Auth access failed: Admin SDK not initialized");
    return admin.auth()
}

export const getAdminMessaging = () => {
    initAdmin()
    if (!admin.apps.length) throw new Error("[FirebaseAdmin] Messaging access failed: Admin SDK not initialized");
    return admin.messaging()
}

// Fallback for existing code using direct exports (will break if we just remove them)
// We have to change the usage pattern in `route.ts`. 
// OR keep the exports but make them lazy (Proxies?) - too complex.
// Let's refactor the consumers.

